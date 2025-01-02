import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

export function StudentDashboard() {
  const { profile } = useProfile();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <UserCircle className="h-12 w-12 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome, {profile?.firstName} {profile?.lastName}
              </h2>
              <Link to="/profile" className="text-indigo-600 hover:text-indigo-700">
                View or edit your profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Classes</h2>
          {/* Add classes content */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Learning Progress</h2>
          {/* Add progress content */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommended Teachers</h2>
          {/* Add recommended teachers content */}
        </div>
      </div>
    </div>
  );
}