import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateDonationRequest {
  title: string;
  description?: string;
  food_category: string;
  quantity: string;
  expiry_date?: string;
  pickup_time_start: string;
  pickup_time_end: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  images?: string[];
  dietary_info?: any;
  allergen_info?: string[];
  special_instructions?: string;
  estimated_meals?: number;
}

interface UpdateDonationRequest {
  title?: string;
  description?: string;
  quantity?: string;
  pickup_time_start?: string;
  pickup_time_end?: string;
  status?: string;
  special_instructions?: string;
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
    const path = url.pathname.split('/').pop();

    // GET /donations - List donations with filters
    if (req.method === 'GET' && !path) {
      const status = url.searchParams.get('status') || 'available';
      const category = url.searchParams.get('category');
      const latitude = url.searchParams.get('lat');
      const longitude = url.searchParams.get('lng');
      const radius = url.searchParams.get('radius') || '10';

      let query = supabaseClient
        .from('donations')
        .select(`
          *,
          donor:donor_id(full_name, phone, user_type),
          claimed_user:claimed_by(full_name, phone)
        `)
        .eq('status', status);

      if (category) {
        query = query.eq('food_category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by distance if coordinates provided
      let filteredData = data;
      if (latitude && longitude) {
        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);
        const maxRadius = parseFloat(radius);

        filteredData = data?.filter((donation: any) => {
          const distance = calculateDistance(userLat, userLng, donation.latitude, donation.longitude);
          return distance <= maxRadius;
        }) || [];
      }

      return new Response(JSON.stringify({ donations: filteredData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /donations/{id} - Get specific donation
    if (req.method === 'GET' && path) {
      const { data, error } = await supabaseClient
        .from('donations')
        .select(`
          *,
          donor:donor_id(full_name, phone, user_type, whatsapp_number),
          claimed_user:claimed_by(full_name, phone),
          volunteer_tasks(*)
        `)
        .eq('id', path)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ donation: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /donations - Create new donation
    if (req.method === 'POST' && !path) {
      const donation: CreateDonationRequest = await req.json();
      
      // Get user from auth header
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('donations')
        .insert({
          ...donation,
          donor_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create a volunteer task for this donation
      const taskData = {
        donation_id: data.id,
        task_type: 'pickup',
        pickup_location: donation.pickup_address,
        pickup_latitude: donation.latitude,
        pickup_longitude: donation.longitude,
        scheduled_time: donation.pickup_time_start,
        estimated_duration: 30,
        instructions: `Pickup: ${donation.title} (${donation.quantity})`,
      };

      await supabaseClient.from('volunteer_tasks').insert(taskData);

      // Update user's total donations count
      await supabaseClient
        .from('user_profiles')
        .update({ total_donations: supabaseClient.raw('total_donations + 1') })
        .eq('id', user.id);

      return new Response(JSON.stringify({ donation: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /donations/{id} - Update donation
    if (req.method === 'PUT' && path) {
      const updates: UpdateDonationRequest = await req.json();
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('donations')
        .update(updates)
        .eq('id', path)
        .eq('donor_id', user.id) // Ensure user owns the donation
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ donation: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /donations/{id}/claim - Claim a donation
    if (req.method === 'POST' && path?.includes('claim')) {
      const donationId = path.replace('/claim', '');
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('donations')
        .update({
          status: 'claimed',
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', donationId)
        .eq('status', 'available') // Ensure it's still available
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ donation: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in donations-api:', error);
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