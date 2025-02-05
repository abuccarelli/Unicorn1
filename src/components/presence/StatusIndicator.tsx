import React, { memo } from 'react';
import type { PresenceStatus } from '../../hooks/usePresence';

interface StatusIndicatorProps {
  status?: PresenceStatus;
  className?: string;
}

// Memoize the entire component since it's purely presentational
export const StatusIndicator = memo(({ status, className = '' }: StatusIndicatorProps) => {
  // Memoize color mapping
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      {status === 'online' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75`} />
      )}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`} />
    </span>
  );
});

StatusIndicator.displayName = 'StatusIndicator';