'use client';

import React from 'react';
import CategoryNavigation from './CategoryNavigation';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import { useContentBackground } from '@/hooks/useBackground';

interface Category {
  id: string;
  name: string;
  label: string;
  title: string;
  description: string;
  eventTypes: string[];
}

interface OurWorkHeaderProps {
  categories: Category[];
  locale: string;
  activeCategory?: string; // Optional active category override
}

export default function OurWorkHeader({
  categories,
  locale,
  activeCategory,
}: OurWorkHeaderProps) {
  const categoryIds = categories.map(cat => cat.id);
  const { scrollToCategory } = useScrollNavigation({
    categories: categoryIds,
    scrollThreshold: 100,
  });

  // Use the new background system for content sections
  const { classes: contentClasses } = useContentBackground();

  return (
    <>
      {/* Category navigation */}
      <div className={`${contentClasses.background} h-24 md:h-28 flex items-center`}>
        <div className="container mx-auto px-4">
          <CategoryNavigation
            categories={categories}
            activeCategory={activeCategory || 'overview'}
            onCategoryChange={scrollToCategory}
            backgroundClass={contentClasses.background}
          />
        </div>
      </div>
    </>
  );
}
