import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = useCallback(() => {
    if (!input.trim()) return;

    const newTag = input.trim();
    const normalizedTags = tags.map(t => t.toLowerCase());
    
    if (!normalizedTags.includes(newTag.toLowerCase())) {
      onChange([...tags, newTag]);
    }
    setInput('');
  }, [input, tags, onChange]);

  const removeTag = useCallback((indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  }, [tags, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  }, [input, tags, addTag, removeTag]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add tag"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-indigo-400 hover:text-indigo-600 focus:outline-none"
              aria-label={`Remove ${tag} tag`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}