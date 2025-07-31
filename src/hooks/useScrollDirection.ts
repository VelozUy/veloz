import { useState, useEffect } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  initialDirection?: 'up' | 'down';
}

export function useScrollDirection({
  threshold = 10,
  initialDirection = 'up',
}: UseScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>(
    initialDirection
  );
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (Math.abs(currentScrollY - lastScrollY) < threshold) {
        return; // Ignore small scroll movements
      }

      const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';

      // Update visibility based on scroll direction
      if (newDirection === 'down') {
        setIsVisible(false); // Hide when scrolling down
      } else {
        setIsVisible(true); // Show when scrolling up
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
  };
}
