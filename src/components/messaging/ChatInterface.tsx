import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import type { Message } from '../../types/conversation';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  otherPartyName: string;
  otherPartyId: string;
  conversationId: string;
  typingUser?: string;
  onTyping?: (isTyping: boolean) => void;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  otherPartyName,
  otherPartyId,
  conversationId,
  typingUser,
  onTyping
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full bg-gray-100">
      <ChatHeader 
        otherPartyName={otherPartyName}
        otherPartyId={otherPartyId}
        conversationId={conversationId}
      />
      <MessageList 
        messages={messages} 
        typingUser={typingUser}
      />
      <MessageInput 
        onSend={onSendMessage} 
        conversationId={conversationId}
        onTyping={onTyping}
      />
    </div>
  );
}