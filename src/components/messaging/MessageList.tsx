import React, { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { formatMessageTime } from '../../utils/dateTime';
import { FileText, Image, Paperclip, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Message } from '../../types/conversation';
import { toast } from 'react-hot-toast';

interface MessageListProps {
  messages: Message[];
  typingUser?: string | null;
}

export function MessageList({ messages, typingUser }: MessageListProps) {
  const { user } = useAuthContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Handle scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      setAutoScroll(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUser, autoScroll]);

  const handleAttachmentClick = async (attachment: any) => {
    try {
      const isPdf = attachment.file_type === 'application/pdf';
      
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(attachment.file_path, 3600);

      if (signedUrlError) throw signedUrlError;

      if (isPdf) {
        toast((t) => (
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">PDF Link Expires in 1 Hour</p>
              <p className="text-sm text-gray-500">Please download or save the PDF if you need it later.</p>
            </div>
          </div>
        ), {
          duration: 6000,
          position: 'top-center'
        });
        
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        const response = await fetch(signedUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Attachment error:', error);
      if (error.message?.includes('expired')) {
        toast.error('This link has expired. Please request a new one.', {
          duration: 5000,
          icon: '⚠️'
        });
      } else {
        toast.error('Failed to open attachment. Please try again.');
      }
    }
  };

  const renderAttachment = (attachment: any) => {
    const isImage = attachment.file_type.startsWith('image/');
    const isPdf = attachment.file_type === 'application/pdf';
    
    if (isImage) {
      return (
        <div className="mt-2">
          <img
            src={attachment.public_url}
            alt={attachment.file_name}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90"
            onClick={() => handleAttachmentClick(attachment)}
          />
        </div>
      );
    }

    return (
      <div className="mt-2">
        <button
          onClick={() => handleAttachmentClick(attachment)}
          className={`flex items-center space-x-2 text-sm ${
            isPdf ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'
          } hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md`}
        >
          {isPdf ? (
            <FileText className="h-4 w-4 flex-shrink-0" />
          ) : (
            <Paperclip className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="truncate">{attachment.file_name}</span>
        </button>
        {isPdf && (
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Link expires after 1 hour
          </p>
        )}
      </div>
    );
  };

  if (messages.length === 0 && !typingUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-gray-500 bg-gray-50">
        <div className="text-center">
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ded8]"
    >
      {messages.map((message, index) => {
        const isSender = message.sender_id === user?.id;
        const showDate = index === 0 || 
          new Date(message.created_at).toDateString() !== 
          new Date(messages[index - 1].created_at).toDateString();

        return (
          <React.Fragment key={message.id || message.created_at}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="px-4 py-1 rounded-full bg-white/70 text-gray-600 text-xs font-medium shadow-sm">
                  {new Date(message.created_at).toLocaleDateString(undefined, { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                  isSender
                    ? 'bg-[#dcf8c6] ml-12'
                    : 'bg-white mr-12'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap text-gray-800">{message.content}</p>
                {message.message_attachments?.map((attachment, i) => (
                  <div key={i}>{renderAttachment(attachment)}</div>
                ))}
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <p className="text-xs text-gray-500">
                    {formatMessageTime(message.created_at)}
                  </p>
                  {message.read_at && isSender && (
                    <span className="text-xs text-blue-500">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {typingUser && (
        <div className="flex justify-start">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-500">{typingUser} is typing</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}