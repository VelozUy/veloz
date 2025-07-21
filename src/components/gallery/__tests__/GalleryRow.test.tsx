import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryRow } from '../GalleryRow';

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

describe('GalleryRow', () => {
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
    render(<GalleryRow items={mockItems} />);

    const pictures = screen.getAllByTestId('responsive-picture');
    expect(pictures).toHaveLength(3);
    expect(pictures[0]).toHaveAttribute(
      'src',
      'https://example.com/image1.jpg'
    );
    expect(pictures[0]).toHaveAttribute('alt', 'Test image 1');
  });

  it('applies custom className', () => {
    render(<GalleryRow items={mockItems} className="custom-class" />);

    const row = screen.getAllByTestId('responsive-picture')[0].closest('.flex');
    expect(row).toHaveClass('custom-class');
  });

  it('applies different gap sizes', () => {
    const { rerender } = render(<GalleryRow items={mockItems} gap="sm" />);

    let row = screen.getAllByTestId('responsive-picture')[0].closest('.flex');
    expect(row).toHaveClass('gap-2');
    expect(row).toHaveClass('md:gap-3');
    expect(row).toHaveClass('lg:gap-4');

    rerender(<GalleryRow items={mockItems} gap="lg" />);
    row = screen.getAllByTestId('responsive-picture')[0].closest('.flex');
    expect(row).toHaveClass('gap-6');
    expect(row).toHaveClass('md:gap-8');
    expect(row).toHaveClass('lg:gap-12');
  });

  it('applies different height sizes', () => {
    const { rerender } = render(<GalleryRow items={mockItems} height="sm" />);

    let row = screen.getAllByTestId('responsive-picture')[0].closest('.flex');
    expect(row).toHaveClass('h-32');
    expect(row).toHaveClass('md:h-40');
    expect(row).toHaveClass('lg:h-48');

    rerender(<GalleryRow items={mockItems} height="xl" />);
    row = screen.getAllByTestId('responsive-picture')[0].closest('.flex');
    expect(row).toHaveClass('h-56');
    expect(row).toHaveClass('md:h-64');
    expect(row).toHaveClass('lg:h-72');
  });

  it('applies aspect ratio classes', () => {
    const { rerender } = render(
      <GalleryRow items={mockItems} aspectRatio="square" />
    );

    let row = screen.getAllByTestId('responsive-picture')[0].closest('.flex');
    expect(row).toHaveClass('aspect-square');

    rerender(<GalleryRow items={mockItems} aspectRatio="video" />);
    row = screen.getAllByTestId('responsive-picture')[0].closest('.flex');
    expect(row).toHaveClass('aspect-video');
  });

  it('calculates dynamic width based on aspect ratio', () => {
    render(<GalleryRow items={mockItems} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));

    // Wide images should get flex-[2]
    const wideImageContainer = rowItems[0];
    expect(wideImageContainer).toHaveClass('flex-[2]');

    // Tall images should get flex-[0.75]
    const tallImageContainer = rowItems[1];
    expect(tallImageContainer).toHaveClass('flex-[0.75]');

    // Square images should get flex-1
    const squareImageContainer = rowItems[2];
    expect(squareImageContainer).toHaveClass('flex-1');
  });

  it('handles item click events', () => {
    const handleItemClick = jest.fn();
    render(<GalleryRow items={mockItems} onItemClick={handleItemClick} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    fireEvent.click(rowItems[0]!);

    expect(handleItemClick).toHaveBeenCalledWith(mockItems[0]);
  });

  it('handles individual item click events', () => {
    const itemsWithClick = mockItems.map(item => ({
      ...item,
      onClick: jest.fn(),
    }));

    render(<GalleryRow items={itemsWithClick} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    fireEvent.click(rowItems[0]!);

    expect(itemsWithClick[0].onClick).toHaveBeenCalled();
  });

  it('applies cursor pointer for clickable items', () => {
    render(<GalleryRow items={mockItems} onItemClick={() => {}} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    rowItems.forEach(item => {
      expect(item).toHaveClass('cursor-pointer');
    });
  });

  it('does not apply cursor pointer for non-clickable items', () => {
    render(<GalleryRow items={mockItems} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    rowItems.forEach(item => {
      expect(item).not.toHaveClass('cursor-pointer');
    });
  });

  it('has proper accessibility attributes for clickable items', () => {
    render(<GalleryRow items={mockItems} onItemClick={() => {}} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    rowItems.forEach(item => {
      expect(item).toHaveAttribute('role', 'button');
      expect(item).toHaveAttribute('tabIndex', '0');
    });
  });

  it('does not have button role for non-clickable items', () => {
    render(<GalleryRow items={mockItems} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));
    rowItems.forEach(item => {
      expect(item).not.toHaveAttribute('role', 'button');
      expect(item).not.toHaveAttribute('tabIndex', '0');
    });
  });

  it('handles keyboard navigation', () => {
    const handleItemClick = jest.fn();
    render(<GalleryRow items={mockItems} onItemClick={handleItemClick} />);

    const rowItems = screen
      .getAllByTestId('responsive-picture')
      .map(pic => pic.closest('.relative'));

    // Test Enter key
    fireEvent.keyDown(rowItems[0]!, { key: 'Enter' });
    expect(handleItemClick).toHaveBeenCalledWith(mockItems[0]);

    // Test Space key
    fireEvent.keyDown(rowItems[1]!, { key: ' ' });
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

    render(<GalleryRow items={itemsWithoutAspectRatio} />);

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

    render(<GalleryRow items={itemsWithGalleryData} />);

    const pictures = screen.getAllByTestId('responsive-picture');
    expect(pictures[0]).toHaveAttribute('data-gallery-group', 'test-gallery');
    expect(pictures[0]).toHaveAttribute('data-type', 'image');
    expect(pictures[0]).toHaveAttribute('data-desc', 'Test description');
  });

  it('shows empty state when no items', () => {
    render(<GalleryRow items={[]} />);

    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('renders empty state with custom className', () => {
    render(<GalleryRow items={[]} className="custom-class" />);

    const emptyState = screen
      .getByText('No items to display')
      .closest('.text-center');
    expect(emptyState).toHaveClass('custom-class');
  });
});
