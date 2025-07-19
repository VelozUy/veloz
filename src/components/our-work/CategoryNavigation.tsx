'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  label: string;
}

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export default function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: CategoryNavigationProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    let lastScrollTime = Date.now();
    let lastScrollY = window.scrollY;
    let scrollSpeed = 0;
    let consecutiveFastScrolls = 0;

    const handleScroll = () => {
      const now = Date.now();
      const currentScrollY = window.scrollY;
      const timeDelta = now - lastScrollTime;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);

      // Calculate scroll speed (pixels per millisecond)
      scrollSpeed = timeDelta > 0 ? scrollDelta / timeDelta : 0;

      // Only show navigation if scrolling fast (more than 0.27 pixels per millisecond)
      // This means scrolling 27 pixels in 100ms or faster
      if (scrollSpeed > 0.27) {
        consecutiveFastScrolls++;

        // Only show navigation after 2 consecutive fast scroll events
        // This prevents showing on accidental fast movements
        if (consecutiveFastScrolls >= 2) {
          console.log(
            `🔄 Fast scroll detected - speed: ${scrollSpeed.toFixed(2)} px/ms (${consecutiveFastScrolls} consecutive)`
          );
          setIsScrolling(true);

          // Clear existing timeout
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }

          // Set timeout to hide navigation
          scrollTimeout = setTimeout(() => {
            console.log('⏰ Scroll timeout - hiding navigation');
            setIsScrolling(false);
            consecutiveFastScrolls = 0; // Reset counter when hiding
          }, 1500);
        }
      } else {
        // Reset counter if scrolling slowly
        consecutiveFastScrolls = 0;
      }

      // Update tracking variables
      lastScrollTime = now;
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = categories.findIndex(
        cat => cat.id === activeCategory
      );

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % categories.length;
          onCategoryChange(categories[nextIndex].id);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex =
            currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
          onCategoryChange(categories[prevIndex].id);
          break;
        case 'Home':
          e.preventDefault();
          onCategoryChange(categories[0].id);
          break;
        case 'End':
          e.preventDefault();
          onCategoryChange(categories[categories.length - 1].id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories, activeCategory, onCategoryChange]);

  // Calculate progress for mobile
  const progressValue =
    categories.length > 0
      ? ((categories.findIndex(cat => cat.id === activeCategory) + 1) /
          categories.length) *
        100
      : 0;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          'fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block',
          className
        )}
      >
        <div className="p-4">
          <div className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Vertical Navigation */}
      <div
        className={cn(
          'fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block',
          className
        )}
      >
        <motion.div
          className="p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            {categories.map(category => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={cn(
                    'block w-full text-left px-4 py-3 text-sm font-medium transition-colors relative group',
                    isActive
                      ? 'text-primary'
                      : 'text-foreground/80 hover:text-primary'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="relative">
                    {category.name}
                    <span
                      className={cn(
                        'absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200',
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      )}
                    />
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Mobile Navigation - Sidebar that shows when scrolling */}
      <AnimatePresence>
        {isScrolling && (
          <motion.div
            className="fixed left-6 top-1/2 -translate-y-1/2 z-50 lg:hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                {categories.map(category => {
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => onCategoryChange(category.id)}
                      className={cn(
                        'block w-full text-left px-4 py-3 text-sm font-medium transition-colors relative group',
                        isActive
                          ? 'text-primary'
                          : 'text-foreground/80 hover:text-primary'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="relative">
                        {category.name}
                        <span
                          className={cn(
                            'absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200',
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                          )}
                        />
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r"
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
