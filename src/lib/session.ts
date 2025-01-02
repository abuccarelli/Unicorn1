import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function refreshSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.refreshSession();
  return session;
}

export function onSessionChange(
  callback: (session: Session | null, event: string) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session, event);
  });
}