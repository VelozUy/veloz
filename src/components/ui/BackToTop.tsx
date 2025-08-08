'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToTopProps {
  className?: string;
  threshold?: number;
  smooth?: boolean;
  showText?: boolean;
  ariaLabel?: string;
}

/**
 * BackToTop Component
 *
 * A button that appears when the user scrolls down and allows them to smoothly
 * scroll back to the top of the page. Includes accessibility features and
 * responsive design.
 */
export default function BackToTop({
  className = '',
  threshold = 400,
  smooth = true,
  showText = false,
  ariaLabel = 'Back to top',
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Check if user prefers reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Handle scroll detection
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsVisible(scrollY > threshold);
  }, [threshold]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (smooth && !prefersReducedMotion) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'auto',
      });
    }
  }, [smooth, prefersReducedMotion]);

  // Add scroll event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial state
    handleScroll();

    // Add event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        // Base styles
        'fixed bottom-6 right-6 z-50',
        'flex items-center justify-center',
        'w-12 h-12 sm:w-14 sm:h-14',
        'bg-primary text-primary-foreground',
        'rounded-full shadow-lg',
        'transition-all duration-300 ease-in-out',
        'hover:bg-primary/90 hover:scale-110',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'active:scale-95',
        // Animation
        'animate-in fade-in-0 slide-in-from-bottom-2',
        // Responsive text
        showText && 'w-auto px-4 gap-2',
        className
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
      {showText && (
        <span className="hidden sm:inline text-sm font-medium">
          Back to top
        </span>
      )}
    </button>
  );
}
