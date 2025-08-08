'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GallerySearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  clearable?: boolean;
  ariaLabel?: string;
}

/**
 * GallerySearch Component
 *
 * A search input component for filtering gallery content. Includes debouncing,
 * clear functionality, and accessibility features. Optimized for gallery search
 * with responsive design.
 */
export default function GallerySearch({
  onSearch,
  placeholder = 'Search gallery...',
  className = '',
  debounceMs = 300,
  clearable = true,
  ariaLabel = 'Search gallery',
}: GallerySearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(searchQuery);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = event.target.value;
      setQuery(newQuery);
      debouncedSearch(newQuery);
    },
    [debouncedSearch]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn('relative flex items-center', 'w-full max-w-md', className)}
    >
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search
          className={cn(
            'w-4 h-4 transition-colors',
            isFocused ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          'w-full pl-10 pr-10 py-2',
          'bg-background border border-input',
          'rounded-md text-sm',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-all duration-200',
          isFocused && 'border-primary/50',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />

      {/* Clear Button */}
      {clearable && query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className={cn(
            'absolute right-3 top-1/2 transform -translate-y-1/2',
            'p-1 rounded-full',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'transition-all duration-200'
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
