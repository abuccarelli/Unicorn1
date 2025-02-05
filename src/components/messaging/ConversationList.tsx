import React, { useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { DateTime } from 'luxon';
import type { Conversation } from '../../types/conversation';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

// Memoized empty state component
const EmptyState = React.memo(() => (
  <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
    <MessageSquare className="h-12 w-12 mb-4" />
    <p>No conversations yet</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Memoized conversation item component
const ConversationItem = React.memo(({ 
  conversation, 
  isSelected, 
  onClick 
}: { 
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const relativeTime = useMemo(() => 
    DateTime.fromISO(conversation.lastMessageAt).toRelative(),
    [conversation.lastMessageAt]
  );

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 focus:outline-none ${
        isSelected ? 'bg-indigo-50' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {conversation.otherPartyName}
          </p>
          <p className="text-xs text-gray-500">
            {relativeTime}
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-500 truncate">
          {conversation.lastMessage}
        </p>
      </div>
      {conversation.unreadCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
        </span>
      )}
    </button>
  );
});

ConversationItem.displayName = 'ConversationItem';

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  // Early return for empty state
  if (conversations.length === 0) {
    return <EmptyState />;
  }

  // Memoize sorted conversations
  const sortedConversations = useMemo(() => 
    [...conversations].sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    ),
    [conversations]
  );

  return (
    <div className="divide-y divide-gray-200">
      {sortedConversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedId === conversation.id}
          onClick={() => onSelect(conversation.id)}
        />
      ))}
    </div>
  );
}