'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseScrollNavigationProps {
  categories: string[];
  scrollThreshold?: number;
}

interface UseScrollNavigationReturn {
  activeCategory: string;
  isScrolling: boolean;
  scrollToCategory: (categoryId: string) => void;
  scrollToTop: () => void;
}

/**
 * useScrollNavigation Hook
 *
 * Manages scroll-based navigation between categories with smooth scrolling
 * and active category detection based on scroll position.
 */
export const useScrollNavigation = ({
  categories,
  scrollThreshold = 100,
}: UseScrollNavigationProps): UseScrollNavigationReturn => {
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0] || ''
  );
  const [isScrolling, setIsScrolling] = useState(false);

  // Detect active category based on scroll position
  const detectActiveCategory = useCallback(() => {
    if (isScrolling) return; // Don't update during programmatic scrolling

    const scrollPosition = window.scrollY + scrollThreshold;

    for (let i = categories.length - 1; i >= 0; i--) {
      const categoryId = categories[i];
      const element = document.getElementById(`category-${categoryId}`);

      if (element) {
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          if (activeCategory !== categoryId) {
            setActiveCategory(categoryId);
          }
          break;
        }
      }
    }
  }, [categories, activeCategory, isScrolling, scrollThreshold]);

  // Smooth scroll to category
  const scrollToCategory = useCallback((categoryId: string) => {
    setIsScrolling(true);
    setActiveCategory(categoryId);

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 1000);
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    setIsScrolling(true);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    setTimeout(() => setIsScrolling(false), 1000);
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (!isScrolling) {
        detectActiveCategory();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [detectActiveCategory, isScrolling]);

  // Initialize active category on mount
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  return {
    activeCategory,
    isScrolling,
    scrollToCategory,
    scrollToTop,
  };
};

export default useScrollNavigation;
