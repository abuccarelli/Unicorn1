import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../context/AuthContext';
import { usePresence } from '../../hooks/usePresence';

// ... rest of the imports and interface ...

export function VideoChat({ conversationId, remoteUserId, onEnd }: VideoChatProps) {
  const { user } = useAuthContext();
  const { updateStatus } = usePresence();
  
  // ... existing state and refs ...

  useEffect(() => {
    // Set status to busy when call starts
    updateStatus('busy');

    return () => {
      // Reset status when call ends
      updateStatus('online');
    };
  }, [updateStatus]);

  // ... rest of the component implementation ...
}