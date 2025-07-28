import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lrvgennjbmmbtpywloem.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxydmdlbm5qYm1tYnRweXdsb2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTU4NDMsImV4cCI6MjA2ODg3MTg0M30.2OeaLWWKu38gS4smXpDIpYMkNrRTAO3m_P4BMEEWt40";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    detectSessionInUrl: true,
  },
});

export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData?.full_name || '',
          phone: userData?.phone || '',
          user_type: userData?.user_type || 'recipient',
        },
        emailRedirectTo: 'https://nourish-two.vercel.app/auth/callback', // Updated to match frontend
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

export default supabase;