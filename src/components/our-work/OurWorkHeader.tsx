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

// All possible titles that could appear in the header
const POSSIBLE_TITLES = [
  'EVENTOS',
  'CASAMIENTOS', 
  'CORPORATIVOS',
  'CULTURALES',
  'PHOTOSHOOT',
  'PRENSA',
  'OTROS',
];

// Responsive Static Title Component - Fixed sizes for mobile and desktop
const StaticTitle: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 text-center">
      <h1
        className="font-body tracking-tight text-center w-full text-foreground leading-none whitespace-nowrap uppercase text-5xl md:text-8xl"
      >
        {text}
      </h1>
    </div>
  );
};

export default function OurWorkHeader({
  categories,
  locale,
  title,
  activeCategory,
}: OurWorkHeaderProps) {
  const categoryIds = categories.map(cat => cat.id);
  const { scrollToCategory } = useScrollNavigation({
    categories: categoryIds,
    scrollThreshold: 100,
  });

  // Determine the display title
  let displayTitle = title || 'EVENTOS';
  
  // If we have an activeCategory, try to find its title
  if (activeCategory && categories.length > 0) {
    const activeCat = categories.find(cat => cat.id === activeCategory);
    if (activeCat?.title) {
      displayTitle = activeCat.title.toUpperCase();
    }
  }

  return (
    <>
      {/* Category navigation */}
      <div className="py-8 md:py-12 bg-background">
        <CategoryNavigation
          categories={categories}
          activeCategory={activeCategory || 'overview'}
          onCategoryChange={scrollToCategory}
        />
      </div>
    </>
  );
}
