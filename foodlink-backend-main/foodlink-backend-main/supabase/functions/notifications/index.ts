import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendNotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_for?: string;
  metadata?: any;
  send_whatsapp?: boolean;
  send_push?: boolean;
}

interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'text' | 'template';
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

    // POST /notifications/send - Send notification
    if (req.method === 'POST' && endpoint === 'send') {
      const notification: SendNotificationRequest = await req.json();

      // Save notification to database
      const { data: savedNotification, error: dbError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority || 'normal',
          scheduled_for: notification.scheduled_for,
          metadata: notification.metadata || {},
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Get user details for contact info
      const { data: user, error: userError } = await supabaseClient
        .from('user_profiles')
        .select('whatsapp_number, phone, email, full_name')
        .eq('id', notification.user_id)
        .single();

      if (userError) throw userError;

      const responses: any = {
        notification_id: savedNotification.id,
        in_app: true,
        whatsapp: false,
        push: false,
      };

      // Send WhatsApp message if requested and number available
      if (notification.send_whatsapp && user.whatsapp_number) {
        try {
          const whatsappResponse = await sendWhatsAppMessage({
            to: user.whatsapp_number,
            message: `*${notification.title}*\n\n${notification.message}\n\n_NourishSA Team_`,
            type: 'text'
          });
          responses.whatsapp = whatsappResponse.success;
          responses.whatsapp_details = whatsappResponse;
        } catch (error) {
          console.error('WhatsApp send failed:', error);
          responses.whatsapp_error = error.message;
        }
      }

      // Send push notification if requested
      if (notification.send_push) {
        try {
          // In production, integrate with Firebase Cloud Messaging or similar
          const pushResponse = await sendPushNotification({
            user_id: notification.user_id,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata,
          });
          responses.push = pushResponse.success;
          responses.push_details = pushResponse;
        } catch (error) {
          console.error('Push notification failed:', error);
          responses.push_error = error.message;
        }
      }

      return new Response(JSON.stringify(responses), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /notifications/{user_id} - Get user notifications
    if (req.method === 'GET' && endpoint !== 'send') {
      const userId = endpoint;
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const unread_only = url.searchParams.get('unread_only') === 'true';

      let query = supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unread_only) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ notifications: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /notifications/{id}/read - Mark notification as read
    if (req.method === 'PUT' && url.pathname.includes('/read')) {
      const notificationId = url.pathname.split('/')[2];

      const { data, error } = await supabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ notification: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /notifications/send-bulk - Send bulk notifications
    if (req.method === 'POST' && endpoint === 'send-bulk') {
      const { user_ids, type, title, message, priority = 'normal' } = await req.json();

      const notifications = user_ids.map((user_id: string) => ({
        user_id,
        type,
        title,
        message,
        priority,
      }));

      const { data, error } = await supabaseClient
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        notifications: data,
        sent_count: data.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /notifications/donation-updates - Send donation-related notifications
    if (req.method === 'POST' && endpoint === 'donation-updates') {
      const { donation_id, event_type, custom_message } = await req.json();

      // Get donation details
      const { data: donation, error: donationError } = await supabaseClient
        .from('donations')
        .select(`
          *,
          donor:donor_id(id, full_name, whatsapp_number),
          claimed_user:claimed_by(id, full_name, whatsapp_number)
        `)
        .eq('id', donation_id)
        .single();

      if (donationError) throw donationError;

      const notifications = [];

      // Generate notification based on event type
      switch (event_type) {
        case 'donation_claimed':
          if (donation.donor) {
            notifications.push({
              user_id: donation.donor.id,
              type: 'donation_update',
              title: 'Donation Claimed! 🎉',
              message: `Great news! Your donation "${donation.title}" has been claimed by ${donation.claimed_user?.full_name}. A volunteer will pick it up soon.`,
              priority: 'high',
              send_whatsapp: true,
            });
          }
          break;

        case 'pickup_assigned':
          const volunteerData = await supabaseClient
            .from('volunteer_tasks')
            .select('volunteer:volunteer_id(id, full_name)')
            .eq('donation_id', donation_id)
            .single();

          if (donation.donor && volunteerData.data) {
            notifications.push({
              user_id: donation.donor.id,
              type: 'pickup_update',
              title: 'Volunteer Assigned 🚚',
              message: `${volunteerData.data.volunteer.full_name} will pick up your donation "${donation.title}" soon. Thank you for your generosity!`,
              priority: 'high',
              send_whatsapp: true,
            });
          }
          break;

        case 'donation_delivered':
          if (donation.donor) {
            notifications.push({
              user_id: donation.donor.id,
              type: 'delivery_update',
              title: 'Donation Delivered! ✅',
              message: `Your donation "${donation.title}" has been successfully delivered. You've helped make a difference in someone's life!`,
              priority: 'high',
              send_whatsapp: true,
            });
          }
          break;

        case 'custom':
          if (custom_message && donation.donor) {
            notifications.push({
              user_id: donation.donor.id,
              type: 'custom',
              title: 'NourishSA Update',
              message: custom_message,
              priority: 'normal',
              send_whatsapp: true,
            });
          }
          break;
      }

      // Send all notifications
      const results = [];
      for (const notif of notifications) {
        const response = await fetch(`${req.url.replace('/donation-updates', '/send')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notif),
        });
        results.push(await response.json());
      }

      return new Response(JSON.stringify({ 
        event_type,
        notifications_sent: results.length,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

serve(async (req) => {
  if (req.method === 'POST' && req.url.endsWith('/send')) {
    const { email, type } = await req.json();
    if (type === 'verification') {
      const { error } = await supabase.auth.resend({
        email,
        type: 'signup',
        options: { emailRedirectTo: 'https://nourish-two.vercel.app/auth/callback' },
      });
      return new Response(JSON.stringify({ error: error?.message }), { status: error ? 400 : 200 });
    }
  }
  return new Response('Method not allowed', { status: 405 });
});
// WhatsApp integration with actual API
async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<any> {
  try {
    if (!Deno.env.get('WHATSAPP_ACCESS_TOKEN') || !Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')) {
      console.log('WhatsApp credentials not configured, skipping WhatsApp message');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const whatsappUrl = `https://graph.facebook.com/v17.0/${Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
    
    const messageData = {
      messaging_product: 'whatsapp',
      to: message.to.replace(/[^0-9]/g, ''), // Clean phone number
      type: 'text',
      text: { body: message.message }
    };

    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    const result = await response.json();
    
    return {
      success: response.ok,
      message_id: result.messages?.[0]?.id || `whatsapp_${Date.now()}`,
      status: response.ok ? 'sent' : 'failed',
      to: message.to,
      response: result
    };
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return {
      success: false,
      error: error.message,
      to: message.to
    };
  }
}

// Push notification integration (placeholder - integrate with FCM or similar)
async function sendPushNotification(notification: any): Promise<any> {
  // In production, integrate with Firebase Cloud Messaging or similar
  console.log('Push notification to be sent:', notification);
  
  return {
    success: true,
    message_id: `push_${Date.now()}`,
    status: 'sent',
    user_id: notification.user_id,
  };
}

serve(handler);