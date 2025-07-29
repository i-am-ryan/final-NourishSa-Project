import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptTaskRequest {
  task_id: string;
}

interface UpdateTaskRequest {
  status?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  completion_notes?: string;
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

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabaseClient.auth.setAuth(authHeader.replace('Bearer ', ''));
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const endpoint = pathParts[pathParts.length - 1];

    // GET /volunteer-api/tasks - Get available tasks
    if (req.method === 'GET' && endpoint === 'tasks') {
      const latitude = url.searchParams.get('lat');
      const longitude = url.searchParams.get('lng');
      const radius = url.searchParams.get('radius') || '15';
      const status = url.searchParams.get('status') || 'pending';

      let query = supabaseClient
        .from('volunteer_tasks')
        .select(`
          *,
          donation:donation_id(title, food_category, pickup_address, estimated_meals)
        `)
        .eq('status', status);

      if (status === 'pending') {
        query = query.is('volunteer_id', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by distance if coordinates provided
      let filteredData = data;
      if (latitude && longitude) {
        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);
        const maxRadius = parseFloat(radius);

        filteredData = data?.filter((task: any) => {
          const distance = calculateDistance(userLat, userLng, task.pickup_latitude, task.pickup_longitude);
          return distance <= maxRadius;
        }) || [];
      }

      return new Response(JSON.stringify({ tasks: filteredData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /volunteer-api/my-tasks - Get volunteer's tasks
    if (req.method === 'GET' && endpoint === 'my-tasks') {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('volunteer_tasks')
        .select(`
          *,
          donation:donation_id(title, food_category, pickup_address, donor:donor_id(full_name, phone))
        `)
        .eq('volunteer_id', user.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ tasks: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /volunteer-api/accept-task - Accept a volunteer task
    if (req.method === 'POST' && endpoint === 'accept-task') {
      const { task_id }: AcceptTaskRequest = await req.json();
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('volunteer_tasks')
        .update({
          volunteer_id: user.id,
          status: 'accepted',
        })
        .eq('id', task_id)
        .eq('status', 'pending') // Ensure task is still available
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ task: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /volunteer-api/tasks/{id} - Update task status
    if (req.method === 'PUT' && pathParts.includes('tasks')) {
      const taskId = pathParts[pathParts.length - 1];
      const updates: UpdateTaskRequest = await req.json();
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate points if task is completed
      let pointsAwarded = 0;
      if (updates.status === 'completed') {
        pointsAwarded = 25; // Base points for completing a task
        updates.actual_end_time = new Date().toISOString();
      }

      const { data, error } = await supabaseClient
        .from('volunteer_tasks')
        .update({
          ...updates,
          points_awarded: pointsAwarded,
        })
        .eq('id', taskId)
        .eq('volunteer_id', user.id) // Ensure user owns the task
        .select()
        .single();

      if (error) throw error;

      // Add points to volunteer rewards if task completed
      if (updates.status === 'completed') {
        await supabaseClient.from('volunteer_rewards').insert({
          volunteer_id: user.id,
          points_earned: pointsAwarded,
          reward_type: 'task_completion',
          description: 'Task completion bonus',
          task_id: taskId,
        });

        // Update donation status if pickup is completed
        if (data.task_type === 'pickup') {
          await supabaseClient
            .from('donations')
            .update({ status: 'picked_up' })
            .eq('id', data.donation_id);
        }
      }

      return new Response(JSON.stringify({ task: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /volunteer-api/leaderboard - Get volunteer leaderboard
    if (req.method === 'GET' && endpoint === 'leaderboard') {
      const { data, error } = await supabaseClient
        .from('volunteer_rewards')
        .select(`
          volunteer_id,
          sum(points_earned) as total_points,
          volunteer:volunteer_id(full_name, user_type)
        `)
        .group('volunteer_id')
        .order('total_points', { ascending: false })
        .limit(20);

      if (error) throw error;

      return new Response(JSON.stringify({ leaderboard: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /volunteer-api/stats/{id} - Get volunteer statistics
    if (req.method === 'GET' && pathParts.includes('stats')) {
      const volunteerId = pathParts[pathParts.length - 1];

      const [tasksResult, rewardsResult] = await Promise.all([
        supabaseClient
          .from('volunteer_tasks')
          .select('status')
          .eq('volunteer_id', volunteerId),
        supabaseClient
          .from('volunteer_rewards')
          .select('points_earned')
          .eq('volunteer_id', volunteerId)
      ]);

      if (tasksResult.error || rewardsResult.error) {
        throw tasksResult.error || rewardsResult.error;
      }

      const stats = {
        total_tasks: tasksResult.data?.length || 0,
        completed_tasks: tasksResult.data?.filter(t => t.status === 'completed').length || 0,
        total_points: rewardsResult.data?.reduce((sum, r) => sum + r.points_earned, 0) || 0,
        completion_rate: tasksResult.data?.length ? 
          (tasksResult.data?.filter(t => t.status === 'completed').length / tasksResult.data?.length * 100).toFixed(1) : 0
      };

      return new Response(JSON.stringify({ stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in volunteer-api:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

// Helper function to calculate distance between two coordinates
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

serve(handler);