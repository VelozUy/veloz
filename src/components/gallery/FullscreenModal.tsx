'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMediaProgress } from '../../hooks/useMediaProgress';
import { ProgressBar } from '../ui/progress-bar';

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
 * Immersive fullscreen viewing experience for category gallery items.
 * Features minimal UI, smooth transitions, and distraction-free viewing.
 * 
 * Key Features:
 * - Fullscreen modal covering entire viewport
 * - Smooth fade-in/fade-out transitions (300ms ease-in-out)
 * - Background overlay with blur effect
 * - Close button positioned in top-right corner
 * - ESC key support for closing
 * - Proper z-index management
 * - Touch gesture support for mobile devices
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
  const [isLoading, setIsLoading] = useState(false);
  const [mediaLoadingStates, setMediaLoadingStates] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [preloadedMedia, setPreloadedMedia] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Get current media for progress tracking
  const currentMedia = media[currentIndex];
  
  // Progress tracking for current media
  const {
    isLoading: isProgressLoading,
    progress,
    error: progressError,
    loadedUrl,
    loadMedia: loadMediaWithProgress,
    abort: abortProgress,
    reset: resetProgress,
  } = useMediaProgress(currentMedia?.url || '', {
    autoLoad: false, // We'll control loading manually
    timeout: 30000,
    useBlob: false, // Disable blob for CSP compliance
    fallbackToDirect: true,
  });

  // Track loading time to show percentage only after 2 seconds
  const [showProgress, setShowProgress] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const currentMediaIdRef = useRef<string | null>(null);
  const [isInLoadingTransition, setIsInLoadingTransition] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update current index when startIndex changes
  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);



  // Check if media is preloaded
  const isMediaPreloaded = useCallback((index: number) => {
    if (index < 0 || index >= media.length) return false;
    const mediaItem = media[index];
    if (!mediaItem) return false;
    const key = `${mediaItem.id}-${mediaItem.url}`;
    return preloadedMedia.has(key);
  }, [media, preloadedMedia]);

  // Handle media loading state
  const handleMediaLoad = useCallback((mediaId: string) => {
    setMediaLoadingStates(prev => ({
      ...prev,
      [mediaId]: false,
    }));
  }, []);

  // Handle media error state
  const handleMediaError = useCallback((mediaId: string) => {
    setMediaLoadingStates(prev => ({
      ...prev,
      [mediaId]: false,
    }));
  }, []);



  // Handle navigation
  const navigateTo = useCallback((index: number) => {
    if (index < 0 || index >= media.length) return;
    
    setIsTransitioning(true);
    
    // Abort any current progress loading
    abortProgress();
    
    // Hide ALL media immediately during transition
    setShowProgress(false);
    setIsLoading(true); // Keep loading true to hide all media
    setMediaLoadingStates({}); // Clear specific media states
    setIsInLoadingTransition(true); // Mark as in loading transition
    loadingStartTimeRef.current = null;
    
    setCurrentIndex(index);
    
    // Call onNavigate callback if provided
    if (onNavigate) {
      onNavigate(index);
    }
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  }, [media.length, onNavigate, abortProgress]);

  // Initialize modal with correct index when it opens
  useEffect(() => {
    if (isOpen && !initialized && startIndex >= 0 && startIndex < media.length) {
      setCurrentIndex(startIndex);
      setInitialized(true);
    } else if (!isOpen) {
      setInitialized(false);
    }
  }, [isOpen, startIndex, media.length, initialized]);

  // Initialize loading states for current media
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < media.length) {
      const currentMedia = media[currentIndex];
      if (currentMedia) {
        // Update the current media ID ref
        currentMediaIdRef.current = currentMedia.id;
        
        // Always set loading state for new media during navigation
        // The media will be hidden by isInLoadingTransition until it loads
        setMediaLoadingStates(prev => ({
          ...prev,
          [currentMedia.id]: true,
        }));
        setIsLoading(true);
      }
    }
  }, [currentIndex, media]);

  // Start progress loading when current media changes
  useEffect(() => {
    if (currentMedia && !isMediaPreloaded(currentIndex)) {
      setShowProgress(true);
      loadingStartTimeRef.current = Date.now();
      loadMediaWithProgress();
    } else {
      // If media is preloaded, don't show progress
      setShowProgress(false);
      loadingStartTimeRef.current = null;
    }
  }, [currentMedia, currentIndex, isMediaPreloaded]);

  // Preload adjacent media items for smooth navigation
  useEffect(() => {
    if (!media.length) return;

    const preloadAdjacentMedia = () => {
      const indicesToPreload = [];
      
      // Always preload current, next, and previous
      indicesToPreload.push(currentIndex);
      indicesToPreload.push((currentIndex + 1) % media.length);
      indicesToPreload.push(currentIndex === 0 ? media.length - 1 : currentIndex - 1);
      
      // Add adjacent items if available
      if (media.length > 3) {
        indicesToPreload.push((currentIndex + 2) % media.length);
        indicesToPreload.push(currentIndex === 0 ? media.length - 2 : currentIndex - 2);
      }

      // Remove duplicates and limit
      const uniqueIndices = [...new Set(indicesToPreload)].slice(0, 5);

      uniqueIndices.forEach(index => {
        const mediaItem = media[index];
        if (!mediaItem) return;

        const key = `${mediaItem.id}-${mediaItem.url}`;
        
        // Skip if already preloaded
        if (preloadedMedia.has(key)) return;

        if (mediaItem.type === 'photo') {
          const img = new Image();
          img.onload = () => {
            setPreloadedMedia(prev => new Set([...prev, key]));
          };
          img.onerror = () => {
            console.warn(`Failed to preload image: ${mediaItem.url}`);
          };
          img.src = mediaItem.url;
        } else {
          const video = document.createElement('video');
          video.muted = true;
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            setPreloadedMedia(prev => new Set([...prev, key]));
          };
          video.onerror = () => {
            console.warn(`Failed to preload video: ${mediaItem.url}`);
          };
          video.src = mediaItem.url;
        }
      });
    };

    preloadAdjacentMedia();
  }, [currentIndex, media, preloadedMedia]);

  // Handle next/previous navigation
  const handleNext = useCallback(() => {
    navigateTo((currentIndex + 1) % media.length);
  }, [currentIndex, media.length, navigateTo]);

  const handlePrev = useCallback(() => {
    navigateTo(currentIndex === 0 ? media.length - 1 : currentIndex - 1);
  }, [currentIndex, media.length, navigateTo]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  }, [onClose, handlePrev, handleNext]);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll when modal is closed
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

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
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
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
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
  }, [handleNext, handlePrev, onClose]);

  // Handle background click to close
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!mounted || !isOpen || !initialized) return null;

  // Handle empty media array or invalid index
  if (!media.length || currentIndex >= media.length) {
    return null;
  }

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackgroundClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Vista de pantalla completa"
    >
      {/* Background overlay with blur effect */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{
          animation: isOpen ? 'fadeIn 300ms ease-in-out' : 'fadeOut 300ms ease-in-out',
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 animate-in slide-in-from-top-4 duration-500"
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground/50 animate-in slide-in-from-left-4 duration-500"
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground/50 animate-in slide-in-from-right-4 duration-500"
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
      <div className={`relative z-10 max-w-full max-h-full p-4 animate-in fade-in-0 duration-500 ${
        isInLoadingTransition ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-300`}>
        <div
          className={`transition-all duration-500 ease-out relative ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Loading Skeleton with Progress */}
          {(mediaLoadingStates[currentMedia.id] || isProgressLoading || isLoading || isInLoadingTransition) && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
              onClick={() => {
                if (progressError) {
                  resetProgress();
                  loadMediaWithProgress();
                }
              }}
            >
              <div className="bg-gradient-to-br from-background/10 to-background/30 backdrop-blur-sm rounded-lg animate-in fade-in-0 slide-in-from-scale-95 duration-700 border border-foreground/10" style={{
                width: 'min(calc(100vw - 8rem), 600px)',
                height: 'min(calc(100vh - 8rem), 600px)',
                minWidth: '400px',
                minHeight: '400px',
                maxWidth: '600px',
                maxHeight: '600px',
              }}>
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-foreground/60"></div>
                  
                  {/* Progress Bar - show only when progress is actively loading */}
                  {isProgressLoading && (
                    <div className="w-64 max-w-full px-4">
                      <ProgressBar
                        progress={progress}
                        size="lg"
                        variant={progressError ? 'error' : 'default'}
                        animated={!progressError}
                        showPercentage={true}
                        className="bg-background/30"
                      />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {progressError && (
                    <div className="text-destructive text-sm text-center max-w-xs">
                      Error loading media. Click to retry.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentMedia.type === 'video' ? (
            <video
              src={currentMedia.url}
              className={`max-w-full max-h-full object-contain animate-in fade-in-0 slide-in-from-scale-95 duration-700 ${
                (mediaLoadingStates[currentMedia.id] || isProgressLoading || isLoading || isTransitioning || isInLoadingTransition || !currentMedia) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              } transition-all duration-500 ease-out ${isInLoadingTransition ? 'pointer-events-none' : ''}`}
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{
                maxHeight: 'calc(100vh - 8rem)',
                maxWidth: 'calc(100vw - 8rem)',
                zIndex: isInLoadingTransition ? -1 : 'auto',
              }}
              data-testid={`video-${currentMedia.id}`}
              onLoadedData={() => {
                setIsLoading(false);
                setIsInLoadingTransition(false);
                handleMediaLoad(currentMedia.id);
              }}
              onError={() => {
                setIsLoading(false);
                setIsInLoadingTransition(false);
                handleMediaError(currentMedia.id);
              }}
            />
          ) : (
            <img
              src={currentMedia.url}
              alt={currentMedia.alt}
              className={`max-w-full max-h-full object-contain animate-in fade-in-0 slide-in-from-scale-95 duration-700 ${
                (mediaLoadingStates[currentMedia.id] || isProgressLoading || isLoading || isTransitioning || isInLoadingTransition || !currentMedia) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              } transition-all duration-500 ease-out ${isInLoadingTransition ? 'pointer-events-none' : ''}`}
              style={{
                maxHeight: 'calc(100vh - 8rem)',
                maxWidth: 'calc(100vw - 8rem)',
                zIndex: isInLoadingTransition ? -1 : 'auto',
              }}
              data-testid={`image-${currentMedia.id}`}
              onLoad={() => {
                setIsLoading(false);
                setIsInLoadingTransition(false);
                handleMediaLoad(currentMedia.id);
              }}
              onError={() => {
                setIsLoading(false);
                setIsInLoadingTransition(false);
                handleMediaError(currentMedia.id);
              }}
            />
          )}
        </div>
      </div>

      {/* Item counter - positioned relative to modal, not media container */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-background/50 text-foreground text-sm animate-in slide-in-from-bottom-4 duration-500">
          {currentIndex + 1} de {media.length}
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default FullscreenModal; 