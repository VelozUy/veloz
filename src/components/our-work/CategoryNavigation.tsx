'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

  // Keyboard navigation
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
        <Tabs value={activeCategory} onValueChange={onCategoryChange}>
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
            {categories.map(category => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-base uppercase tracking-tight border-b-2 border-transparent hover:border-primary hover:text-primary text-muted-foreground transition-all duration-200 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <Tabs value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
          {categories.map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-base uppercase tracking-tight border-b-2 border-transparent hover:border-primary hover:text-primary text-muted-foreground transition-all duration-200 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
