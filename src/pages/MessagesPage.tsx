import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { ConversationList } from '../components/messaging/ConversationList';
import { ChatInterface } from '../components/messaging/ChatInterface';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [selectedId, setSelectedId] = useState<string>(conversationId || '');
  const { conversations, loading: conversationsLoading, error: conversationsError } = useConversations();
  
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    typingUser,
    setTyping
  } = useMessages(selectedId);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  if (conversationsLoading) return <LoadingSpinner />;
  if (conversationsError) return <div className="text-red-600">{conversationsError}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm min-h-[600px] flex">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Chat Area */}
        <div className="w-2/3">
          {selectedId && selectedConversation ? (
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              otherPartyName={selectedConversation.otherPartyName}
              otherPartyId={selectedConversation.otherPartyId}
              conversationId={selectedId}
              typingUser={typingUser}
              onTyping={setTyping}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
              <div className="text-center">
                <p className="text-lg mb-2">Welcome to Messages</p>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}