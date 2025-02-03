import React from 'react';
import { MessageSquare } from 'lucide-react';
import { DateTime } from 'luxon';
import type { Conversation } from '../../types/conversation';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
        <MessageSquare className="h-12 w-12 mb-4" />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 focus:outline-none ${
            selectedId === conversation.id ? 'bg-indigo-50' : ''
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {conversation.otherPartyName}
              </p>
              <p className="text-xs text-gray-500">
                {DateTime.fromISO(conversation.lastMessageAt).toRelative()}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {conversation.lastMessage}
            </p>
          </div>
          {conversation.unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {conversation.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}