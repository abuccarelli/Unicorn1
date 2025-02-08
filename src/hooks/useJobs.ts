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

      // First check if we can connect to Supabase
      const { error: healthCheckError } = await supabase.from('job_posts').select('count');
      if (healthCheckError) {
        if (healthCheckError.message?.includes('Failed to fetch')) {
          throw new Error('Unable to connect to the server. Please check your internet connection.');
        }
        throw healthCheckError;
      }

      // Build the query
      let query = supabase
        .from('job_posts')
        .select(`
          *,
          tags:job_tags(*),
          created_by_profile:profiles!job_posts_created_by_fkey (
            id,
            "firstName",
            "lastName",
            role
          ),
          comment_count,
          view_count
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.subjects?.length) {
        query = query.contains('subjects', filters.subjects);
      }

      if (filters.languages?.length) {
        query = query.contains('languages', filters.languages);
      }

      if (filters.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        // Handle specific error cases
        if (fetchError.message?.includes('JWT')) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw fetchError;
      }

      setJobs(data || []);
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