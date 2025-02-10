import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { JobPost } from '../types/job';

interface JobFilters {
  subjects?: string[];
  languages?: string[];
  query?: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (filters: JobFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('job_posts')
        .select(`
          *,
          tags:job_tags(
            id,
            name,
            created_by
          ),
          created_by_profile:profiles!job_posts_created_by_fkey(
            id,
            "firstName",
            "lastName",
            role
          ),
          comment_count,
          view_count
        `)
        .is('job_tags.deleted_at', null);

      // Apply filters
      if (filters.subjects?.length) {
        query = query.contains('subjects', filters.subjects);
      }

      if (filters.languages?.length) {
        query = query.contains('languages', filters.languages);
      }

      // Handle search query
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Add final ordering
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process the data to ensure valid tags and remove duplicates
      const processedJobs = data?.map(job => ({
        ...job,
        tags: (job.tags || [])
          .filter((tag, index, self) => 
            index === self.findIndex(t => t.name === tag.name)
          )
      })) || [];

      setJobs(processedJobs);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job posts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs
  };
}