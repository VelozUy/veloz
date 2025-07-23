'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  'CULTURALES Y ARTÍSTICOS', // This is the longest
  'PHOTOSHOOT',
  'PRENSA',
  'OTROS',
  'EVENTS',
  'WEDDINGS',
  'CORPORATE',
  'CULTURAL & ARTISTIC',
  'PRESS',
  'OTHERS'
];

// Get the longest title to use as reference for consistent sizing
const LONGEST_TITLE = POSSIBLE_TITLES.reduce((longest, current) => 
  current.length > longest.length ? current : longest
);

// Consistent Title Component
const ConsistentTitle: React.FC<{ text: string }> = ({ text }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(8); // Start with max size in rem
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    const calculateConsistentFontSize = () => {
      if (!titleRef.current || !containerRef.current) return;

      const container = containerRef.current;
      
      // Get container dimensions with padding
      const containerRect = container.getBoundingClientRect();
      const containerStyle = window.getComputedStyle(container);
      const paddingLeft = parseInt(containerStyle.paddingLeft);
      const paddingRight = parseInt(containerStyle.paddingRight);
      const availableWidth = containerRect.width - paddingLeft - paddingRight;

      // Binary search for optimal font size based on LONGEST possible title
      let minSize = 1.5; // 1.5rem minimum
      let maxSize = 12;   // 12rem maximum
      let optimalSize = minSize;

      // Create a temporary element to measure the LONGEST title (not current text)
      const tempElement = document.createElement('span');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'nowrap';
      tempElement.style.fontFamily = window.getComputedStyle(titleRef.current).fontFamily;
      tempElement.style.fontWeight = window.getComputedStyle(titleRef.current).fontWeight;
      tempElement.style.textTransform = 'uppercase';
      tempElement.style.letterSpacing = '-0.025em'; // tracking-tight
      tempElement.textContent = LONGEST_TITLE; // Use longest title for calculation
      document.body.appendChild(tempElement);

      try {
        // Binary search for the largest font size that fits the longest title
        while (maxSize - minSize > 0.1) {
          const testSize = (minSize + maxSize) / 2;
          tempElement.style.fontSize = `${testSize}rem`;
          
          if (tempElement.offsetWidth <= availableWidth) {
            optimalSize = testSize;
            minSize = testSize;
          } else {
            maxSize = testSize;
          }
        }
        
        setFontSize(optimalSize);
        setIsCalculated(true);
      } finally {
        document.body.removeChild(tempElement);
      }
    };

    // Calculate on mount
    calculateConsistentFontSize();

    // Recalculate only on window resize (not on text change)
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateConsistentFontSize, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver if available for more precise container size changes
    let resizeObserver: ResizeObserver;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(calculateConsistentFontSize, 50);
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []); // Remove text dependency to prevent recalculation on text change

  return (
    <div ref={containerRef} className="container mx-auto px-8 md:px-16 text-center">
      <h1
        ref={titleRef}
        className={`font-body tracking-tight text-center w-full text-foreground leading-none whitespace-nowrap uppercase transition-all duration-300 ease-out ${!isCalculated ? 'opacity-0' : 'opacity-100'}`}
        style={{
          fontSize: `${fontSize}rem`,
          lineHeight: '0.9',
        }}
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
        <ConsistentTitle text={displayTitle} />
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
