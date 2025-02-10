import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { JobList } from '../components/jobs/JobList';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobSearch } from '../components/jobs/JobSearch';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useJobs } from '../hooks/useJobs';

export default function JobBoard() {
  const { user } = useAuthContext();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { jobs, loading, error, fetchJobs } = useJobs();
  const [refreshing, setRefreshing] = useState(false);

  // Memoize the fetch function with filters
  const fetchJobsWithFilters = useCallback(() => {
    return fetchJobs({
      subjects: selectedSubjects,
      languages: selectedLanguages,
      query: searchQuery
    });
  }, [fetchJobs, selectedSubjects, selectedLanguages, searchQuery]);

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobsWithFilters();
  }, [fetchJobsWithFilters]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchJobsWithFilters();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
        <div className="flex gap-4">
          {user?.user_metadata.role === 'student' && (
            <Link
              to="/jobs/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Post
            </Link>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div className="lg:w-1/4">
            <JobFilters
              selectedSubjects={selectedSubjects}
              selectedLanguages={selectedLanguages}
              onSubjectsChange={setSelectedSubjects}
              onLanguagesChange={setSelectedLanguages}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <JobSearch onSearch={setSearchQuery} />

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <JobList jobs={jobs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}