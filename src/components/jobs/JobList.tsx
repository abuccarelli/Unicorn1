import React from 'react';
import { JobCard } from './JobCard';
import type { JobPost } from '../../types/job';

interface JobListProps {
  jobs: JobPost[];
  onRefresh?: () => Promise<void>;
}

export function JobList({ jobs, onRefresh }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No job posts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}