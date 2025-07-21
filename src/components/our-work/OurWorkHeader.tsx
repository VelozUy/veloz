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
  const { activeCategory: scrollActiveCategory, scrollToCategory } =
    useScrollNavigation({
      categories: categoryIds,
      scrollThreshold: 100,
    });

  // Use provided activeCategory or fall back to scroll-based one
  const effectiveActiveCategory = activeCategory || scrollActiveCategory;

  // Determine the title to display
  const displayTitle = title || (locale === 'en' ? 'Events' : 'Eventos');

  return (
    <>
      {/* Page Header - Editorial Spacing (Reduced for reference design) */}
      <header className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-8 md:px-16 text-center">
          {/* Main Title - More Compact Spacing */}
          <h1
            className="font-body tracking-tight text-center w-full text-foreground leading-none whitespace-nowrap uppercase"
            style={{
              fontSize: 'clamp(1.5rem, min(6vw, 8rem), 8rem)',
              lineHeight: '0.9',
            }}
          >
            {displayTitle}
          </h1>
        </div>
      </header>

      {/* Category Navigation - More Compact Spacing */}
      <div className="py-4 md:py-6 bg-background">
        <CategoryNavigation
          categories={categories}
          activeCategory={effectiveActiveCategory}
          onCategoryChange={scrollToCategory}
        />
      </div>
    </>
  );
}
