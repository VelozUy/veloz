import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TiledGallery } from '../TiledGallery';
import { GalleryImage } from '@/types/gallery';

// Mock the layout calculation functions
jest.mock('@/lib/gallery-layout', () => ({
  calculateTileLayout: jest.fn(() => ({
    tiles: [
      {
        id: 'tile-1',
        image: {
          id: 'img-1',
          src: 'https://example.com/test1.jpg',
          alt: 'Test 1',
          width: 100,
          height: 100,
          type: 'photo',
          url: 'https://example.com/test1.jpg',
        },
        row: 0,
        column: 0,
        width: 100,
        height: 100,
        aspectRatio: 1,
        gridSpan: 'col-span-1',
        rowSpan: 'row-span-1',
        animationDelay: 0,
        cssStyles: { width: '100%', height: 'auto', aspectRatio: '1 / 1' },
      },
      {
        id: 'tile-2',
        image: {
          id: 'img-2',
          src: 'https://example.com/test2.jpg',
          alt: 'Test 2',
          width: 100,
          height: 100,
          type: 'photo',
          url: 'https://example.com/test2.jpg',
        },
        row: 0,
        column: 1,
        width: 100,
        height: 100,
        aspectRatio: 1,
        gridSpan: 'col-span-1',
        rowSpan: 'row-span-1',
        animationDelay: 0.05,
        cssStyles: { width: '100%', height: 'auto', aspectRatio: '1 / 1' },
      },
    ],
    rows: [
      {
        id: 'row-1',
        tiles: [
          {
            id: 'tile-1',
            image: {
              id: 'img-1',
              src: 'https://example.com/test1.jpg',
              alt: 'Test 1',
              width: 100,
              height: 100,
              type: 'photo',
              url: 'https://example.com/test1.jpg',
            },
            row: 0,
            column: 0,
            width: 100,
            height: 100,
            aspectRatio: 1,
            gridSpan: 'col-span-1',
            rowSpan: 'row-span-1',
            animationDelay: 0,
            cssStyles: { width: '100%', height: 'auto', aspectRatio: '1 / 1' },
          },
          {
            id: 'tile-2',
            image: {
              id: 'img-2',
              src: 'https://example.com/test2.jpg',
              alt: 'Test 2',
              width: 100,
              height: 100,
              type: 'photo',
              url: 'https://example.com/test2.jpg',
            },
            row: 0,
            column: 1,
            width: 100,
            height: 100,
            aspectRatio: 1,
            gridSpan: 'col-span-1',
            rowSpan: 'row-span-1',
            animationDelay: 0.05,
            cssStyles: { width: '100%', height: 'auto', aspectRatio: '1 / 1' },
          },
        ],
        targetHeight: 100,
        actualHeight: 100,
        totalWidth: 200,
        aspectRatioSum: 2,
      },
    ],
    totalHeight: 100,
    containerWidth: 200,
    config: {
      containerWidth: 200,
      targetRowHeight: 100,
      maxRowHeight: 130,
      gap: 8,
      columns: 2,
      preserveAspectRatio: true,
    },
    metadata: {
      imageCount: 2,
      averageAspectRatio: 1,
      rowCount: 1,
      calculationTime: 0,
    },
  })),
  getResponsiveConfig: jest.fn(() => ({
    columns: 2,
    gap: 8,
    targetRowHeight: 100,
  })),
  convertProjectMediaBatch: jest.fn(images => images),
  optimizeLayout: jest.fn(layout => layout),
}));

// Mock the lazy load hook
jest.mock('@/hooks/useTiledGalleryLazyLoad', () => ({
  useTiledGalleryLazyLoad: jest.fn(() => ({
    visibleItems: new Set(['img-1', 'img-2']),
    loadedImages: new Set(['img-1', 'img-2']),
    errorImages: new Set(),
    loadingQueue: [],
    observeItem: jest.fn(),
    unobserveItem: jest.fn(),
    preloadNext: jest.fn(),
    clearMemory: jest.fn(),
    getPerformanceMetrics: jest.fn(() => ({})),
    handleImageLoad: jest.fn(),
    handleImageError: jest.fn(),
  })),
}));

// Mock the image optimization
jest.mock('@/lib/image-optimization', () => ({
  optimizeImageData: jest.fn(image => ({
    src: image.src,
    sizes: '100vw',
    priority: false,
    quality: 85,
    blurDataURL: undefined,
    loading: 'lazy',
  })),
  preloadCriticalImages: jest.fn(),
  trackImageLoad: jest.fn(),
  clearImageCache: jest.fn(),
}));

describe('TiledGallery', () => {
  const mockImages: GalleryImage[] = [
    {
      id: 'img-1',
      src: 'https://example.com/test1.jpg',
      alt: 'Test 1',
      width: 100,
      height: 100,
      type: 'photo',
      url: 'https://example.com/test1.jpg',
    },
    {
      id: 'img-2',
      src: 'https://example.com/test2.jpg',
      alt: 'Test 2',
      width: 100,
      height: 100,
      type: 'photo',
      url: 'https://example.com/test2.jpg',
    },
  ];

  beforeEach(() => {
    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('should call onImageClick with correct visual index when image is clicked', () => {
    const mockOnImageClick = jest.fn();

    render(
      <TiledGallery
        images={mockImages}
        onImageClick={mockOnImageClick}
        projectTitle="Test Project"
      />
    );

    // Find and click the first image
    const firstImage = screen.getByAltText('Test 1');
    fireEvent.click(firstImage);

    // Verify that onImageClick was called with the correct image and visual index
    expect(mockOnImageClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'img-1' }),
      0 // Should be visual index 0, not array index
    );

    // Find and click the second image
    const secondImage = screen.getByAltText('Test 2');
    fireEvent.click(secondImage);

    // Verify that onImageClick was called with the correct image and visual index
    expect(mockOnImageClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'img-2' }),
      1 // Should be visual index 1, not array index
    );
  });

  it('should handle keyboard navigation with correct visual index', () => {
    const mockOnImageClick = jest.fn();

    render(
      <TiledGallery
        images={mockImages}
        onImageClick={mockOnImageClick}
        projectTitle="Test Project"
      />
    );

    // Find the first image and press Enter
    const firstImage = screen.getByAltText('Test 1');
    fireEvent.keyDown(firstImage, { key: 'Enter' });

    // Verify that onImageClick was called with the correct visual index
    expect(mockOnImageClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'img-1' }),
      0
    );
  });
});
