'use client';

import React from 'react';
import CategoryNavigation from './CategoryNavigation';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';

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

  return (
    <>
      {/* Category navigation */}
      <div className="bg-background h-24 md:h-28 flex items-center">
        <div className="max-w-border-64 mx-auto px-4">
          <CategoryNavigation
            categories={categories}
            activeCategory={activeCategory || 'overview'}
            onCategoryChange={scrollToCategory}
            backgroundClass="bg-background"
          />
        </div>
      </div>
    </>
  );
}
