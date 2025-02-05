import { useState, useEffect, useRef, useCallback } from 'react';
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
  const channelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const mounted = useRef(true);

  // Cleanup function
  const cleanupSubscriptions = useCallback(async () => {
    try {
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (typingChannelRef.current) {
        await typingChannelRef.current.unsubscribe();
        typingChannelRef.current = null;
      }
    } catch (err) {
      console.error('Error cleaning up subscriptions:', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      cleanupSubscriptions();
    };
  }, [cleanupSubscriptions]);

  // Fetch messages handler
  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) return;

    try {
      setLoading(true);
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
      if (mounted.current) {
        setMessages(messagesData || []);
      }

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
      if (mounted.current) {
        setError('Failed to load messages');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [user, conversationId]);

  // Setup subscriptions
  useEffect(() => {
    if (!user || !conversationId) return;

    const setupSubscriptions = async () => {
      try {
        // Clean up existing subscriptions first
        await cleanupSubscriptions();

        // Create message channel
        const messageChannel = supabase.channel(`messages:${conversationId}`);
        channelRef.current = messageChannel;

        messageChannel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, async payload => {
          if (!mounted.current) return;
          
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
        });

        // Create typing channel
        const typingChannel = supabase.channel(`typing:${conversationId}`);
        typingChannelRef.current = typingChannel;

        typingChannel.on('presence', { event: 'sync' }, () => {
          if (!mounted.current) return;
          const state = typingChannel.presenceState();
          const typingUsers = Object.values(state).flat() as any[];
          const otherTypingUser = typingUsers.find(u => u.user_id !== user.id);
          setTypingUser(otherTypingUser?.name || null);
        });

        // Subscribe to channels
        await messageChannel.subscribe();
        await typingChannel.subscribe();

      } catch (err) {
        console.error('Error setting up subscriptions:', err);
        toast.error('Connection error. Messages may be delayed.');
      }
    };

    setupSubscriptions();
    fetchMessages();

  }, [user, conversationId, cleanupSubscriptions, fetchMessages]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!user || !conversationId || !typingChannelRef.current) return;

    try {
      if (isTyping) {
        await typingChannelRef.current.track({
          user_id: user.id,
          name: `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
        });
      } else {
        await typingChannelRef.current.untrack();
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [user, conversationId]);

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!user) return;
    
    const hasContent = content.trim().length > 0;
    const hasAttachments = attachments && attachments.length > 0;
    
    if (!hasContent && !hasAttachments) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      const messageContent = content.trim() || 'Sent attachments';
      const now = new Date().toISOString();

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageContent,
        created_at: now,
        message_attachments: []
      };

      // Add optimistic message to UI
      setMessages(current => [...current, optimisticMessage]);

      // Get conversation details
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('student_id, teacher_id')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          created_at: now
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Handle attachments if any
      let messageAttachments = [];
      if (hasAttachments) {
        const attachmentPromises = attachments!.map(async file => {
          const fileExt = file.name.split('.').pop();
          const filePath = `${conversationId}/${message.id}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: attachment } = await supabase
            .from('message_attachments')
            .insert({
              message_id: message.id,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              file_path: filePath
            })
            .select()
            .single();

          return attachment;
        });

        messageAttachments = await Promise.all(attachmentPromises);
      }

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          updated_at: now,
          last_message: messageContent
        })
        .eq('id', conversationId);

      // Create notification
      const recipientId = user.id === conversation.student_id 
        ? conversation.teacher_id 
        : conversation.student_id;

      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message',
          title: 'New Message',
          content: `You have a new message`,
          link: `/messages/${conversationId}`,
          read: false
        });

      // Update messages with real message and attachments
      setMessages(current => 
        current.map(m => 
          m.id === optimisticMessage.id 
            ? { ...message, message_attachments: messageAttachments }
            : m
        )
      );

    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(current => current.filter(m => !m.id.startsWith('temp-')));
      toast.error('Failed to send message');
      throw err;
    }
  }, [user, conversationId]);

  return { 
    messages, 
    loading, 
    error, 
    sendMessage,
    setTyping,
    typingUser
  };
}