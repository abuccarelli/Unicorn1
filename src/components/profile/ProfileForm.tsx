import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useProfile } from '../../hooks/useProfile';
import type { Profile } from '../../types';

interface ProfileFormProps {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState<Partial<Profile>>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
    subjects: profile?.subjects || [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { success, error } = await updateProfile(formData);

    if (success) {
      toast.success('Profile updated successfully');
      onSuccess?.();
    } else {
      toast.error(error || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subjects = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, subjects }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={formData.bio}
          onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {profile?.role === 'teacher' && (
        <div>
          <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">
            Subjects (comma-separated)
          </label>
          <input
            type="text"
            id="subjects"
            value={formData.subjects?.join(', ')}
            onChange={handleSubjectChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}