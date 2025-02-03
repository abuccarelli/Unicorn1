import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { languages } from '../../data/languages';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
}

export function LanguageSelector({ selectedLanguages, onChange }: LanguageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = languages.filter(language =>
    language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLanguage = (language: string) => {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    onChange(newLanguages);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredLanguages.map(language => (
          <label
            key={language}
            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <input
              type="checkbox"
              checked={selectedLanguages.includes(language)}
              onChange={() => toggleLanguage(language)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>{language}</span>
            {selectedLanguages.includes(language) && (
              <Check className="h-4 w-4 text-indigo-600" />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}