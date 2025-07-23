/**
 * Tiled Gallery Layout Algorithm
 * 
 * Core masonry-style layout calculation based on WordPress Jetpack tiled-gallery module.
 * Implements optimal image positioning with aspect ratio balancing and visual harmony.
 * Designed to support existing animations and interaction patterns.
 */

import {
  GalleryImage,
  TileLayout,
  TileRow,
  TileCalculationConfig,
  TiledGalleryLayout,
  ResponsiveConfig,
} from '@/types/gallery';

// Default responsive configuration
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  mobile: {
    columns: 1,
    gap: 4,
    targetRowHeight: 200,
  },
  tablet: {
    columns: 2,
    gap: 6,
    targetRowHeight: 250,
  },
  desktop: {
    columns: 3,
    gap: 8,
    targetRowHeight: 300,
  },
};

// Default calculation configuration
export const DEFAULT_TILE_CONFIG: Partial<TileCalculationConfig> = {
  targetRowHeight: 300,
  maxRowHeight: 400,
  gap: 8,
  preserveAspectRatio: true,
};

/**
 * Calculate optimal tile layout for masonry-style gallery
 * Based on WordPress Jetpack tiled-gallery algorithm with modern enhancements
 */
export function calculateTileLayout(
  images: GalleryImage[],
  containerWidth: number,
  config: Partial<TileCalculationConfig> = {}
): TiledGalleryLayout {
  const startTime = performance.now();

  // Merge with defaults
  const fullConfig: TileCalculationConfig = {
    ...DEFAULT_TILE_CONFIG,
    containerWidth,
    ...config,
  } as TileCalculationConfig;

  if (!images.length) {
    return {
      rows: [],
      tiles: [],
      totalHeight: 0,
      containerWidth,
      config: fullConfig,
      metadata: {
        imageCount: 0,
        averageAspectRatio: 0,
        rowCount: 0,
        calculationTime: performance.now() - startTime,
      },
    };
  }

  // Sort images by order if available, maintain original index for animations
  const sortedImages = images
    .map((img, index) => ({ ...img, originalIndex: index }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const rows: TileRow[] = [];
  const tiles: TileLayout[] = [];
  let currentRow: GalleryImage[] = [];
  let rowIndex = 0;

  // Process images into rows
  for (const image of sortedImages) {
    currentRow.push(image);

    // Check if we should finalize the current row
    if (shouldFinalizeRow(currentRow, fullConfig)) {
      const calculatedRow = calculateRowLayout(
        currentRow,
        rowIndex,
        fullConfig
      );
      rows.push(calculatedRow);
      tiles.push(...calculatedRow.tiles);
      
      currentRow = [];
      rowIndex++;
    }
  }

  // Handle remaining images in the last row
  if (currentRow.length > 0) {
    const calculatedRow = calculateRowLayout(currentRow, rowIndex, fullConfig);
    rows.push(calculatedRow);
    tiles.push(...calculatedRow.tiles);
  }

  // Calculate total height
  const totalHeight = rows.reduce((sum, row) => sum + row.actualHeight + fullConfig.gap, -fullConfig.gap);

  // Calculate metadata
  const averageAspectRatio = images.reduce((sum, img) => {
    const aspectRatio = img.width && img.height ? img.width / img.height : 1;
    return sum + aspectRatio;
  }, 0) / images.length;

  const calculationTime = performance.now() - startTime;

  return {
    rows,
    tiles,
    totalHeight,
    containerWidth,
    config: fullConfig,
    metadata: {
      imageCount: images.length,
      averageAspectRatio,
      rowCount: rows.length,
      calculationTime,
    },
  };
}

/**
 * Determine if current row should be finalized
 * Based on aspect ratio sum and target width
 */
function shouldFinalizeRow(
  currentRow: GalleryImage[],
  config: TileCalculationConfig
): boolean {
  if (currentRow.length === 0) return false;

  // Force finalize if we have maximum images per row
  const maxImagesPerRow = config.columns || 5;
  if (currentRow.length >= maxImagesPerRow) return true;

  // Calculate current row aspect ratio sum
  const aspectRatioSum = currentRow.reduce((sum, img) => {
    const aspectRatio = img.width && img.height ? img.width / img.height : 1;
    return sum + aspectRatio;
  }, 0);

  // Calculate ideal width based on target row height
  const targetWidth = config.containerWidth - (config.gap * (currentRow.length - 1));
  const idealWidth = aspectRatioSum * config.targetRowHeight;

  // Finalize if we're close to the target width
  return idealWidth >= targetWidth * 0.8;
}

/**
 * Calculate layout for a specific row of images
 */
function calculateRowLayout(
  rowImages: GalleryImage[],
  rowIndex: number,
  config: TileCalculationConfig
): TileRow {
  if (rowImages.length === 0) {
    return {
      id: `row-${rowIndex}`,
      tiles: [],
      targetHeight: config.targetRowHeight,
      actualHeight: 0,
      totalWidth: 0,
      aspectRatioSum: 0,
    };
  }

  // Calculate aspect ratio sum for the row
  const aspectRatioSum = rowImages.reduce((sum, img) => {
    const aspectRatio = img.width && img.height ? img.width / img.height : 1;
    return sum + aspectRatio;
  }, 0);

  // Calculate available width (container width minus gaps)
  const availableWidth = config.containerWidth - (config.gap * (rowImages.length - 1));

  // Calculate actual row height based on available width and aspect ratios
  const actualHeight = Math.min(
    config.maxRowHeight,
    Math.max(
      config.targetRowHeight * 0.7, // Minimum height
      availableWidth / aspectRatioSum
    )
  );

  // Generate tiles for this row
  const tiles: TileLayout[] = rowImages.map((image, columnIndex) => {
    const aspectRatio = image.width && image.height ? image.width / image.height : 1;
    const tileWidth = aspectRatio * actualHeight;
    
    // Calculate animation delay preserving existing patterns
    const originalIndex = (image as any).originalIndex || (rowIndex * rowImages.length + columnIndex);
    const animationDelay = originalIndex * 0.05; // Match existing stagger delay

    // Generate CSS grid classes for compatibility
    const gridSpan = calculateGridSpan(tileWidth, availableWidth, rowImages.length);
    const rowSpan = 'row-span-1'; // Single row span for tiled layout

    return {
      id: `tile-${rowIndex}-${columnIndex}`,
      image,
      row: rowIndex,
      column: columnIndex,
      width: tileWidth,
      height: actualHeight,
      aspectRatio,
      gridSpan,
      rowSpan,
      animationDelay,
      cssStyles: {
        width: `${(tileWidth / availableWidth) * 100}%`,
        height: `${actualHeight}px`,
        aspectRatio: aspectRatio.toString(),
        gridColumn: `span ${Math.ceil(parseInt(gridSpan.match(/\d+/)?.[0] || '1', 10))}`,
        gridRow: `span 1`,
      },
    };
  });

  return {
    id: `row-${rowIndex}`,
    tiles,
    targetHeight: config.targetRowHeight,
    actualHeight,
    totalWidth: tiles.reduce((sum, tile) => sum + tile.width, 0) + (config.gap * (tiles.length - 1)),
    aspectRatioSum,
  };
}

/**
 * Calculate CSS grid span classes for responsive layout
 */
function calculateGridSpan(
  tileWidth: number,
  totalWidth: number,
  tilesInRow: number
): string {
  // Calculate relative width as percentage
  const widthPercentage = (tileWidth / totalWidth) * 100;
  
  // Map to CSS grid span classes based on percentage
  if (widthPercentage >= 75) return 'col-span-12 lg:col-span-12';
  if (widthPercentage >= 50) return 'col-span-12 md:col-span-6 lg:col-span-6';
  if (widthPercentage >= 33) return 'col-span-6 md:col-span-4 lg:col-span-4';
  if (widthPercentage >= 25) return 'col-span-6 md:col-span-3 lg:col-span-3';
  
  // Default span for smaller tiles
  return 'col-span-6 md:col-span-2 lg:col-span-2';
}

/**
 * Get responsive configuration based on screen width
 */
export function getResponsiveConfig(screenWidth: number): ResponsiveConfig['mobile' | 'tablet' | 'desktop'] {
  if (screenWidth < 768) return DEFAULT_RESPONSIVE_CONFIG.mobile;
  if (screenWidth < 1024) return DEFAULT_RESPONSIVE_CONFIG.tablet;
  return DEFAULT_RESPONSIVE_CONFIG.desktop;
}

/**
 * Optimize layout for performance and visual balance
 */
export function optimizeLayout(layout: TiledGalleryLayout): TiledGalleryLayout {
  // Rebalance rows if needed
  const optimizedRows = layout.rows.map(row => {
    // Ensure no row is too tall or too short relative to target
    const heightRatio = row.actualHeight / layout.config.targetRowHeight;
    
    if (heightRatio > 1.5 || heightRatio < 0.6) {
      // Recalculate with adjusted parameters
      return calculateRowLayout(
        row.tiles.map(tile => tile.image),
        parseInt(row.id.split('-')[1]),
        {
          ...layout.config,
          targetRowHeight: layout.config.targetRowHeight * (heightRatio > 1.5 ? 0.8 : 1.2),
        }
      );
    }
    
    return row;
  });

  // Rebuild tiles array
  const optimizedTiles = optimizedRows.flatMap(row => row.tiles);

  return {
    ...layout,
    rows: optimizedRows,
    tiles: optimizedTiles,
  };
}

/**
 * Convert existing project media to GalleryImage format
 */
export function convertProjectMediaToGalleryImage(
  media: any,
  projectTitle: string = '',
  projectId: string = ''
): GalleryImage {
  return {
    id: media.id || `media-${Date.now()}`,
    src: media.url || media.src,
    alt: media.alt || media.description?.es || `${projectTitle} - ${media.type}`,
    width: media.width || 800,
    height: media.height || 600,
    type: media.type === 'video' ? 'video' : 'photo',
    url: media.url || media.src, // For FullscreenModal compatibility
    aspectRatio: media.aspectRatio,
    projectTitle,
    featured: media.featured,
    order: media.order || 0,
    // Animation support for existing patterns
    animationDelay: 0, // Will be calculated by layout algorithm
    // Lightbox integration
    galleryGroup: `project-${projectId}`,
    dataType: media.type === 'video' ? 'video' : 'image',
    dataDesc: media.description?.es || media.alt || `${projectTitle} - ${media.type}`,
    // Performance optimization
    blurDataURL: media.blurDataURL,
    priority: media.featured || false,
  };
}

/**
 * Batch convert multiple project media items
 */
export function convertProjectMediaBatch(
  mediaArray: any[],
  projectTitle: string = '',
  projectId: string = ''
): GalleryImage[] {
  return mediaArray
    .filter(media => media && (media.url || media.src))
    .map(media => convertProjectMediaToGalleryImage(media, projectTitle, projectId))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
} 