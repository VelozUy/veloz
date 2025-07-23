'use client';

import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';

interface FullscreenMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  alt: string;
  width: number;
  height: number;
  projectTitle?: string;
}

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: FullscreenMedia[];
  startIndex?: number;
  onNavigate?: (index: number) => void;
}

/**
 * FullscreenModal Component
 *
 * Simple and reliable fullscreen viewing experience for gallery items.
 * Features minimal UI, smooth transitions, and distraction-free viewing.
 */
export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  isOpen,
  onClose,
  media,
  startIndex = 0,
  onNavigate,
}: FullscreenModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [mediaAspectRatios, setMediaAspectRatios] = useState<
    Record<string, number>
  >({});
  const [skeletonAspectRatio, setSkeletonAspectRatio] = useState(1); // Start with square
  const [buttonOpacity, setButtonOpacity] = useState(100); // Button opacity state
  const [lastTouchTime, setLastTouchTime] = useState(0); // Track last touch time

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update current index when startIndex changes
  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  // Get current media
  const currentMedia = media[currentIndex];

  // Initialize loading state for current media
  useEffect(() => {
    if (currentMedia) {
      setLoadingStates(prev => ({
        ...prev,
        [currentMedia.id]: true,
      }));
    }
  }, [currentMedia]);

  // Handle media loading
  const handleMediaLoad = useCallback((mediaId: string) => {
    // Delay the loading state change to allow for smooth transition
    setTimeout(() => {
      setLoadingStates(prev => ({
        ...prev,
        [mediaId]: false,
      }));
    }, 200); // Small delay to allow media to start appearing first
  }, []);

  const handleMediaError = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [mediaId]: false,
    }));
  }, []);

  // Handle button fade behavior
  useEffect(() => {
    if (isOpen) {
      // Show buttons at 100% opacity initially
      setButtonOpacity(100);

      // After 1 second, fade to 20% opacity
      const fadeTimer = setTimeout(() => {
        setButtonOpacity(20);
      }, 1000);

      return () => clearTimeout(fadeTimer);
    }
  }, [isOpen, currentIndex]);

  // Handle touch to show buttons
  const handleTouch = useCallback(() => {
    const now = Date.now();
    setLastTouchTime(now);
    setButtonOpacity(100);

    // Fade back to 20% after 2 seconds of no touch
    setTimeout(() => {
      if (Date.now() - now >= 2000) {
        setButtonOpacity(20);
      }
    }, 2000);
  }, []);

  // Calculate and store aspect ratio for current media
  const currentAspectRatio = useMemo(() => {
    if (!currentMedia) return 1;

    const aspectRatio = currentMedia.width / currentMedia.height;
    setMediaAspectRatios(prev => ({
      ...prev,
      [currentMedia.id]: aspectRatio,
    }));

    return aspectRatio;
  }, [currentMedia]);

  // Animate skeleton aspect ratio
  useEffect(() => {
    if (currentMedia) {
      // Reset to square immediately when media changes
      setSkeletonAspectRatio(1);

      // After a brief delay, animate to the media's aspect ratio
      const timer = setTimeout(() => {
        setSkeletonAspectRatio(currentAspectRatio);
      }, 200); // Slightly longer delay to ensure reset is visible

      return () => clearTimeout(timer);
    }
  }, [currentMedia, currentAspectRatio]);

  // Handle navigation
  const navigateTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= media.length) return;

      setIsTransitioning(true);
      setCurrentIndex(index);

      // Call onNavigate callback if provided
      if (onNavigate) {
        onNavigate(index);
      }

      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    },
    [media.length, onNavigate]
  );

  // Handle next/previous navigation
  const handleNext = useCallback(() => {
    navigateTo((currentIndex + 1) % media.length);
  }, [currentIndex, media.length, navigateTo]);

  const handlePrev = useCallback(() => {
    navigateTo(currentIndex === 0 ? media.length - 1 : currentIndex - 1);
  }, [currentIndex, media.length, navigateTo]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    },
    [onClose, handlePrev, handleNext]
  );

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Handle touch gestures
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const start = touchStartRef.current;
      const end = touchEndRef.current;
      const deltaX = start.x - end.x;
      const deltaY = start.y - end.y;
      const minSwipeDistance = 50;

      // Determine swipe direction
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe left - next
          handleNext();
        } else {
          // Swipe right - previous
          handlePrev();
        }
      } else if (Math.abs(deltaY) > minSwipeDistance) {
        // Vertical swipe
        if (deltaY > 0) {
          // Swipe up - close modal
          onClose();
        }
      }
    },
    [handleNext, handlePrev, onClose]
  );

  // Handle background click to close
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!mounted || !isOpen) return null;

  // Handle empty media array or invalid index
  if (!media.length || currentIndex >= media.length) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackgroundClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Vista de pantalla completa"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Close button */}
      <button
        onClick={onClose}
        onTouchStart={handleTouch}
        className="absolute top-4 right-4 z-50 p-3 md:p-2 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-foreground/50"
        style={{ opacity: `${buttonOpacity}%` }}
        aria-label="Cerrar vista de pantalla completa"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            onTouchStart={handleTouch}
            className="absolute left-4 bottom-8 transform -translate-y-1/2 z-50 p-4 md:p-3 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-foreground/50"
            style={{ opacity: `${buttonOpacity}%` }}
            aria-label="Anterior"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            onTouchStart={handleTouch}
            className="absolute right-4 bottom-8 transform -translate-y-1/2 z-50 p-4 md:p-3 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-foreground/50"
            style={{ opacity: `${buttonOpacity}%` }}
            aria-label="Siguiente"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Media container */}
      <div
        className="relative z-10 w-full h-full p-0 md:p-4"
        onTouchStart={handleTouch}
      >
        <div
          className={`transition-all duration-500 ease-out relative w-full h-full ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Loading skeleton */}
          {loadingStates[currentMedia.id] && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div
                key={`skeleton-${currentMedia.id}`}
                className="rounded-lg transition-all duration-700 ease-out"
                style={{
                  width:
                    skeletonAspectRatio >= 1
                      ? `min(calc(100vw - 8rem), 600px)`
                      : `${Math.min(600, 400 * skeletonAspectRatio)}px`,
                  height:
                    skeletonAspectRatio <= 1
                      ? `min(calc(100vh - 8rem), 600px)`
                      : `${Math.min(600, 400 / skeletonAspectRatio)}px`,
                  minWidth: '400px',
                  minHeight: '400px',
                  maxWidth: '600px',
                  maxHeight: '600px',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="text-muted-foreground text-sm">
                    Cargando...
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentMedia.type === 'video' ? (
            <video
              src={currentMedia.url}
              className={`w-full h-full object-contain transition-all duration-700 ease-out ${
                loadingStates[currentMedia.id]
                  ? 'opacity-0 scale-95'
                  : 'opacity-100 scale-100'
              }`}
              style={{
                maxHeight: '100vh',
                maxWidth: '100vw',
              }}
              controls
              autoPlay
              muted
              loop
              playsInline
              data-testid={`video-${currentMedia.id}`}
              onLoadedData={() => handleMediaLoad(currentMedia.id)}
              onError={() => handleMediaError(currentMedia.id)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentMedia.url}
              alt={currentMedia.alt}
              className={`w-full h-full object-contain transition-all duration-700 ease-out ${
                loadingStates[currentMedia.id]
                  ? 'opacity-0 scale-95'
                  : 'opacity-100 scale-100'
              }`}
              style={{
                maxHeight: '100vh',
                maxWidth: '100vw',
              }}
              data-testid={`image-${currentMedia.id}`}
              onLoad={() => handleMediaLoad(currentMedia.id)}
              onError={() => handleMediaError(currentMedia.id)}
            />
          )}
        </div>
      </div>

      {/* Item counter */}
      {media.length > 1 && (
        <div
          className="absolute bottom-4 left-4 md:left-1/2 md:transform md:-translate-x-1/2 z-50 px-4 py-2 rounded-full bg-background/50 text-foreground text-sm"
          style={{ opacity: `${buttonOpacity}%` }}
          onTouchStart={handleTouch}
        >
          {currentIndex + 1} de {media.length}
        </div>
      )}
    </div>,
    document.body
  );
};

export default FullscreenModal;
