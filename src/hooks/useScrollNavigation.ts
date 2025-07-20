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
 * Enhanced with better mobile touch support and improved scroll detection.
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

    // Check all categories
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

    // Scroll to specific category
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

  // Enhanced scroll event listener with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && !isScrolling) {
        requestAnimationFrame(() => {
          detectActiveCategory();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Add touch event listeners for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const touchDiff = touchStartY - touchEndY;

      // If significant touch movement, update active category after a delay
      if (Math.abs(touchDiff) > 50) {
        setTimeout(() => {
          detectActiveCategory();
        }, 100);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
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
