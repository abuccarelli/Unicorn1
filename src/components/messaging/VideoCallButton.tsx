import React, { useState } from 'react';
import { Video } from 'lucide-react';
import { VideoChat } from '../videochat/VideoChat';
import { usePresence } from '../../hooks/usePresence';

interface VideoCallButtonProps {
  conversationId: string;
  remoteUserId: string;
}

export function VideoCallButton({ conversationId, remoteUserId }: VideoCallButtonProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const { status } = usePresence(remoteUserId);
  const isOnline = status === 'online';

  return (
    <>
      <button
        onClick={() => setIsCallActive(true)}
        disabled={!isOnline}
        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white
          ${isOnline 
            ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
            : 'bg-gray-400 cursor-not-allowed'}
          focus:outline-none focus:ring-2 focus:ring-offset-2`}
        title={isOnline ? 'Start video call' : 'User is not online'}
      >
        <Video className="h-5 w-5 mr-2" />
        {isOnline ? 'Start Video Call' : 'User Offline'}
      </button>

      {isCallActive && (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoChat
            conversationId={conversationId}
            remoteUserId={remoteUserId}
            onEnd={() => setIsCallActive(false)}
          />
        </div>
      )}
    </>
  );
}