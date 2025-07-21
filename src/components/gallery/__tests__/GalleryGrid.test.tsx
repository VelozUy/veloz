import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryGrid } from '../GalleryGrid';

// Mock ResponsivePicture component
jest.mock('../ResponsivePicture', () => {
  return function MockResponsivePicture({ src, alt, onClick, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        data-testid="responsive-picture"
        {...props}
      />
    );
  };
});

describe('GalleryGrid', () => {
  const mockItems = [
    {
      id: '1',
      src: 'https://example.com/image1.jpg',
      alt: 'Test image 1',
      width: 1200,
      height: 800,
      aspectRatio: '16:9' as const,
    },
    {
      id: '2',
      src: 'https://example.com/image2.jpg',
      alt: 'Test image 2',
      width: 800,
      height: 1200,
      aspectRatio: '3:4' as const,
    },
    {
      id: '3',
      src: 'https://example.com/image3.jpg',
      alt: 'Test image 3',
      width: 1000,
      height: 1000,
      aspectRatio: '1:1' as const,
    },
  ];

  it('renders with basic props', () => {
    render(<GalleryGrid items={mockItems} />);

    const pictures = screen.getAllByTestId('responsive-picture');
    expect(pictures).toHaveLength(3);
    expect(pictures[0]).toHaveAttribute(
      'src',
      'https://example.com/image1.jpg'
    );
    expect(pictures[0]).toHaveAttribute('alt', 'Test image 1');
  });

  it('applies custom className', () => {
    render(<GalleryGrid items={mockItems} className="custom-class" />);

    const grid = screen
      .getAllByTestId('responsive-picture')[0]
      .closest('.grid');
    expect(grid).toHaveClass('custom-class');
  });

  it('applies different gap sizes', () => {
    const { rerender } = render(<GalleryGrid items={mockItems} gap="sm" />);

    let grid = screen.getAllByTestId('responsive-picture')[0].closest('.grid');
    expect(grid).toHaveClass('gap-2');
    expect(grid).toHaveClass('md:gap-3');
    expect(grid).toHaveClass('lg:gap-4');

    rerender(<GalleryGrid items={mockItems} gap="lg" />);
    grid = screen.getAllByTestId('responsive-picture')[0].closest('.grid');
    expect(grid).toHaveClass('gap-6');
    expect(grid).toHaveClass('md:gap-8');
    expect(grid).toHaveClass('lg:gap-12');
  });

  it('applies different column counts', () => {
    const { rerender } = render(<GalleryGrid items={mockItems} columns={2} />);

    let grid = screen.getAllByTestId('responsive-picture')[0].closest('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');

    rerender(<GalleryGrid items={mockItems} columns={4} />);
    grid = screen.getAllByTestId('responsive-picture')[0].closest('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('applies aspect ratio classes', () => {
    const { rerender } = render(
      <GalleryGrid items={mockItems} aspectRatio="square" />
    );

    let grid = screen.getAllByTestId('responsive-picture')[0].closest('.grid');
    expect(grid).toHaveClass('aspect-square');

    rerender(<GalleryGrid items={mockItems} aspectRatio="video" />);
    grid = screen.getAllByTestId('responsive-picture')[0].closest('.grid');
    expect(grid).toHaveClass('aspect-video');
  });

  it('handles masonry layout', () => {
    render(<GalleryGrid items={mockItems} masonry={true} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));

    // Check that wide images get col-span-2
    const wideImageContainer = gridItems[0];
    expect(wideImageContainer).toHaveClass('col-span-2');
    expect(wideImageContainer).toHaveClass('row-span-1');

    // Check that tall images get row-span-2
    const tallImageContainer = gridItems[1];
    expect(tallImageContainer).toHaveClass('col-span-1');
    expect(tallImageContainer).toHaveClass('row-span-2');

    // Check that square images get standard span
    const squareImageContainer = gridItems[2];
    expect(squareImageContainer).toHaveClass('col-span-1');
    expect(squareImageContainer).toHaveClass('row-span-1');
  });

  it('handles item click events', () => {
    const handleItemClick = jest.fn();
    render(<GalleryGrid items={mockItems} onItemClick={handleItemClick} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    fireEvent.click(gridItems[0]!);

    expect(handleItemClick).toHaveBeenCalledWith(mockItems[0]);
  });

  it('handles individual item click events', () => {
    const itemsWithClick = mockItems.map(item => ({
      ...item,
      onClick: jest.fn(),
    }));

    render(<GalleryGrid items={itemsWithClick} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    fireEvent.click(gridItems[0]!);

    expect(itemsWithClick[0].onClick).toHaveBeenCalled();
  });

  it('applies cursor pointer for clickable items', () => {
    render(<GalleryGrid items={mockItems} onItemClick={() => {}} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    gridItems.forEach(item => {
      expect(item).toHaveClass('cursor-pointer');
    });
  });

  it('does not apply cursor pointer for non-clickable items', () => {
    render(<GalleryGrid items={mockItems} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    gridItems.forEach(item => {
      expect(item).not.toHaveClass('cursor-pointer');
    });
  });

  it('has proper accessibility attributes for clickable items', () => {
    render(<GalleryGrid items={mockItems} onItemClick={() => {}} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    gridItems.forEach(item => {
      expect(item).toHaveAttribute('role', 'button');
      expect(item).toHaveAttribute('tabIndex', '0');
    });
  });

  it('does not have button role for non-clickable items', () => {
    render(<GalleryGrid items={mockItems} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    gridItems.forEach(item => {
      expect(item).not.toHaveAttribute('role', 'button');
      expect(item).not.toHaveAttribute('tabIndex', '0');
    });
  });

  it('handles keyboard navigation', () => {
    const handleItemClick = jest.fn();
    render(<GalleryGrid items={mockItems} onItemClick={handleItemClick} />);

    const gridItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));

    // Test Enter key
    fireEvent.keyDown(gridItems[0]!, { key: 'Enter' });
    expect(handleItemClick).toHaveBeenCalledWith(mockItems[0]);

    // Test Space key
    fireEvent.keyDown(gridItems[1]!, { key: ' ' });
    expect(handleItemClick).toHaveBeenCalledWith(mockItems[1]);
  });

  it('calculates aspect ratio correctly', () => {
    const itemsWithoutAspectRatio = [
      {
        id: '1',
        src: 'https://example.com/image1.jpg',
        alt: 'Test image 1',
        width: 1600,
        height: 900,
      },
      {
        id: '2',
        src: 'https://example.com/image2.jpg',
        alt: 'Test image 2',
        width: 900,
        height: 1600,
      },
      {
        id: '3',
        src: 'https://example.com/image3.jpg',
        alt: 'Test image 3',
        width: 1000,
        height: 1000,
      },
    ];

    render(<GalleryGrid items={itemsWithoutAspectRatio} />);

    const pictures = screen.getAllByTestId('responsive-picture');
    expect(pictures).toHaveLength(3);
  });

  it('passes gallery attributes to ResponsivePicture', () => {
    const itemsWithGalleryData = mockItems.map(item => ({
      ...item,
      galleryGroup: 'test-gallery',
      dataType: 'image' as const,
      dataDesc: 'Test description',
    }));

    render(<GalleryGrid items={itemsWithGalleryData} />);

    const pictures = screen.getAllByTestId('responsive-picture');
    expect(pictures[0]).toHaveAttribute('data-gallery-group', 'test-gallery');
    expect(pictures[0]).toHaveAttribute('data-type', 'image');
    expect(pictures[0]).toHaveAttribute('data-desc', 'Test description');
  });
});
