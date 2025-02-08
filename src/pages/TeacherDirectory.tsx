import React, { useState } from 'react';
import { useTeachers } from '../hooks/useTeachers';
import { TeacherList } from '../components/teachers/TeacherList';
import { TeacherSearch } from '../components/teachers/TeacherSearch';
import { TeacherFilters } from '../components/teachers/TeacherFilters';
import { LoadingSpinner } from '../components/LoadingSpinner';

function TeacherDirectory() {
  const { teachers, loading, error, fetchTeachers } = useTeachers();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchTeachers({
      query,
      subjects: selectedSubjects,
      languages: selectedLanguages,
      currency: selectedCurrency
    });
  };

  const handleFiltersChange = (
    subjects: string[] = selectedSubjects,
    languages: string[] = selectedLanguages,
    currency: string = selectedCurrency
  ) => {
    fetchTeachers({
      query: searchQuery,
      subjects,
      languages,
      currency
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Teachers</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <TeacherFilters
            selectedSubjects={selectedSubjects}
            selectedLanguages={selectedLanguages}
            selectedCurrency={selectedCurrency}
            onSubjectsChange={(subjects) => {
              setSelectedSubjects(subjects);
              handleFiltersChange(subjects);
            }}
            onLanguagesChange={(languages) => {
              setSelectedLanguages(languages);
              handleFiltersChange(undefined, languages);
            }}
            onCurrencyChange={(currency) => {
              setSelectedCurrency(currency);
              handleFiltersChange(undefined, undefined, currency);
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <TeacherSearch onSearch={handleSearch} />
          <TeacherList teachers={teachers} />
        </div>
      </div>
    </div>
  );
}

export default TeacherDirectory;