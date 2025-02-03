import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Teacher } from '../types/teacher';

interface Filters {
  subjects?: string[];
  languages?: string[];
  currency?: string;
  query?: string;
}

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = async (filters: Filters = {}) => {
    try {
      setLoading(true);
      let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');

      // Apply filters
      if (filters.subjects && filters.subjects.length > 0) {
        queryBuilder = queryBuilder.contains('subjects', filters.subjects);
      }

      if (filters.languages && filters.languages.length > 0) {
        queryBuilder = queryBuilder.contains('languages', filters.languages);
      }

      if (filters.currency) {
        queryBuilder = queryBuilder.eq('currency', filters.currency);
      }

      if (filters.query) {
        queryBuilder = queryBuilder.or(
          `firstName.ilike.%${filters.query}%,lastName.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`
        );
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setTeachers(data as Teacher[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return { teachers, loading, error, fetchTeachers };
}