import { useCallback, useRef } from 'react';

interface TouchGestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
}

interface TouchGestureOptions {
  minSwipeDistance?: number;
  maxTapTime?: number;
  doubleTapDelay?: number;
}

/**
 * useTouchGestures Hook
 *
 * Custom hook for handling touch gestures in fullscreen modal.
 * Provides swipe detection, tap handling, and double-tap functionality.
 * Optimized for performance with passive event listeners.
 */
export const useTouchGestures = (
  callbacks: TouchGestureCallbacks,
  options: TouchGestureOptions = {}
) => {
  const {
    minSwipeDistance = 50,
    maxTapTime = 300,
    doubleTapDelay = 300,
  } = options;

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  
  const lastTapRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const start = touchStartRef.current;
    const end = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = start.x - end.x;
    const deltaY = start.y - end.y;
    const deltaTime = end.time - start.time;

    // Check if it's a tap (short duration, small movement)
    const isTap = deltaTime < maxTapTime && 
                  Math.abs(deltaX) < minSwipeDistance && 
                  Math.abs(deltaY) < minSwipeDistance;

    if (isTap) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < doubleTapDelay) {
        // Double tap
        callbacks.onDoubleTap?.();
        lastTapRef.current = 0; // Reset to prevent triple tap
      } else {
        // Single tap
        callbacks.onTap?.();
        lastTapRef.current = now;
      }
    } else {
      // Check for swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        // Horizontal swipe
        if (deltaX > 0) {
          callbacks.onSwipeLeft?.();
        } else {
          callbacks.onSwipeRight?.();
        }
      } else if (Math.abs(deltaY) > minSwipeDistance) {
        // Vertical swipe
        if (deltaY > 0) {
          callbacks.onSwipeUp?.();
        } else {
          callbacks.onSwipeDown?.();
        }
      }
    }

    // Reset touch start
    touchStartRef.current = null;
  }, [callbacks, minSwipeDistance, maxTapTime, doubleTapDelay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent default to avoid scrolling when modal is open
    e.preventDefault();
  }, []);

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
  };
};

export default useTouchGestures; 