/**
 * Tiled Gallery System Types
 *
 * TypeScript definitions for the masonry-style tiled gallery layout system.
 * Compatible with existing gallery interfaces while providing enhanced layout capabilities.
 */

// Base gallery image interface - compatible with existing systems
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  type: 'photo' | 'video';
  url: string; // For compatibility with existing FullscreenModal
  aspectRatio?:
    | '1:1'
    | '16:9'
    | '9:16'
    | '4:3'
    | '3:4'
    | '4:5'
    | '5:4'
    | string;
  projectTitle?: string;
  featured?: boolean;
  order?: number;
  // Animation support
  animationDelay?: number;
  // Lightbox integration
  galleryGroup?: string;
  dataType?: 'image' | 'video';
  dataDesc?: string;
  // Loading optimization
  blurDataURL?: string;
  priority?: boolean;
}

// Tiled layout calculation result
export interface TileLayout {
  id: string;
  image: GalleryImage;
  // Position and dimensions in the grid
  row: number;
  column: number;
  width: number; // CSS grid units or percentage
  height: number; // CSS grid units or percentage
  // Calculated layout properties
  aspectRatio: number;
  gridSpan: string; // CSS classes for grid spanning
  rowSpan: string; // CSS classes for row spanning
  // Animation properties
  animationDelay: number;
  // Style properties for positioning
  cssStyles: {
    width: string;
    height: string;
    aspectRatio: string;
    gridColumn?: string;
    gridRow?: string;
  };
}

// Tiled gallery row structure
export interface TileRow {
  id: string;
  tiles: TileLayout[];
  targetHeight: number;
  actualHeight: number;
  totalWidth: number;
  aspectRatioSum: number;
}

// Configuration for tiled gallery calculation
export interface TileCalculationConfig {
  containerWidth: number;
  targetRowHeight: number;
  maxRowHeight: number;
  gap: number;
  columns?: number; // Optional column constraint
  preserveAspectRatio: boolean;
  preferredRows?: number;
}

// Responsive breakpoint configuration
export interface ResponsiveConfig {
  mobile: {
    columns: number;
    gap: number;
    targetRowHeight: number;
  };
  tablet: {
    columns: number;
    gap: number;
    targetRowHeight: number;
  };
  desktop: {
    columns: number;
    gap: number;
    targetRowHeight: number;
  };
  largeDesktop: {
    columns: number;
    gap: number;
    targetRowHeight: number;
  };
}

// Tiled gallery component props
export interface TiledGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: number;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
  lazyLoad?: boolean;
  onImageClick?: (image: GalleryImage, index: number) => void;
  className?: string;
  // Animation preferences
  enableAnimations?: boolean;
  staggerDelay?: number;
  // Performance options
  virtualScrolling?: boolean;
  preloadCount?: number;
  // Accessibility
  ariaLabel?: string;
  // Integration with existing systems
  galleryGroup?: string;
  projectTitle?: string;
}

// Layout calculation result for the entire gallery
export interface TiledGalleryLayout {
  rows: TileRow[];
  tiles: TileLayout[];
  totalHeight: number;
  containerWidth: number;
  config: TileCalculationConfig;
  metadata: {
    imageCount: number;
    averageAspectRatio: number;
    rowCount: number;
    calculationTime: number;
  };
}

// Animation state for individual tiles
export interface TileAnimationState {
  id: string;
  isVisible: boolean;
  isLoaded: boolean;
  hasError: boolean;
  loadTime?: number;
  animationPhase: 'entering' | 'visible' | 'exiting';
}

// Performance monitoring for tiled gallery
export interface TiledGalleryPerformance {
  layoutCalculationTime: number;
  renderTime: number;
  imageLoadTimes: Record<string, number>;
  totalImages: number;
  visibleImages: number;
  memoryUsage?: number;
}

// Compatibility interfaces for existing systems
export interface TiledGalleryItem extends GalleryImage {
  // Additional properties for compatibility with existing GalleryGrid
  category?: string;
  onClick?: () => void;
}

// Convert existing ProjectMedia to TiledGallery format
export interface ProjectMediaAdapter {
  convertProjectMedia: (media: any) => GalleryImage;
  convertToGalleryItem: (image: GalleryImage) => TiledGalleryItem;
}

// Export utility types
export type TileAspectRatio = number;
export type TilePosition = { row: number; column: number };
export type TileDimensions = { width: number; height: number };
export type GridSpanClasses = string;
export type AnimationDelay = number;
