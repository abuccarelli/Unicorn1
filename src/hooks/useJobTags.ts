import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export function useJobTags() {
  const updateTags = useCallback(async (jobId: string, userId: string, tags: string[]) => {
    try {
      // Start a transaction by deleting existing tags
      const { error: deleteError } = await supabase
        .from('job_tags')
        .delete()
        .eq('job_id', jobId);

      if (deleteError) throw deleteError;

      // Only insert new tags if there are any
      if (tags.length > 0) {
        // Deduplicate tags case-insensitively
        const uniqueTags = Array.from(new Set(
          tags.map(tag => tag.toLowerCase())
        )).map((tag, index) => ({
          job_id: jobId,
          name: tags[index], // Keep original casing
          created_by: userId
        }));

        const { error: insertError } = await supabase
          .from('job_tags')
          .insert(uniqueTags);

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
      return false;
    }
  }, []);

  return { updateTags };
}