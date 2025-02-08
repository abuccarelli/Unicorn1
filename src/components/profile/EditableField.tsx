import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { SubjectSelector } from './SubjectSelector';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'textarea' | 'subjects' | 'languages' | 'currency' | 'number' | 'date' | 'email' | 'tel';
  subjects?: string[];
  languages?: string[];
  placeholder?: string;
  hideLabel?: boolean;
  required?: boolean;
  dateFormat?: string;
}

export function EditableField({ 
  label, 
  value, 
  onSave, 
  type = 'text',
  subjects = [],
  languages = [],
  placeholder,
  hideLabel = false,
  required = false,
  dateFormat = 'DD.MM.YYYY'
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [selectedSubjects, setSelectedSubjects] = useState(subjects);
  const [selectedLanguages, setSelectedLanguages] = useState(languages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if ((type === 'subjects' && JSON.stringify(selectedSubjects) === JSON.stringify(subjects)) ||
        (type === 'languages' && JSON.stringify(selectedLanguages) === JSON.stringify(languages)) ||
        (type !== 'subjects' && type !== 'languages' && editValue === value)) {
      setIsEditing(false);
      return;
    }

    // Validate required fields
    if (required && !editValue) {
      setError(`${label} is required`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (type === 'subjects') {
        await onSave(selectedSubjects.join(','));
      } else if (type === 'languages') {
        await onSave(selectedLanguages.join(','));
      } else if (type === 'date') {
        // Convert date to DD.MM.YYYY format
        const date = new Date(editValue);
        const formattedDate = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '.');
        await onSave(formattedDate);
      } else {
        await onSave(editValue);
      }
      setIsEditing(false);
    } catch (err) {
      if (type === 'subjects') {
        setSelectedSubjects(subjects);
      } else if (type === 'languages') {
        setSelectedLanguages(languages);
      } else {
        setEditValue(value);
      }
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (type === 'subjects') {
      setSelectedSubjects(subjects);
    } else if (type === 'languages') {
      setSelectedLanguages(languages);
    } else {
      setEditValue(value);
    }
    setError(null);
    setIsEditing(false);
  };

  const renderEditContent = () => {
    switch (type) {
      case 'subjects':
        return (
          <SubjectSelector
            selectedSubjects={selectedSubjects}
            onChange={setSelectedSubjects}
          />
        );
      case 'languages':
        return (
          <LanguageSelector
            selectedLanguages={selectedLanguages}
            onChange={setSelectedLanguages}
          />
        );
      case 'currency':
        return (
          <CurrencySelector
            value={editValue}
            onChange={setEditValue}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
          />
        );
      case 'tel':
        return (
          <input
            type="tel"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
            pattern="[0-9+\-\s()]+"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
            step="0.01"
            min="0"
          />
        );
      default:
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={placeholder}
            required={required}
          />
        );
    }
  };

  const renderViewContent = () => {
    if (type === 'subjects' || type === 'languages') {
      const items = type === 'subjects' ? subjects : languages;
      return items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span
              key={item}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        `No ${type} selected`
      );
    }
    if (type === 'date' && value) {
      const date = new Date(value);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.');
    }
    return value || 'Not set';
  };

  return (
    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <div className="text-sm font-medium text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {isEditing ? (
          <div className="space-y-2">
            {renderEditContent()}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {renderViewContent()}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}