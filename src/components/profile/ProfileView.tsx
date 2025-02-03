import React from 'react';
import { EditableField } from './EditableField';
import { ProfilePicture } from './ProfilePicture';
import { AddressFields } from './AddressFields';
import { useProfile } from '../../hooks/useProfile';
import { LoadingSpinner } from '../LoadingSpinner';
import { Mail, Book, Globe, DollarSign } from 'lucide-react';

export function ProfileView() {
  const { profile, loading, error, updateProfile } = useProfile();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!profile) return null;

  const handleUpdate = async (field: string, value: string | number) => {
    if (field === 'subjects' || field === 'languages') {
      const items = (value as string).split(',').map(s => s.trim()).filter(Boolean);
      await updateProfile({ [field]: items });
    } else if (field === 'hourly_rate') {
      const rate = parseFloat(value as string);
      if (!isNaN(rate)) {
        await updateProfile({ [field]: rate });
      }
    } else {
      await updateProfile({ [field]: value });
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
        <p className="mt-1 text-sm text-gray-500">Manage your personal information and preferences.</p>
      </div>

      <div className="border-t border-gray-200">
        {/* Profile Picture */}
        {profile.role === 'teacher' && (
          <div className="px-4 py-5 sm:px-6">
            <ProfilePicture
              profile={profile}
              onUpdate={() => updateProfile({})}
            />
          </div>
        )}

        <dl>
          {/* Basic Information */}
          <div className="bg-gray-50 px-4 py-5 sm:px-6">
            <div className="flex items-center mb-4">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>

            <div className="space-y-4">
              <EditableField
                label="First Name"
                value={profile.firstName}
                onSave={(value) => handleUpdate('firstName', value)}
              />
              <EditableField
                label="Last Name"
                value={profile.lastName}
                onSave={(value) => handleUpdate('lastName', value)}
              />
              <EditableField
                label="Bio"
                value={profile.bio || ''}
                onSave={(value) => handleUpdate('bio', value)}
                type="textarea"
              />
            </div>
          </div>

          {/* Teaching Information (for teachers only) */}
          {profile.role === 'teacher' && (
            <>
              <div className="bg-white px-4 py-5 sm:px-6">
                <div className="flex items-center mb-4">
                  <Book className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Teaching Information</h3>
                </div>

                <div className="space-y-4">
                  <EditableField
                    label="Subjects"
                    value={profile.subjects?.join(', ') || ''}
                    onSave={(value) => handleUpdate('subjects', value)}
                    type="subjects"
                    subjects={profile.subjects || []}
                  />
                  <EditableField
                    label="Languages"
                    value={profile.languages?.join(', ') || ''}
                    onSave={(value) => handleUpdate('languages', value)}
                    type="languages"
                    languages={profile.languages || []}
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
                </div>

                <div className="space-y-4">
                  <EditableField
                    label="Currency"
                    value={profile.currency || ''}
                    onSave={(value) => handleUpdate('currency', value)}
                    type="currency"
                  />
                  <EditableField
                    label="Hourly Rate"
                    value={profile.hourly_rate?.toString() || ''}
                    onSave={(value) => handleUpdate('hourly_rate', value)}
                    type="number"
                    placeholder="Enter your hourly rate"
                  />
                </div>
              </div>
            </>
          )}

          {/* Address Information */}
          <AddressFields 
            profile={profile}
            onUpdate={handleUpdate}
          />
        </dl>
      </div>
    </div>
  );
}