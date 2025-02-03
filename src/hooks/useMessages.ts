import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Message } from '../types/conversation';

export function useMessages(conversationId: string) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user || !conversationId) return;

    const fetchMessages = async () => {
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            message_attachments (
              id,
              file_name,
              file_size,
              file_type,
              file_path,
              public_url
            )
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData);

        // Mark messages as read
        const unreadMessages = messagesData?.filter(
          m => m.sender_id !== user.id && !m.read_at
        ) || [];

        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadMessages.map(m => m.id));
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase.channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async payload => {
        const newMessage = payload.new as Message;
        
        // Fetch attachments for the new message
        const { data: attachments } = await supabase
          .from('message_attachments')
          .select('*')
          .eq('message_id', newMessage.id);

        setMessages(current => [...current, {
          ...newMessage,
          message_attachments: attachments
        }]);
        
        // Mark message as read if received
        if (newMessage.sender_id !== user.id) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', newMessage.id);
        }
      })
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase.channel(`typing:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const typingUsers = Object.values(state).flat() as any[];
        const otherTypingUser = typingUsers.find(u => u.user_id !== user.id);
        setTypingUser(otherTypingUser?.name || null);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      typingChannel.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, conversationId]);

  const setTyping = async (isTyping: boolean) => {
    if (!user || !conversationId) return;

    try {
      const channel = supabase.channel(`typing:${conversationId}`);
      
      if (isTyping) {
        await channel.track({
          user_id: user.id,
          name: `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
        });
      } else {
        await channel.untrack();
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!user) return;
    
    // Validate that either content or attachments are present
    const hasContent = content.trim().length > 0;
    const hasAttachments = attachments && attachments.length > 0;
    
    if (!hasContent && !hasAttachments) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('student_id, teacher_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) throw new Error('Conversation not found');

      // Upload attachments first if any
      const uploadedAttachments = [];
      if (hasAttachments) {
        for (const file of attachments!) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          uploadedAttachments.push({
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_path: filePath
          });
        }
      }

      // Create message content
      let messageContent = content.trim();
      if (!hasContent && hasAttachments) {
        // Create a list of file names for the message content
        const fileNames = attachments!.map(file => file.name).join(', ');
        messageContent = `📎 ${fileNames}`;
      }
      
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      // Insert attachments metadata if any
      if (uploadedAttachments.length > 0) {
        const { error: attachmentError } = await supabase
          .from('message_attachments')
          .insert(
            uploadedAttachments.map(attachment => ({
              message_id: message.id,
              ...attachment
            }))
          );

        if (attachmentError) throw attachmentError;
      }

      // Create notification for the recipient
      const recipientId = user.id === conversation.student_id 
        ? conversation.teacher_id 
        : conversation.student_id;

      await supabase
        .from('notifications')
        .insert([{
          user_id: recipientId,
          type: 'message',
          title: 'New Message',
          content: `You have a new message`,
          link: `/messages/${conversationId}`,
          read: false
        }]);

    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      throw err;
    }
  };

  return { 
    messages, 
    loading, 
    error, 
    sendMessage,
    setTyping,
    typingUser
  };
}