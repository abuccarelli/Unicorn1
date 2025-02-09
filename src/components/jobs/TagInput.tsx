import React, { useState, useCallback } from 'react';
import { Tag as TagIcon, Plus, X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  const formatTag = useCallback((tag: string): string => {
    return tag
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  const addTag = useCallback(() => {
    if (!input.trim()) return;

    const formattedTag = formatTag(input);
    const normalizedTags = tags.map(t => t.toLowerCase());
    
    if (!normalizedTags.includes(formattedTag.toLowerCase())) {
      const uniqueTags = [...new Set([...tags, formattedTag])];
      onChange(uniqueTags);
    }
    setInput('');
  }, [input, tags, onChange, formatTag]);

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
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors"
          >
            <TagIcon className="h-3.5 w-3.5 text-gray-500" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="rounded-full p-0.5 hover:bg-gray-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}