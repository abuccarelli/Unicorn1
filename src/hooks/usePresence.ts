import { useEffect, useState, useCallback, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (channelRef.current) {
      try {
        await channelRef.current.untrack();
        await channelRef.current.unsubscribe();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  }, []);

  // Initialize presence
  useEffect(() => {
    if (!user?.id) return;

    const initPresence = async () => {
      // Clean up any existing channel first
      await cleanup();

      try {
        const channel = supabase.channel(PRESENCE_CHANNEL);
        channelRef.current = channel;

        channel
          .on('presence', { event: 'sync' }, () => {
            if (!mounted.current) return;
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
            if (!mounted.current || !Array.isArray(newPresence) || !newPresence.length) return;
            const presence = newPresence[0] as UserPresence;
            setPresenceMap(prev => ({ ...prev, [presence.user_id]: presence }));
          })
          .on('presence', { event: 'leave' }, ({ leftPresence }: any) => {
            if (!mounted.current || !Array.isArray(leftPresence) || !leftPresence.length) return;
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

        if (mounted.current) {
          setStatus('online');
        }

        // Set up heartbeat with debouncing
        let heartbeatTimeout: NodeJS.Timeout;
        heartbeatIntervalRef.current = setInterval(async () => {
          if (!mounted.current) return;
          clearTimeout(heartbeatTimeout);
          heartbeatTimeout = setTimeout(async () => {
            try {
              await channel.track({
                user_id: user.id,
                status: status === 'busy' ? 'busy' : 'online',
                last_seen: new Date().toISOString()
              });
            } catch (error) {
              console.error('Heartbeat error:', error);
            }
          }, 100); // Debounce heartbeats
        }, HEARTBEAT_INTERVAL);

      } catch (error) {
        console.error('Presence error:', error);
        if (mounted.current) {
          setStatus('offline');
        }
      }
    };

    initPresence();

    return () => {
      mounted.current = false;
      cleanup();
    };
  }, [user, cleanup]);

  // Update status handler
  const updateStatus = useCallback(async (newStatus: PresenceStatus) => {
    if (!user?.id || !channelRef.current) return;
    
    try {
      await channelRef.current.track({
        user_id: user.id,
        status: newStatus,
        last_seen: new Date().toISOString()
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [user]);

  // Get user status with caching
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