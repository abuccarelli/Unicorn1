import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSession, refreshSession, onSessionChange } from '../lib/session';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [previouslyHadSession, setPreviouslyHadSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    getSession().then(session => {
      if (mounted) {
        setSession(session);
        if (session) setPreviouslyHadSession(true);
        setLoading(false);
      }
    });

    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      if (mounted) {
        const newSession = await refreshSession();
        if (newSession) {
          setSession(newSession);
          setPreviouslyHadSession(true);
        } else if (session) {
          setSession(null);
        }
      }
    }, 4 * 60 * 1000);

    // Listen for auth changes
    const { data: { subscription } } = onSessionChange((session, event) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setPreviouslyHadSession(false); // Reset on explicit sign out
        } else {
          setSession(session);
          if (session) setPreviouslyHadSession(true);
        }
      }
    });

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, previouslyHadSession };
}