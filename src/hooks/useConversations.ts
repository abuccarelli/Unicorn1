import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Conversation } from '../types/conversation';

export function useConversations() {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          id,
          booking_id,
          student_id,
          teacher_id,
          messages!messages_conversation_id_fkey (
            content,
            created_at,
            read_at,
            sender_id
          ),
          student:student_id (
            "firstName",
            "lastName"
          ),
          teacher:teacher_id (
            "firstName",
            "lastName"
          )
        `)
        .or(`student_id.eq.${user.id},teacher_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        if (fetchError.message?.includes('Failed to fetch')) {
          throw new Error('Unable to connect to the server. Please check your internet connection.');
        }
        throw fetchError;
      }

      const transformedConversations: Conversation[] = data.map((conv) => {
        const isStudent = conv.student_id === user.id;
        const otherParty = isStudent ? conv.teacher : conv.student;
        const messages = conv.messages || [];
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(
          (m) => m.sender_id !== user.id && !m.read_at
        ).length;

        return {
          id: conv.id,
          bookingId: conv.booking_id,
          otherPartyId: isStudent ? conv.teacher_id : conv.student_id,
          otherPartyName: `${otherParty.firstName} ${otherParty.lastName}`,
          lastMessage: lastMessage?.content || 'No messages yet',
          lastMessageAt: lastMessage?.created_at || conv.created_at,
          unreadCount
        };
      });

      setConversations(transformedConversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      toast.error('Failed to load conversations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription for conversations
    if (user) {
      const channel = supabase
        .channel(`user_conversations:${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}`
        }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations
  };
}