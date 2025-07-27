import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lrvgennjbmmbtpywloem.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxydmdlbm5qYm1tYnRweXdsb2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTU4NDMsImV4cCI6MjA2ODg3MTg0M30.2OeaLWWKu38gS4smXpDIpYMkNrRTAO3m_P4BMEEWt40";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },
};

// Database helper functions
export const db = {
  // Get user profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  // Get donations
  getDonations: async (filters?: any) => {
    let query = supabase
      .from('donations')
      .select(`
        *,
        donor:donor_id(full_name, phone, user_type),
        claimed_user:claimed_by(full_name, phone)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category) {
      query = query.eq('food_category', filters.category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Get volunteer tasks
  getVolunteerTasks: async (volunteerId: string) => {
    const { data, error } = await supabase
      .from('volunteer_tasks')
      .select(`
        *,
        donation:donation_id(title, food_category, pickup_address, donor:donor_id(full_name, phone))
      `)
      .eq('volunteer_id', volunteerId)
      .order('scheduled_time', { ascending: true });
    return { data, error };
  },

  // Get available tasks
  getAvailableTasks: async (filters?: any) => {
    let query = supabase
      .from('volunteer_tasks')
      .select(`
        *,
        donation:donation_id(title, food_category, pickup_address, estimated_meals)
      `)
      .eq('status', 'pending')
      .is('volunteer_id', null);

    if (filters?.category) {
      query = query.eq('donation.food_category', filters.category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to donations changes
  subscribeToDonations: (callback: (payload: any) => void) => {
    return supabase
      .channel('donations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'donations',
      }, callback)
      .subscribe();
  },

  // Subscribe to volunteer tasks changes
  subscribeToVolunteerTasks: (callback: (payload: any) => void) => {
    return supabase
      .channel('volunteer_tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'volunteer_tasks',
      }, callback)
      .subscribe();
  },

  // Subscribe to user profile changes
  subscribeToProfile: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      }, callback)
      .subscribe();
  },
};

// Storage helper functions
export const storage = {
  // Upload image
  uploadImage: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file);
    return { data, error };
  },

  // Get image URL
  getImageUrl: (path: string) => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete image
  deleteImage: async (path: string) => {
    const { data, error } = await supabase.storage
      .from('images')
      .remove([path]);
    return { data, error };
  },
};

export default supabase; 