import React from 'react';
import { ProfileView } from '../components/profile/ProfileView';

function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      <ProfileView />
    </div>
  );
}

export default ProfilePage;