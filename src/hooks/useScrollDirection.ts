import { useState, useEffect } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  initialDirection?: 'up' | 'down';
  navHeight?: number; // Height of the navigation bar in pixels
}

export function useScrollDirection({
  threshold = 10,
  initialDirection = 'up',
  navHeight = 80, // Default to 80px (h-20 in Tailwind)
}: UseScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>(
    initialDirection
  );
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (Math.abs(currentScrollY - lastScrollY) < threshold) {
        return; // Ignore small scroll movements
      }

      const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';

      // Update visibility and animation behavior
      if (newDirection === 'down') {
        // When scrolling down, let it scroll naturally (no animation)
        setShouldAnimate(false);
      } else {
        // When scrolling up, show with animation
        setIsVisible(true);
        setShouldAnimate(true);
      }

      setScrollDirection(newDirection);
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, threshold]);

  return {
    scrollDirection,
    isVisible,
    lastScrollY,
    shouldAnimate,
  };
}
