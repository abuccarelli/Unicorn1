import React from 'react';
import { RequestsOverview } from '../../components/teacher/requests/RequestsOverview';

export function StudentRequests() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Requests</h1>
      <RequestsOverview />
    </div>
  );
}