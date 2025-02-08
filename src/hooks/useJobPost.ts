import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { JobPost, JobComment } from '../types/job';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useJobPost() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const [post, setPost] = useState<JobPost | null>(null);
  const [comments, setComments] = useState<JobComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async (postId: string, retryCount = 0): Promise<JobPost> => {
    try {
      const { data: refreshedPost, error: refreshError } = await supabase
        .from('job_posts')
        .select(`
          *,
          tags:job_tags(id, name, created_by),
          created_by_profile:profiles!job_posts_created_by_fkey (
            id,
            "firstName",
            "lastName",
            role
          ),
          view_count,
          comment_count
        `)
        .eq('id', postId)
        .single();

      if (refreshError) {
        // Handle specific error cases
        if (refreshError.message?.includes('JWT expired')) {
          toast.error('Your session has expired. Please sign in again.');
          throw refreshError;
        }
        throw refreshError;
      }

      return refreshedPost;
    } catch (err) {
      // Handle network errors with retry logic
      if (err.message?.includes('Failed to fetch') && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)));
        return fetchPost(postId, retryCount + 1);
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        // Try to increment view count, but don't block on failure
        try {
          await supabase.rpc('increment_post_views', { post_id: id });
        } catch (viewError) {
          console.warn('Failed to increment view count:', viewError);
        }

        // Fetch post data
        const post = await fetchPost(id);
        setPost(post);

        // Fetch comments
        const { data: comments, error: commentsError } = await supabase
          .from('job_comments')
          .select(`
            *,
            profile:profiles!job_comments_created_by_fkey (
              id,
              "firstName",
              "lastName",
              role
            )
          `)
          .eq('job_id', id)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;
        setComments(comments || []);

      } catch (err) {
        console.error('Error fetching job post:', err);
        const errorMessage = err.message?.includes('Failed to fetch')
          ? 'Unable to connect to the server. Please check your internet connection.'
          : 'Failed to load job post';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, fetchPost]);

  const addComment = async (content: string) => {
    if (!user || !post) {
      toast.error('You must be signed in to comment');
      return;
    }

    try {
      const { data: newComment, error } = await supabase
        .from('job_comments')
        .insert({
          job_id: post.id,
          content: content.trim(),
          created_by: user.id
        })
        .select(`
          *,
          profile:profiles!job_comments_created_by_fkey (
            id,
            "firstName",
            "lastName",
            role
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, newComment]);
      toast.success('Comment posted successfully');
    } catch (err) {
      console.error('Error posting comment:', err);
      const errorMessage = err.message?.includes('Failed to fetch')
        ? 'Unable to connect to the server. Please try again.'
        : 'Failed to post comment';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updatePost = async (postId: string, data: Partial<JobPost> & { tags?: string[] }) => {
    if (!user || !post || user.id !== post.created_by) {
      toast.error('You do not have permission to edit this post');
      return;
    }

    try {
      // Start a transaction by using multiple operations
      const updates = [];

      // 1. Update post details
      updates.push(
        supabase
          .from('job_posts')
          .update({
            title: data.title,
            description: data.description,
            subjects: data.subjects,
            languages: data.languages,
            updated_at: new Date().toISOString()
          })
          .eq('id', postId)
      );

      // 2. Delete all existing tags first
      updates.push(
        supabase
          .from('job_tags')
          .delete()
          .eq('job_id', postId)
      );

      // Execute the first batch of updates
      const results = await Promise.all(updates);
      const errors = results.map(r => r.error).filter(Boolean);
      if (errors.length > 0) throw errors[0];

      // 3. Insert new tags if any exist
      if (data.tags && data.tags.length > 0) {
        // Clean and format tags
        const formattedTags = data.tags
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .map(tag => ({
            job_id: postId,
            name: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(),
            created_by: user.id
          }));

        if (formattedTags.length > 0) {
          const { error: insertError } = await supabase
            .from('job_tags')
            .insert(formattedTags);

          if (insertError) throw insertError;
        }
      }

      // 4. Fetch and update the post with latest data
      const refreshedPost = await fetchPost(postId);
      setPost(refreshedPost);
      toast.success('Post updated successfully');

    } catch (err) {
      console.error('Error updating job post:', err);
      const errorMessage = err.message?.includes('Failed to fetch')
        ? 'Connection error. Please check your internet connection and try again.'
        : 'Failed to update post';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    post,
    comments,
    loading,
    error,
    addComment,
    updatePost
  };
}