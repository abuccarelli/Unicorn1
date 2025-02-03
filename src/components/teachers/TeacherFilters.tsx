import React, { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { subjectCategories } from '../../data/subjects';
import { languages } from '../../data/languages';
import { currencies } from '../../data/currencies';

interface TeacherFiltersProps {
  selectedSubjects: string[];
  selectedLanguages: string[];
  selectedCurrency: string;
  onSubjectsChange: (subjects: string[]) => void;
  onLanguagesChange: (languages: string[]) => void;
  onCurrencyChange: (currency: string) => void;
}

export function TeacherFilters({
  selectedSubjects,
  selectedLanguages,
  selectedCurrency,
  onSubjectsChange,
  onLanguagesChange,
  onCurrencyChange,
}: TeacherFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<'subjects' | 'languages' | 'currency' | null>(null);

  const toggleDropdown = (dropdown: 'subjects' | 'languages' | 'currency') => {
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
          {selectedCurrency && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {selectedCurrency}
              <button
                onClick={() => onCurrencyChange('')}
                className="ml-1.5 inline-flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
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
                  <div className="py-1 max-h-60 overflow-auto">
                    {subjectCategories.map(category => (
                      <div key={category.name} className="px-4 py-2">
                        <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                        <div className="mt-2 space-y-2">
                          {category.subjects.map(subject => (
                            <label key={subject} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedSubjects.includes(subject)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    onSubjectsChange([...selectedSubjects, subject]);
                                  } else {
                                    onSubjectsChange(selectedSubjects.filter(s => s !== subject));
                                  }
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-600">{subject}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
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
                  <div className="py-1 max-h-60 overflow-auto">
                    {languages.map(language => (
                      <label key={language} className="flex items-center px-4 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onLanguagesChange([...selectedLanguages, language]);
                            } else {
                              onLanguagesChange(selectedLanguages.filter(l => l !== language));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('currency')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Currency
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {openDropdown === 'currency' && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={handleClickOutside}
                />
                <div className="absolute z-20 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onCurrencyChange('');
                        handleClickOutside();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      All Currencies
                    </button>
                    {currencies.map(currency => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          onCurrencyChange(currency.code);
                          handleClickOutside();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </button>
                    ))}
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