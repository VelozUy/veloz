'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
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
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

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
    setLoadingStates(prev => ({
      ...prev,
      [mediaId]: false,
    }));
  }, []);

  const handleMediaError = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [mediaId]: false,
    }));
  }, []);

  // Handle navigation
  const navigateTo = useCallback((index: number) => {
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
  }, [media.length, onNavigate]);

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
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground/50"
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground/50"
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-background/50 text-foreground hover:bg-background/70 transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground/50"
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
      <div className="relative z-10 max-w-full max-h-full p-4">
        <div
          className={`transition-all duration-500 ease-out relative ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Loading skeleton */}
          {loadingStates[currentMedia.id] && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-gradient-to-br from-background/10 to-background/30 backdrop-blur-sm rounded-lg border border-border w-full h-full max-w-[600px] max-h-[600px] min-w-[400px] min-h-[400px]">
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-muted-foreground"></div>
                  <div className="text-muted-foreground text-sm">Cargando...</div>
                </div>
              </div>
            </div>
          )}

          {currentMedia.type === 'video' ? (
            <video
              src={currentMedia.url}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                loadingStates[currentMedia.id] ? 'opacity-0' : 'opacity-100'
              }`}
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
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                loadingStates[currentMedia.id] ? 'opacity-0' : 'opacity-100'
              }`}
              data-testid={`image-${currentMedia.id}`}
              onLoad={() => handleMediaLoad(currentMedia.id)}
              onError={() => handleMediaError(currentMedia.id)}
            />
          )}
        </div>
      </div>

      {/* Item counter */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-background/50 text-foreground text-sm">
          {currentIndex + 1} de {media.length}
        </div>
      )}
    </div>,
    document.body
  );
};

export default FullscreenModal; 