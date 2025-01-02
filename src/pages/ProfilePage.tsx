import React, { useState } from 'react';
import { ProfileView } from '../components/profile/ProfileView';
import { ProfileForm } from '../components/profile/ProfileForm';

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <ProfileForm onSuccess={() => setIsEditing(false)} />
      ) : (
        <ProfileView />
      )}
    </div>
  );
}