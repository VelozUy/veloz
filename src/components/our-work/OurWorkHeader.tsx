'use client';

import React from 'react';
import CategoryNavigation from './CategoryNavigation';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import { getCategoryDisplayName } from '@/constants/categories';
import { EventCategory } from '@/constants/categories';

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
  title?: string; // Optional custom title, defaults to "Eventos"
  activeCategory?: string; // Optional active category override
}

export default function OurWorkHeader({
  categories,
  locale,
  title,
  activeCategory,
}: OurWorkHeaderProps) {
  const categoryIds = categories.map(cat => cat.id);

  // useScrollNavigation for scroll-based navigation
  const { activeCategory: scrollActiveCategory, scrollToCategory } = useScrollNavigation({
    categories: categoryIds,
    scrollThreshold: 100,
  });

  // Use provided activeCategory or fall back to scroll-based one
  const effectiveActiveCategory = activeCategory || scrollActiveCategory;

  // Determine the title to display
  const displayTitle = title || (locale === 'en' ? 'Events' : 'Eventos');

  return (
    <>
      {/* Page Header */}
      <header className="py-16 bg-background">
        <div className="container mx-auto px-8 text-center">
          {/* Main Title */}
          <h1 className="font-body tracking-tight text-center w-full text-foreground mb-8 leading-none whitespace-nowrap uppercase"
               style={{
                 fontSize: 'clamp(1.5rem, min(6vw, 8rem), 8rem)',
                 lineHeight: '0.9',
               }}>
            {displayTitle}
          </h1>
        </div>
      </header>

      {/* Category Navigation */}
      <CategoryNavigation
        categories={categories}
        activeCategory={effectiveActiveCategory}
        onCategoryChange={scrollToCategory}
      />
    </>
  );
} 