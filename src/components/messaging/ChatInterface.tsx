import React, { useMemo } from 'react';
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

// Memoize the entire chat interface
export const ChatInterface = React.memo(({ 
  messages, 
  onSendMessage, 
  otherPartyName,
  otherPartyId,
  conversationId,
  typingUser,
  onTyping
}: ChatInterfaceProps) => {
  // Memoize message list to prevent unnecessary re-renders
  const messageList = useMemo(() => (
    <MessageList 
      messages={messages} 
      typingUser={typingUser}
    />
  ), [messages, typingUser]);

  // Memoize header to prevent unnecessary re-renders
  const header = useMemo(() => (
    <ChatHeader 
      otherPartyName={otherPartyName}
      otherPartyId={otherPartyId}
      conversationId={conversationId}
    />
  ), [otherPartyName, otherPartyId, conversationId]);

  // Memoize input to prevent unnecessary re-renders
  const input = useMemo(() => (
    <MessageInput 
      onSend={onSendMessage} 
      conversationId={conversationId}
      onTyping={onTyping}
    />
  ), [onSendMessage, conversationId, onTyping]);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {header}
      {messageList}
      {input}
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';