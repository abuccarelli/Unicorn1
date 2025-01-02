import React, { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { useSession } from '../hooks/useSession';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  previouslyHadSession: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionData = useSession();

  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}