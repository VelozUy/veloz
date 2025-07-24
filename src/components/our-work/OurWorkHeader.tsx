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
      <div className={`py-8 md:py-12 ${contentClasses.background}`}>
        <CategoryNavigation
          categories={categories}
          activeCategory={activeCategory || 'overview'}
          onCategoryChange={scrollToCategory}
        />
      </div>
    </>
  );
}
