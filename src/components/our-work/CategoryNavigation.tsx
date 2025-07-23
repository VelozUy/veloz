'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle mobile select change with proper URL navigation
  const handleMobileSelectChange = (categoryId: string) => {
    // Navigate to the appropriate URL
    if (categoryId === 'overview') {
      router.push('/our-work');
    } else {
      router.push(`/our-work/${categoryId}`);
    }
    
    // Also call the original onCategoryChange for any scroll-based logic
    onCategoryChange(categoryId);
  };

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
          const nextCategory = categories[nextIndex];
          // Navigate to URL instead of just calling onCategoryChange
          if (nextCategory.id === 'overview') {
            router.push('/our-work');
          } else {
            router.push(`/our-work/${nextCategory.id}`);
          }
          onCategoryChange(nextCategory.id);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex =
            currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
          const prevCategory = categories[prevIndex];
          // Navigate to URL instead of just calling onCategoryChange
          if (prevCategory.id === 'overview') {
            router.push('/our-work');
          } else {
            router.push(`/our-work/${prevCategory.id}`);
          }
          onCategoryChange(prevCategory.id);
          break;
        case 'Home':
          e.preventDefault();
          router.push('/our-work');
          onCategoryChange(categories[0].id);
          break;
        case 'End':
          e.preventDefault();
          const lastCategory = categories[categories.length - 1];
          if (lastCategory.id === 'overview') {
            router.push('/our-work');
          } else {
            router.push(`/our-work/${lastCategory.id}`);
          }
          onCategoryChange(lastCategory.id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories, activeCategory, onCategoryChange, router]);

  // Get display name for active category to show in mobile select
  const getActiveCategoryDisplayName = () => {
    const activeItem = categories.find(cat => cat.id === activeCategory);
    if (!activeItem) return 'Seleccionar categoría';
    
    return activeItem.id === 'overview'
      ? activeItem.name
      : getCategoryDisplayName(activeItem.name as EventCategory, 'es');
  };

  // Prevent hydration mismatch by showing loading state
  if (!mounted) {
    return (
      <div className={cn('w-full', className)}>
        {/* Mobile Select Skeleton */}
        <div className="block md:hidden">
          <div className="w-full h-12 bg-muted animate-pulse rounded-none" />
        </div>

        {/* Desktop Tabs Skeleton */}
        <div className="hidden md:block">
          <div className="w-full justify-center bg-transparent rounded-none p-0 h-auto px-4 md:px-8 gap-6 md:gap-8 flex">
            {categories.map(category => (
              <div
                key={category.id}
                className="h-8 w-20 bg-muted animate-pulse rounded-none"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Select - visible on small screens with improved UX */}
      <div className="block md:hidden px-4">
        <Select value={activeCategory} onValueChange={handleMobileSelectChange}>
          <SelectTrigger 
            className={cn(
              'w-full min-h-[48px] h-auto rounded-none border-border bg-card text-card-foreground',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'touch-manipulation text-base font-medium',
              'shadow-sm hover:shadow-md transition-shadow duration-200'
            )}
            sectionType="content"
            priority="medium"
          >
            <SelectValue placeholder="Seleccionar categoría">
              <span className="font-medium text-foreground">
                {getActiveCategoryDisplayName()}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent 
            className="rounded-none border-border shadow-lg"
            sectionType="content"
            priority="high"
          >
            {categories.map(category => (
              <SelectItem 
                key={category.id} 
                value={category.id}
                className={cn(
                  'min-h-[48px] text-base font-medium rounded-none',
                  'focus:bg-accent focus:text-accent-foreground',
                  'cursor-pointer touch-manipulation',
                  activeCategory === category.id && 'bg-primary/10 text-primary font-semibold'
                )}
              >
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

      {/* Desktop Tabs - visible on medium screens and up with improved styling */}
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
                  'relative inline-flex items-center px-2 py-3 text-base uppercase tracking-tight transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  'hover:text-primary font-medium',
                  'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:transition-all after:duration-300',
                  isActive
                    ? 'text-primary after:bg-primary after:opacity-100'
                    : 'text-muted-foreground after:bg-primary after:opacity-0 hover:after:opacity-50'
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
