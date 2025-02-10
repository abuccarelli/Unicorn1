import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { JobPost, JobComment } from '../types/job';

export function useJobPost() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const [post, setPost] = useState<JobPost | null>(null);
  const [comments, setComments] = useState<JobComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async (postId: string): Promise<JobPost> => {
    const { data: refreshedPost, error: refreshError } = await supabase
      .from('job_posts')
      .select(`
        *,
        tags:job_tags(
          id,
          name,
          created_by,
          deleted_at
        ),
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
      .is('job_tags.deleted_at', null)
      .single();

    if (refreshError) throw refreshError;
    return refreshedPost;
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        const post = await fetchPost(id);
        setPost(post);

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
        setError('Failed to load job post');
        toast.error('Failed to load job post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, fetchPost]);

  const updatePost = async (postId: string, data: Partial<JobPost> & { tags?: string[] }) => {
    if (!user || !post || user.id !== post.created_by) {
      toast.error('You do not have permission to edit this post');
      return;
    }

    try {
      // Update post details
      const { error: updateError } = await supabase
        .from('job_posts')
        .update({
          title: data.title,
          description: data.description,
          subjects: data.subjects,
          languages: data.languages,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Handle tag updates if tags are provided
      if (data.tags) {
        // Get current active tags
        const currentTags = post.tags?.map(t => t.name) || [];
        
        // Determine which tags to add and remove
        const tagsToAdd = data.tags.filter(tag => !currentTags.includes(tag));
        const tagsToRemove = currentTags.filter(tag => !data.tags.includes(tag));

        // Delete removed tags
        if (tagsToRemove.length > 0) {
          const { error: deleteError } = await supabase
            .from('job_tags')
            .delete()
            .eq('job_id', postId)
            .in('name', tagsToRemove);

          if (deleteError) throw deleteError;
        }

        // Add new tags
        if (tagsToAdd.length > 0) {
          const { error: addError } = await supabase
            .from('job_tags')
            .insert(
              tagsToAdd.map(tag => ({
                job_id: postId,
                name: tag,
                created_by: user.id
              }))
            );

          if (addError) throw addError;
        }
      }

      // Fetch updated post to get new state
      const updatedPost = await fetchPost(postId);
      setPost(updatedPost);
      toast.success('Post updated successfully');
    } catch (err) {
      console.error('Error updating job post:', err);
      toast.error('Failed to update post');
      throw err;
    }
  };

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
      toast.error('Failed to post comment');
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