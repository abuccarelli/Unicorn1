import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import type { Message } from '../../types/conversation';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  otherPartyName: string;
  otherPartyId: string;
  conversationId: string;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  otherPartyName,
  otherPartyId,
  conversationId
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        otherPartyName={otherPartyName}
        otherPartyId={otherPartyId}
        conversationId={conversationId}
      />
      <MessageList messages={messages} />
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}