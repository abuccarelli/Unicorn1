import React, { useState } from 'react';
import { Filter } from 'lucide-react';
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
  onLanguagesChange
}: JobFiltersProps) {
  const [openFilter, setOpenFilter] = useState<'subjects' | 'languages' | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
      </div>

      <div className="space-y-6">
        {/* Selected Filters */}
        <div className="flex flex-wrap gap-2">
          {selectedSubjects.map(subject => (
            <span
              key={subject}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {subject}
              <button
                onClick={() => onSubjectsChange(selectedSubjects.filter(s => s !== subject))}
                className="ml-1.5 inline-flex items-center justify-center"
              >
                ×
              </button>
            </span>
          ))}
          {selectedLanguages.map(language => (
            <span
              key={language}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              {language}
              <button
                onClick={() => onLanguagesChange(selectedLanguages.filter(l => l !== language))}
                className="ml-1.5 inline-flex items-center justify-center"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Filter Sections */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Subjects</h3>
            <SubjectSelector
              selectedSubjects={selectedSubjects}
              onChange={onSubjectsChange}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Languages</h3>
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onChange={onLanguagesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}