import React, { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { SubjectSelector } from '../profile/SubjectSelector';
import { LanguageSelector } from '../profile/LanguageSelector';

interface JobFiltersProps {
  selectedSubjects: string[];
  selectedLanguages: string[];
  onSubjectsChange: (subjects: string[]) => void;
  onLanguagesChange: (languages: string[]) => void;
}

export function JobFilters({
  selectedSubjects,
  selectedLanguages,
  onSubjectsChange,
  onLanguagesChange,
}: JobFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<'subjects' | 'languages' | null>(null);

  const toggleDropdown = (dropdown: 'subjects' | 'languages') => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleClickOutside = () => {
    setOpenDropdown(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
      </div>

      <div className="space-y-4">
        {/* Selected Filters */}
        <div className="flex flex-wrap gap-2">
          {selectedSubjects.map(subject => (
            <span
              key={subject}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {subject}
              <button
                onClick={() => onSubjectsChange(selectedSubjects.filter(s => s !== subject))}
                className="ml-1.5 inline-flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedLanguages.map(language => (
            <span
              key={language}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {language}
              <button
                onClick={() => onLanguagesChange(selectedLanguages.filter(l => l !== language))}
                className="ml-1.5 inline-flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-4">
          {/* Subjects Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('subjects')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Subjects
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {openDropdown === 'subjects' && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={handleClickOutside}
                />
                <div className="absolute z-20 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <SubjectSelector
                      selectedSubjects={selectedSubjects}
                      onChange={onSubjectsChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Languages Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('languages')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Languages
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {openDropdown === 'languages' && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={handleClickOutside}
                />
                <div className="absolute z-20 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <LanguageSelector
                      selectedLanguages={selectedLanguages}
                      onChange={onLanguagesChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}