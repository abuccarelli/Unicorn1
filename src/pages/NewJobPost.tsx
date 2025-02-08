import React from 'react';
import { JobForm } from '../components/jobs/JobForm';

export default function NewJobPost() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Job Post</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <JobForm />
      </div>
    </div>
  );
}