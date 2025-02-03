import React from 'react';
import { VideoCallButton } from './VideoCallButton';
import { StatusIndicator } from '../presence/StatusIndicator';
import { usePresence } from '../../hooks/usePresence';

interface ChatHeaderProps {
  otherPartyName: string;
  otherPartyId: string;
  conversationId: string;
}

export function ChatHeader({ otherPartyName, otherPartyId, conversationId }: ChatHeaderProps) {
  const { status } = usePresence(otherPartyId);

  return (
    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold text-gray-900">{otherPartyName}</h2>
        <StatusIndicator status={status} />
      </div>
      <VideoCallButton 
        conversationId={conversationId}
        remoteUserId={otherPartyId}
      />
    </div>
  );
}