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

      // Call the search function
      const { data, error: searchError } = await supabase
        .rpc('execute_job_search', {
          search_term: filters.query || null
        });

      if (searchError) throw searchError;

      // Apply client-side filters for subjects and languages
      let filteredJobs = data || [];

      if (filters.subjects?.length) {
        filteredJobs = filteredJobs.filter(job => 
          job.subjects?.some(subject => filters.subjects?.includes(subject))
        );
      }

      if (filters.languages?.length) {
        filteredJobs = filteredJobs.filter(job =>
          job.languages?.some(language => filters.languages?.includes(language))
        );
      }

      // Transform the data to match JobPost type
      const transformedJobs = filteredJobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        subjects: job.subjects,
        languages: job.languages,
        status: job.status,
        created_by: job.created_by,
        created_at: job.created_at,
        updated_at: job.updated_at,
        view_count: job.view_count,
        comment_count: job.comment_count,
        tags: job.tags || [],
        created_by_profile: {
          id: job.profile_id,
          firstName: job.firstName,
          lastName: job.lastName,
          role: job.role
        }
      }));

      setJobs(transformedJobs);
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