import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { subjectCategories } from '../../data/subjects';

interface SubjectSelectorProps {
  selectedSubjects: string[];
  onChange: (subjects: string[]) => void;
}

export function SubjectSelector({ selectedSubjects, onChange }: SubjectSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSubject = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    onChange(newSubjects);
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {subjectCategories.map(category => (
        <div key={category.name} className="border rounded-lg">
          <button
            onClick={() => toggleCategory(category.name)}
            className="w-full px-4 py-2 text-left font-medium text-gray-900 hover:bg-gray-50 focus:outline-none"
          >
            {category.name}
          </button>
          
          {expandedCategories.includes(category.name) && (
            <div className="px-4 pb-2 space-y-2">
              {category.subjects.map(subject => (
                <label
                  key={subject}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{subject}</span>
                  {selectedSubjects.includes(subject) && (
                    <Check className="h-4 w-4 text-indigo-600" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}