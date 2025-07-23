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

// Dynamic Title Component
const DynamicTitle: React.FC<{ text: string }> = ({ text }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(8); // Start with max size in rem

  useEffect(() => {
    const calculateOptimalFontSize = () => {
      if (!titleRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const title = titleRef.current;
      
      // Get container dimensions with padding
      const containerRect = container.getBoundingClientRect();
      const containerStyle = window.getComputedStyle(container);
      const paddingLeft = parseInt(containerStyle.paddingLeft);
      const paddingRight = parseInt(containerStyle.paddingRight);
      const availableWidth = containerRect.width - paddingLeft - paddingRight;

      // Binary search for optimal font size
      let minSize = 1.5; // 1.5rem minimum
      let maxSize = 12;   // 12rem maximum (increased for better fitting)
      let optimalSize = minSize;

      // Create a temporary element to measure text
      const tempElement = document.createElement('span');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'nowrap';
      tempElement.style.fontFamily = window.getComputedStyle(title).fontFamily;
      tempElement.style.fontWeight = window.getComputedStyle(title).fontWeight;
      tempElement.style.textTransform = 'uppercase';
      tempElement.style.letterSpacing = '-0.025em'; // tracking-tight
      tempElement.textContent = text;
      document.body.appendChild(tempElement);

      try {
        // Binary search for the largest font size that fits
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
      } finally {
        document.body.removeChild(tempElement);
      }
    };

    // Calculate on mount and text change
    calculateOptimalFontSize();

    // Recalculate on window resize
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateOptimalFontSize, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver if available for more precise container size changes
    let resizeObserver: ResizeObserver;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(calculateOptimalFontSize, 50);
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
  }, [text]);

  return (
    <div ref={containerRef} className="container mx-auto px-8 md:px-16 text-center">
      <h1
        ref={titleRef}
        className="font-body tracking-tight text-center w-full text-foreground leading-none whitespace-nowrap uppercase transition-all duration-300 ease-out"
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
        <DynamicTitle text={displayTitle} />
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
