import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

export type PresenceStatus = 'online' | 'busy' | 'offline';

interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen: string;
}

const PRESENCE_CHANNEL = 'presence';
const HEARTBEAT_INTERVAL = 5000; // 5 seconds
const OFFLINE_THRESHOLD = 10000; // 10 seconds

export function usePresence(userId?: string) {
  const { user } = useAuthContext();
  const [status, setStatus] = useState<PresenceStatus>('offline');
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});

  useEffect(() => {
    let mounted = true;
    let channel: any = null;
    let heartbeatInterval: NodeJS.Timeout;

    const cleanup = async () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (channel) {
        try {
          await channel.untrack();
          await channel.unsubscribe();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
    };

    const initPresence = async () => {
      if (!user?.id || !mounted) return;

      // Clean up any existing channel first
      await cleanup();

      try {
        channel = supabase.channel(PRESENCE_CHANNEL);

        channel
          .on('presence', { event: 'sync' }, () => {
            if (!mounted) return;
            const state = channel.presenceState();
            const now = Date.now();
            const newPresenceMap: Record<string, UserPresence> = {};
            
            Object.values(state).forEach(presences => {
              if (Array.isArray(presences) && presences.length > 0) {
                const presence = presences[0] as UserPresence;
                const lastSeen = new Date(presence.last_seen).getTime();
                
                // Only include users seen within threshold
                if (now - lastSeen <= OFFLINE_THRESHOLD) {
                  newPresenceMap[presence.user_id] = presence;
                }
              }
            });
            
            setPresenceMap(newPresenceMap);
          })
          .on('presence', { event: 'join' }, ({ newPresence }: any) => {
            if (!mounted || !Array.isArray(newPresence) || !newPresence.length) return;
            const presence = newPresence[0] as UserPresence;
            setPresenceMap(prev => ({ ...prev, [presence.user_id]: presence }));
          })
          .on('presence', { event: 'leave' }, ({ leftPresence }: any) => {
            if (!mounted || !Array.isArray(leftPresence) || !leftPresence.length) return;
            const presence = leftPresence[0] as UserPresence;
            setPresenceMap(prev => {
              const newMap = { ...prev };
              delete newMap[presence.user_id];
              return newMap;
            });
          });

        await channel.subscribe();
        
        // Track initial presence
        await channel.track({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString()
        });

        if (mounted) {
          setStatus('online');
        }

        // Set up heartbeat
        heartbeatInterval = setInterval(async () => {
          if (!mounted) return;
          try {
            await channel.track({
              user_id: user.id,
              status: status === 'busy' ? 'busy' : 'online',
              last_seen: new Date().toISOString()
            });
          } catch (error) {
            console.error('Heartbeat error:', error);
          }
        }, HEARTBEAT_INTERVAL);
      } catch (error) {
        console.error('Presence error:', error);
        if (mounted) {
          setStatus('offline');
        }
      }
    };

    initPresence();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [user]);

  const updateStatus = useCallback(async (newStatus: PresenceStatus) => {
    if (!user?.id) return;
    
    try {
      const channel = supabase.channel(PRESENCE_CHANNEL);
      await channel.track({
        user_id: user.id,
        status: newStatus,
        last_seen: new Date().toISOString()
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [user]);

  const getUserStatus = useCallback((targetUserId?: string): PresenceStatus => {
    if (!targetUserId) return status;
    
    const presence = presenceMap[targetUserId];
    if (!presence) return 'offline';

    const lastSeen = new Date(presence.last_seen).getTime();
    if (Date.now() - lastSeen > OFFLINE_THRESHOLD) {
      return 'offline';
    }

    return presence.status;
  }, [presenceMap, status]);

  return {
    status: getUserStatus(userId),
    updateStatus
  };
}