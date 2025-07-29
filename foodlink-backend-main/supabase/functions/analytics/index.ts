import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  user_id?: string;
  event_type: string;
  event_data?: any;
  session_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    // POST /analytics/track - Track analytics event
    if (req.method === 'POST' && endpoint === 'track') {
      const event: AnalyticsEvent = await req.json();
      
      const { data, error } = await supabaseClient
        .from('analytics_events')
        .insert({
          user_id: event.user_id,
          event_type: event.event_type,
          event_data: event.event_data || {},
          session_id: event.session_id,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ event: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /analytics/impact - Get platform impact metrics
    if (req.method === 'GET' && endpoint === 'impact') {
      const [
        donationsResult,
        completedTasksResult,
        volunteersResult,
        mealsResult
      ] = await Promise.all([
        // Total donations
        supabaseClient
          .from('donations')
          .select('count', { count: 'exact' }),
        
        // Completed volunteer tasks
        supabaseClient
          .from('volunteer_tasks')
          .select('count', { count: 'exact' })
          .eq('status', 'completed'),
        
        // Active volunteers
        supabaseClient
          .from('user_profiles')
          .select('count', { count: 'exact' })
          .eq('user_type', 'volunteer'),
        
        // Total estimated meals provided
        supabaseClient
          .from('donations')
          .select('estimated_meals')
          .not('estimated_meals', 'is', null)
      ]);

      const totalMeals = mealsResult.data?.reduce((sum: number, donation: any) => 
        sum + (donation.estimated_meals || 0), 0) || 0;

      // Calculate CO2 saved (rough estimate: 1 meal = 0.5kg CO2 saved)
      const co2SavedKg = Math.round(totalMeals * 0.5);

      const impact = {
        total_donations: donationsResult.count || 0,
        total_volunteers: volunteersResult.count || 0,
        completed_tasks: completedTasksResult.count || 0,
        meals_provided: totalMeals,
        co2_saved_kg: co2SavedKg,
        waste_prevented_kg: Math.round(totalMeals * 0.3), // Rough estimate
      };

      return new Response(JSON.stringify({ impact }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /analytics/user/{id} - Get user-specific analytics
    if (req.method === 'GET' && url.pathname.includes('/user/')) {
      const userId = url.pathname.split('/').pop();

      const { data: user, error: userError } = await supabaseClient
        .from('user_profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let analytics = {};

      if (user.user_type === 'donor') {
        const [donationsResult, impactResult] = await Promise.all([
          supabaseClient
            .from('donations')
            .select('status, created_at, estimated_meals')
            .eq('donor_id', userId),
          
          supabaseClient
            .from('donations')
            .select('estimated_meals')
            .eq('donor_id', userId)
            .not('estimated_meals', 'is', null)
        ]);

        const totalMeals = impactResult.data?.reduce((sum: number, d: any) => 
          sum + (d.estimated_meals || 0), 0) || 0;

        analytics = {
          user_type: 'donor',
          total_donations: donationsResult.data?.length || 0,
          active_donations: donationsResult.data?.filter(d => d.status === 'available').length || 0,
          completed_donations: donationsResult.data?.filter(d => d.status === 'delivered').length || 0,
          total_meals_provided: totalMeals,
          co2_impact_kg: Math.round(totalMeals * 0.5),
        };

      } else if (user.user_type === 'volunteer') {
        const [tasksResult, rewardsResult] = await Promise.all([
          supabaseClient
            .from('volunteer_tasks')
            .select('status, created_at, points_awarded')
            .eq('volunteer_id', userId),
          
          supabaseClient
            .from('volunteer_rewards')
            .select('points_earned, created_at')
            .eq('volunteer_id', userId)
        ]);

        analytics = {
          user_type: 'volunteer',
          total_tasks: tasksResult.data?.length || 0,
          completed_tasks: tasksResult.data?.filter(t => t.status === 'completed').length || 0,
          total_points: rewardsResult.data?.reduce((sum: number, r: any) => sum + r.points_earned, 0) || 0,
          completion_rate: tasksResult.data?.length ? 
            ((tasksResult.data?.filter(t => t.status === 'completed').length / tasksResult.data?.length) * 100).toFixed(1) : 0,
        };

      } else if (user.user_type === 'recipient') {
        const claimedResult = await supabaseClient
          .from('donations')
          .select('*')
          .eq('claimed_by', userId);

        analytics = {
          user_type: 'recipient',
          total_claimed: claimedResult.data?.length || 0,
          received_donations: claimedResult.data?.filter(d => d.status === 'delivered').length || 0,
        };
      }

      return new Response(JSON.stringify({ analytics }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /analytics/geographic - Get geographic distribution data
    if (req.method === 'GET' && endpoint === 'geographic') {
      const [donationsResult, usersResult, hubsResult] = await Promise.all([
        supabaseClient
          .from('donations')
          .select('latitude, longitude, status, food_category'),
        
        supabaseClient
          .from('user_profiles')
          .select('latitude, longitude, user_type')
          .not('latitude', 'is', null),
        
        supabaseClient
          .from('food_hubs')
          .select('latitude, longitude, name')
      ]);

      const geographic = {
        donations: donationsResult.data || [],
        users: usersResult.data || [],
        food_hubs: hubsResult.data || [],
        heatmap_data: generateHeatmapData(donationsResult.data || [])
      };

      return new Response(JSON.stringify({ geographic }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /analytics/dashboard - Admin dashboard data
    if (req.method === 'GET' && endpoint === 'dashboard') {
      const timeframe = url.searchParams.get('timeframe') || '30days';
      const daysBack = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90;
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const [
        recentDonations,
        recentTasks,
        userGrowth,
        topVolunteers,
        platformStats
      ] = await Promise.all([
        // Recent donations trend
        supabaseClient
          .from('donations')
          .select('created_at, status, food_category')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true }),
        
        // Recent tasks trend
        supabaseClient
          .from('volunteer_tasks')
          .select('created_at, status')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true }),
        
        // User growth
        supabaseClient
          .from('user_profiles')
          .select('created_at, user_type')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true }),
        
        // Top volunteers
        supabaseClient
          .from('volunteer_rewards')
          .select(`
            volunteer_id,
            sum(points_earned) as total_points,
            volunteer:volunteer_id(full_name)
          `)
          .gte('created_at', startDate)
          .group('volunteer_id')
          .order('total_points', { ascending: false })
          .limit(10),
        
        // Platform statistics
        supabaseClient
          .from('analytics_events')
          .select('event_type, created_at')
          .gte('created_at', startDate)
      ]);

      const dashboard = {
        timeframe,
        donations_trend: groupByDay(recentDonations.data || []),
        tasks_trend: groupByDay(recentTasks.data || []),
        user_growth: groupByDay(userGrowth.data || []),
        top_volunteers: topVolunteers.data || [],
        event_analytics: analyzeEvents(platformStats.data || []),
      };

      return new Response(JSON.stringify({ dashboard }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

// Helper functions
function generateHeatmapData(donations: any[]): any[] {
  // Group donations by approximate location for heatmap
  const locationGroups: { [key: string]: number } = {};
  
  donations.forEach(donation => {
    const lat = Math.round(donation.latitude * 100) / 100; // Round to 2 decimal places
    const lng = Math.round(donation.longitude * 100) / 100;
    const key = `${lat},${lng}`;
    locationGroups[key] = (locationGroups[key] || 0) + 1;
  });

  return Object.entries(locationGroups).map(([location, count]) => {
    const [lat, lng] = location.split(',').map(Number);
    return { latitude: lat, longitude: lng, intensity: count };
  });
}

function groupByDay(data: any[]): any[] {
  const groups: { [key: string]: number } = {};
  
  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    groups[date] = (groups[date] || 0) + 1;
  });

  return Object.entries(groups).map(([date, count]) => ({ date, count }));
}

function analyzeEvents(events: any[]): any {
  const eventCounts: { [key: string]: number } = {};
  
  events.forEach(event => {
    eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
  });

  return {
    total_events: events.length,
    event_breakdown: eventCounts,
    top_events: Object.entries(eventCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([event, count]) => ({ event_type: event, count }))
  };
}

serve(handler);