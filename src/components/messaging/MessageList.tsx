import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleAttachmentClick = async (attachment: any) => {
    try {
      const isPdf = attachment.file_type === 'application/pdf';
      
      // Get a signed URL for the file
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

      if (signedUrlError) throw signedUrlError;

      if (isPdf) {
        // Show expiry notification for PDFs
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
        
        // Open PDF in new tab
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        // For other files, trigger download
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
        toast.error('This PDF link has expired. Please request a new link.', {
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

  // Rest of the component remains the same...
  if (messages.length === 0 && !typingUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-gray-500">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message, index) => {
        const isSender = message.sender_id === user?.id;
        const showDate = index === 0 || 
          new Date(message.created_at).toDateString() !== 
          new Date(messages[index - 1].created_at).toDateString();

        return (
          <React.Fragment key={message.id || message.created_at}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
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
                className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                  isSender
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.message_attachments?.map((attachment, i) => (
                  <div key={i}>{renderAttachment(attachment)}</div>
                ))}
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <p
                    className={`text-xs ${
                      isSender ? 'text-indigo-200' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.created_at)}
                  </p>
                  {message.read_at && isSender && (
                    <span className="text-xs text-indigo-200">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {typingUser && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500">
            {typingUser} is typing...
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}