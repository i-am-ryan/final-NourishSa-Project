import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  user_id: string;
  user_type: 'donor' | 'recipient' | 'volunteer';
  latitude: number;
  longitude: number;
  radius_km?: number;
  preferences?: {
    food_categories?: string[];
    dietary_restrictions?: string[];
    max_distance_km?: number;
  };
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

    // POST /matching-engine/find-matches - Smart matching algorithm
    if (req.method === 'POST' && endpoint === 'find-matches') {
      const matchRequest: MatchRequest = await req.json();
      const { user_type, latitude, longitude, radius_km = 10, preferences = {} } = matchRequest;

      let matches: any[] = [];

      if (user_type === 'recipient') {
        // Find nearby available donations for recipients
        let query = supabaseClient
          .from('donations')
          .select(`
            *,
            donor:donor_id(full_name, phone, whatsapp_number)
          `)
          .eq('status', 'available');

        // Filter by food categories if specified
        if (preferences.food_categories?.length) {
          query = query.in('food_category', preferences.food_categories);
        }

        const { data: donations, error } = await query;
        if (error) throw error;

        // Calculate distances and filter
        matches = donations
          ?.map((donation: any) => ({
            ...donation,
            distance_km: calculateDistance(
              latitude, longitude, 
              donation.latitude, donation.longitude
            ),
            match_score: calculateDonationMatchScore(donation, preferences)
          }))
          .filter((donation: any) => donation.distance_km <= radius_km)
          .sort((a: any, b: any) => b.match_score - a.match_score) || [];

      } else if (user_type === 'volunteer') {
        // Find nearby volunteer tasks for volunteers
        const { data: tasks, error } = await supabaseClient
          .from('volunteer_tasks')
          .select(`
            *,
            donation:donation_id(title, food_category, estimated_meals)
          `)
          .eq('status', 'pending')
          .is('volunteer_id', null);

        if (error) throw error;

        // Calculate distances and potential points
        matches = tasks
          ?.map((task: any) => ({
            ...task,
            distance_km: calculateDistance(
              latitude, longitude,
              task.pickup_latitude, task.pickup_longitude
            ),
            points_potential: calculateTaskPoints(task),
            urgency_score: calculateTaskUrgency(task)
          }))
          .filter((task: any) => task.distance_km <= radius_km)
          .sort((a: any, b: any) => (b.urgency_score * 0.6) + (b.points_potential * 0.4) - (a.distance_km * 0.1))
          || [];

      } else if (user_type === 'donor') {
        // Find nearby recipients and food hubs for donors
        const [recipientsResult, hubsResult] = await Promise.all([
          supabaseClient
            .from('user_profiles')
            .select('id, full_name, phone, latitude, longitude, dietary_preferences')
            .eq('user_type', 'recipient')
            .not('latitude', 'is', null),
          supabaseClient
            .from('food_hubs')
            .select('*')
            .eq('verification_status', 'verified')
        ]);

        if (recipientsResult.error || hubsResult.error) {
          throw recipientsResult.error || hubsResult.error;
        }

        // Combine recipients and hubs
        const recipients = recipientsResult.data?.map((recipient: any) => ({
          ...recipient,
          type: 'recipient',
          distance_km: calculateDistance(latitude, longitude, recipient.latitude, recipient.longitude)
        })).filter((r: any) => r.distance_km <= radius_km) || [];

        const hubs = hubsResult.data?.map((hub: any) => ({
          ...hub,
          type: 'food_hub',
          distance_km: calculateDistance(latitude, longitude, hub.latitude, hub.longitude)
        })).filter((h: any) => h.distance_km <= radius_km) || [];

        matches = [...recipients, ...hubs].sort((a: any, b: any) => a.distance_km - b.distance_km);
      }

      return new Response(JSON.stringify({ 
        matches: matches.slice(0, 20), // Limit to top 20 matches
        total_count: matches.length,
        user_type,
        search_radius_km: radius_km
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /matching-engine/nearby-hubs - Get nearby food hubs
    if (req.method === 'GET' && endpoint === 'nearby-hubs') {
      const latitude = parseFloat(url.searchParams.get('lat') || '0');
      const longitude = parseFloat(url.searchParams.get('lng') || '0');
      const radius = parseFloat(url.searchParams.get('radius') || '10');

      const { data: hubs, error } = await supabaseClient
        .from('food_hubs')
        .select('*')
        .eq('verification_status', 'verified');

      if (error) throw error;

      const nearbyHubs = hubs
        ?.map((hub: any) => ({
          ...hub,
          distance_km: calculateDistance(latitude, longitude, hub.latitude, hub.longitude)
        }))
        .filter((hub: any) => hub.distance_km <= radius)
        .sort((a: any, b: any) => a.distance_km - b.distance_km) || [];

      return new Response(JSON.stringify({ hubs: nearbyHubs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /matching-engine/route-optimization - Calculate optimal routes
    if (req.method === 'POST' && endpoint === 'route-optimization') {
      const { start_location, waypoints } = await req.json();
      
      // Simple route optimization (in production, use Google Maps API or similar)
      const optimizedRoute = waypoints.map((point: any, index: number) => ({
        ...point,
        stop_number: index + 1,
        estimated_distance_km: calculateDistance(
          start_location.latitude, start_location.longitude,
          point.latitude, point.longitude
        )
      })).sort((a: any, b: any) => a.estimated_distance_km - b.estimated_distance_km);

      const totalDistance = optimizedRoute.reduce((sum: number, point: any) => sum + point.estimated_distance_km, 0);
      const estimatedDuration = Math.ceil(totalDistance * 2.5 + waypoints.length * 10); // Rough estimate in minutes

      return new Response(JSON.stringify({
        optimized_route: optimizedRoute,
        total_distance_km: totalDistance.toFixed(2),
        estimated_duration_minutes: estimatedDuration
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in matching-engine:', error);
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
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateDonationMatchScore(donation: any, preferences: any): number {
  let score = 100; // Base score

  // Boost score for urgency (expiring soon)
  if (donation.expiry_date) {
    const hoursUntilExpiry = (new Date(donation.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilExpiry < 24) score += 30;
    else if (hoursUntilExpiry < 48) score += 15;
  }

  // Boost for estimated meals
  if (donation.estimated_meals) {
    score += Math.min(donation.estimated_meals * 2, 20);
  }

  // Dietary preferences match
  if (preferences.dietary_restrictions?.length && donation.dietary_info) {
    const matches = preferences.dietary_restrictions.filter((restriction: string) => 
      donation.dietary_info[restriction] === true
    ).length;
    score += matches * 10;
  }

  return score;
}

function calculateTaskPoints(task: any): number {
  let points = 10; // Base points
  
  // Time-based urgency
  const hoursOld = (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60);
  points += Math.min(hoursOld, 24); // Up to 24 bonus points for older tasks
  
  // Estimated meals bonus
  if (task.donation?.estimated_meals) {
    points += task.donation.estimated_meals;
  }
  
  return Math.round(points);
}

function calculateTaskUrgency(task: any): number {
  let urgency = 50; // Base urgency
  
  // Time since created
  const hoursOld = (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60);
  urgency += hoursOld * 2;
  
  // Scheduled time proximity
  const hoursUntilScheduled = (new Date(task.scheduled_time).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilScheduled < 2) urgency += 30;
  else if (hoursUntilScheduled < 6) urgency += 15;
  
  return Math.min(urgency, 100);
}

serve(handler);