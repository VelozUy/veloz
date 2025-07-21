'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCategoryDisplayName, EventCategory } from '@/constants/categories';

interface Category {
  id: string;
  name: string;
  label: string;
}

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export default function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: CategoryNavigationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation for desktop tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = categories.findIndex(
        cat => cat.id === activeCategory
      );

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % categories.length;
          onCategoryChange(categories[nextIndex].id);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex =
            currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
          onCategoryChange(categories[prevIndex].id);
          break;
        case 'Home':
          e.preventDefault();
          onCategoryChange(categories[0].id);
          break;
        case 'End':
          e.preventDefault();
          onCategoryChange(categories[categories.length - 1].id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories, activeCategory, onCategoryChange]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn('w-full', className)}>
        {/* Mobile Select - visible on small screens */}
        <div className="block md:hidden">
          <Select value={activeCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.id === 'overview'
                    ? category.name
                    : getCategoryDisplayName(
                        category.name as EventCategory,
                        'es'
                      )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs - visible on medium screens and up */}
        <div className="hidden md:block">
          <div className="w-full justify-center bg-transparent rounded-none p-0 h-auto px-4 md:px-8 gap-6 md:gap-8 flex">
            {categories.map(category => {
              const isActive = category.id === activeCategory;
              return (
                <Link
                  key={category.id}
                  href={
                    category.id === 'overview'
                      ? '/our-work'
                      : `/our-work/${category.id}`
                  }
                  className={cn(
                    'inline-flex items-center px-1 pb-1 text-base uppercase tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'border-b-2 border-primary text-primary'
                      : 'hover:border-b-2 hover:border-primary hover:text-primary text-muted-foreground'
                  )}
                  onClick={() => onCategoryChange(category.id)}
                >
                  {category.id === 'overview'
                    ? category.name
                    : getCategoryDisplayName(
                        category.name as EventCategory,
                        'es'
                      )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Select - visible on small screens */}
      <div className="block md:hidden">
        <Select value={activeCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.id === 'overview'
                  ? category.name
                  : getCategoryDisplayName(
                      category.name as EventCategory,
                      'es'
                    )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs - visible on medium screens and up */}
      <div className="hidden md:block">
        <div className="w-full justify-center bg-transparent rounded-none p-0 h-auto px-4 md:px-8 gap-6 md:gap-8 flex">
          {categories.map(category => {
            const isActive = category.id === activeCategory;
            return (
              <Link
                key={category.id}
                href={
                  category.id === 'overview'
                    ? '/our-work'
                    : `/our-work/${category.id}`
                }
                className={cn(
                  'inline-flex items-center px-1 pb-1 text-base uppercase tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'border-b-2 border-primary text-primary'
                    : 'hover:border-b-2 hover:border-primary hover:text-primary text-muted-foreground'
                )}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.id === 'overview'
                  ? category.name
                  : getCategoryDisplayName(
                      category.name as EventCategory,
                      'es'
                    )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
