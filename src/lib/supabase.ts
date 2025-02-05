import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'educonnect'
    }
  }
});

// Add error handling for auth operations
const handleAuthError = (error: any) => {
  if (error.message === 'Invalid login credentials') {
    return 'Incorrect email or password';
  }
  if (error.message?.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (error.message?.includes('refresh_token_not_found')) {
    // Handle expired/invalid refresh token by signing out
    supabase.auth.signOut();
    return 'Your session has expired. Please sign in again.';
  }
  return error.message || 'An error occurred during authentication';
};

// Wrap auth methods with error handling
const auth = {
  ...supabase.auth,
  signInWithPassword: async (credentials: { email: string; password: string }) => {
    try {
      const response = await supabase.auth.signInWithPassword(credentials);
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw new Error(handleAuthError(error));
    }
  },
  signUp: async (credentials: { email: string; password: string; options?: any }) => {
    try {
      const response = await supabase.auth.signUp(credentials);
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw new Error(handleAuthError(error));
    }
  }
};

export { auth };
export const storage = supabase.storage;