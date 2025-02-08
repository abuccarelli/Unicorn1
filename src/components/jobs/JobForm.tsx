import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';
import { SubjectSelector } from '../profile/SubjectSelector';
import { LanguageSelector } from '../profile/LanguageSelector';
import { supabase } from '../../lib/supabase';
import type { JobFormData } from '../../types/job';

export function JobForm() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    subjects: [],
    languages: [],
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create job post
      const { data: job, error: jobError } = await supabase
        .from('job_posts')
        .insert({
          title: formData.title,
          description: formData.description,
          subjects: formData.subjects,
          languages: formData.languages,
          created_by: user.id,
          status: 'open'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Add tags if any
      if (formData.tags.length > 0) {
        const { error: tagsError } = await supabase
          .from('job_tags')
          .insert(
            formData.tags.map(tag => ({
              job_id: job.id,
              name: tag,
              created_by: user.id
            }))
          );

        if (tagsError) throw tagsError;
      }

      toast.success('Job post created successfully');
      navigate(`/jobs/${job.id}`);
    } catch (error) {
      console.error('Error creating job post:', error);
      toast.error('Failed to create job post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Subjects</label>
        <div className="mt-1">
          <SubjectSelector
            selectedSubjects={formData.subjects}
            onChange={subjects => setFormData(prev => ({ ...prev, subjects }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Languages</label>
        <div className="mt-1">
          <LanguageSelector
            selectedLanguages={formData.languages}
            onChange={languages => setFormData(prev => ({ ...prev, languages }))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </div>
    </form>
  );
}