import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { subjectCategories } from '../../data/subjects';

interface SubjectSelectorProps {
  selectedSubjects: string[];
  onChange: (subjects: string[]) => void;
}

export function SubjectSelector({ selectedSubjects, onChange }: SubjectSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (e: React.MouseEvent, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSubject = (e: React.MouseEvent, subject: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    onChange(newSubjects);
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
      {subjectCategories.map(category => (
        <div key={category.name} className="border rounded-lg">
          <button
            type="button"
            onClick={(e) => toggleCategory(e, category.name)}
            className="w-full px-4 py-2 text-left font-medium text-gray-900 hover:bg-gray-50 focus:outline-none"
          >
            {category.name}
          </button>
          
          {expandedCategories.includes(category.name) && (
            <div className="px-4 pb-2 space-y-2">
              {category.subjects.map(subject => (
                <div key={subject} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => toggleSubject(e, subject)}
                    className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                      selectedSubjects.includes(subject) 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-gray-300'
                    }`}>
                      {selectedSubjects.includes(subject) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span>{subject}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}