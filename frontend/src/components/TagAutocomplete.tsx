import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTags } from '@/contexts/TagsContext';
import { Tag } from '@/types/types';

interface TagAutocompleteProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
}

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = 'Select tags...'
}) => {
  const { tags, loading } = useTags();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tags based on input
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.some(selected => selected.id === tag.id)
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredTags.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && filteredTags[highlightedIndex]) {
            handleSelectTag(filteredTags[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredTags]);

  const handleSelectTag = (tag: Tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  if (loading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            className="flex items-center justify-between gap-1"
          >
            <span>{tag.name}</span>
            <button
              type="button"
              className="ml-1 rounded-full hover:bg-white/30"
              onClick={() => handleRemoveTag(tag.id)}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>

      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full"
      />

      {isOpen && filteredTags.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredTags.map((tag, index) => (
            <div
              key={tag.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => handleSelectTag(tag)}
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                ></div>
                {tag.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredTags.length === 0 && inputValue && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2">
          No tags found
        </div>
      )}
    </div>
  );
};

export default TagAutocomplete;