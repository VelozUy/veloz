'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle mobile drawer category selection
  const handleMobileCategorySelect = (categoryId: string) => {
    // Close the drawer
    setDrawerOpen(false);
    
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
        {/* Mobile Button Skeleton */}
        <div className="block md:hidden px-4">
          <div className="w-full h-12 bg-muted animate-pulse border border-border" />
        </div>

        {/* Desktop Navigation Skeleton */}
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
      {/* Mobile Custom Button - visible on small screens */}
      <div className="block md:hidden px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            'relative w-full flex items-center justify-center px-4 py-3',
            'bg-background text-foreground',
            'text-lg uppercase tracking-tight font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'transition-all duration-300',
            'after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:transition-all after:duration-300',
            'after:bg-primary after:opacity-100'
          )}
        >
          <span className="text-primary">
            {getActiveCategoryDisplayName()}
          </span>
          <ChevronDownIcon 
            className={cn(
              'absolute right-4 w-5 h-5 text-muted-foreground transition-transform duration-300',
              drawerOpen && 'rotate-180'
            )} 
          />
        </button>

        {/* Custom Dropdown Overlay */}
        {drawerOpen && (
          <div 
            className="fixed inset-0 z-50 bg-transparent"
            onClick={() => setDrawerOpen(false)}
          >
            {/* Dropdown Content - positioned below the button */}
            <div 
              className={cn(
                "absolute left-4 right-4 top-[88px] z-50 bg-background border border-border shadow-xl rounded-none",
                "animate-in slide-in-from-top-2 zoom-in-95 fade-in-0 duration-300 ease-out",
                "transform-gpu"
              )}
              onClick={(e) => e.stopPropagation()}
              style={{
                transformOrigin: 'top center'
              }}
            >
              {/* Category Links */}
              <div className="py-2 max-h-[50vh] overflow-y-auto bg-background">
                {categories.map((category, index) => {
                  const isActive = category.id === activeCategory;
                  const displayName = category.id === 'overview'
                    ? category.name
                    : getCategoryDisplayName(category.name as EventCategory, 'es');
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleMobileCategorySelect(category.id)}
                      className={cn(
                        'relative w-full flex items-center justify-center px-4 py-3',
                        'text-lg uppercase tracking-tight font-medium transition-all duration-300',
                        'hover:bg-accent/20 focus-visible:outline-none focus-visible:bg-accent/20',
                        'border-b border-border/50 last:border-b-0',
                        'after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:transition-all after:duration-300',
                        'animate-in slide-in-from-top-2 fade-in-0 duration-300 ease-out',
                        isActive 
                          ? 'text-primary after:bg-primary after:opacity-100' 
                          : 'text-muted-foreground after:bg-primary after:opacity-0 hover:text-primary hover:after:opacity-50'
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
                  'relative inline-flex items-center px-2 py-3 text-xl uppercase tracking-tight transition-all duration-300',
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
