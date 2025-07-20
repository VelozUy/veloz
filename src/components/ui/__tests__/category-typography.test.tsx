import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  CategoryTypography,
  CategoryBadge,
  CategoryTitle,
  CategorySubtitle,
  CategoryBody,
  CategoryCaption,
} from '../category-typography';
import { EventCategory } from '@/constants/categories';

// Mock the categories module
jest.mock('@/constants/categories', () => ({
  EventCategory: 'Casamiento' as const,
  getCategoryStyle: jest.fn(() => ({
    name: 'Casamiento',
    displayName: {
      es: 'Casamiento',
      en: 'Wedding',
      pt: 'Casamento',
    },
    typography: {
      fontFamily: 'font-serif',
      fontWeight: 'font-medium',
      fontSize: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      letterSpacing: 'tracking-wide',
      lineHeight: 'leading-relaxed',
    },
    colors: {
      primary: 'text-rose-600',
      secondary: 'text-rose-500',
      accent: 'text-rose-400',
      background: 'bg-rose-50',
      text: 'text-gray-800',
    },
    icon: '💒',
    description: {
      es: 'Celebración de amor y unión',
      en: 'Celebration of love and union',
      pt: 'Celebração de amor e união',
    },
  })),
  getCategoryDisplayName: jest.fn(() => 'Casamiento'),
  getCategoryDescription: jest.fn(() => 'Celebración de amor y unión'),
}));

describe('CategoryTypography', () => {
  const defaultProps = {
    category: 'Casamiento' as EventCategory,
    children: 'Test content',
  };

  it('renders with default props', () => {
    render(<CategoryTypography {...defaultProps} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies category-specific styling', () => {
    render(<CategoryTypography {...defaultProps} />);
    const element = screen.getByText('Test content');

    // Check that category-specific classes are applied
    expect(element).toHaveClass('font-serif');
    expect(element).toHaveClass('font-normal'); // Default variant is 'body' which uses font-normal
    expect(element).toHaveClass('text-base');
    expect(element).toHaveClass('tracking-wide');
    expect(element).toHaveClass('leading-relaxed');
    expect(element).toHaveClass('text-gray-800');
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(
      <CategoryTypography {...defaultProps} variant="title" />
    );
    expect(screen.getByText('Test content')).toHaveClass('font-bold');

    rerender(<CategoryTypography {...defaultProps} variant="subtitle" />);
    expect(screen.getByText('Test content')).toHaveClass('font-semibold');

    rerender(<CategoryTypography {...defaultProps} variant="caption" />);
    expect(screen.getByText('Test content')).toHaveClass('font-light');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(
      <CategoryTypography {...defaultProps} size="sm" />
    );
    expect(screen.getByText('Test content')).toHaveClass('text-sm');

    rerender(<CategoryTypography {...defaultProps} size="lg" />);
    expect(screen.getByText('Test content')).toHaveClass('text-lg');

    rerender(<CategoryTypography {...defaultProps} size="xl" />);
    expect(screen.getByText('Test content')).toHaveClass('text-xl');
  });

  it('applies custom className', () => {
    render(<CategoryTypography {...defaultProps} className="custom-class" />);
    expect(screen.getByText('Test content')).toHaveClass('custom-class');
  });
});

describe('CategoryBadge', () => {
  const defaultProps = {
    category: 'Casamiento' as EventCategory,
  };

  it('renders with default props', () => {
    render(<CategoryBadge {...defaultProps} />);
    expect(screen.getByText('Casamiento')).toBeInTheDocument();
  });

  it('shows icon by default', () => {
    render(<CategoryBadge {...defaultProps} />);
    expect(screen.getByText('💒')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<CategoryBadge {...defaultProps} showIcon={false} />);
    expect(screen.queryByText('💒')).not.toBeInTheDocument();
  });

  it('shows description when showDescription is true', () => {
    render(<CategoryBadge {...defaultProps} showDescription={true} />);
    expect(screen.getByText('Celebración de amor y unión')).toBeInTheDocument();
  });

  it('applies category-specific styling', () => {
    render(<CategoryBadge {...defaultProps} />);
    const element = screen.getByText('Casamiento').closest('div');

    expect(element).toHaveClass('bg-card');
    expect(element).toHaveClass('text-card-foreground');
    expect(element).toHaveClass('border-border');
  });

  it('applies custom className', () => {
    render(<CategoryBadge {...defaultProps} className="custom-class" />);
    const element = screen.getByText('Casamiento').closest('div');
    expect(element).toHaveClass('custom-class');
  });
});

describe('CategoryTitle', () => {
  const defaultProps = {
    category: 'Casamiento' as EventCategory,
    title: 'Test Title',
  };

  it('renders with default props', () => {
    render(<CategoryTitle {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Casamiento')).toBeInTheDocument();
  });

  it('shows badge by default', () => {
    render(<CategoryTitle {...defaultProps} />);
    expect(screen.getByText('Casamiento')).toBeInTheDocument();
  });

  it('hides badge when showBadge is false', () => {
    render(<CategoryTitle {...defaultProps} showBadge={false} />);
    expect(screen.queryByText('Casamiento')).not.toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies title styling', () => {
    render(<CategoryTitle {...defaultProps} />);
    const titleElement = screen.getByText('Test Title');
    expect(titleElement).toHaveClass('font-bold');
    expect(titleElement).toHaveClass('text-2xl');
  });
});

describe('CategorySubtitle', () => {
  const defaultProps = {
    category: 'Casamiento' as EventCategory,
    subtitle: 'Test Subtitle',
  };

  it('renders with default props', () => {
    render(<CategorySubtitle {...defaultProps} />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('applies subtitle styling', () => {
    render(<CategorySubtitle {...defaultProps} />);
    const element = screen.getByText('Test Subtitle');
    expect(element).toHaveClass('font-semibold');
    expect(element).toHaveClass('opacity-90');
  });

  it('applies custom className', () => {
    render(<CategorySubtitle {...defaultProps} className="custom-class" />);
    expect(screen.getByText('Test Subtitle')).toHaveClass('custom-class');
  });
});

describe('CategoryBody', () => {
  const defaultProps = {
    category: 'Casamiento' as EventCategory,
    children: 'Test body content',
  };

  it('renders with default props', () => {
    render(<CategoryBody {...defaultProps} />);
    expect(screen.getByText('Test body content')).toBeInTheDocument();
  });

  it('applies body styling', () => {
    render(<CategoryBody {...defaultProps} />);
    const element = screen.getByText('Test body content');
    expect(element).toHaveClass('font-normal');
    expect(element).toHaveClass('leading-relaxed');
  });

  it('applies custom className', () => {
    render(<CategoryBody {...defaultProps} className="custom-class" />);
    expect(screen.getByText('Test body content')).toHaveClass('custom-class');
  });
});

describe('CategoryCaption', () => {
  const defaultProps = {
    category: 'Casamiento' as EventCategory,
    children: 'Test caption',
  };

  it('renders with default props', () => {
    render(<CategoryCaption {...defaultProps} />);
    expect(screen.getByText('Test caption')).toBeInTheDocument();
  });

  it('applies caption styling', () => {
    render(<CategoryCaption {...defaultProps} />);
    const element = screen.getByText('Test caption');
    expect(element).toHaveClass('font-light');
    expect(element).toHaveClass('text-sm');
    expect(element).toHaveClass('opacity-75');
  });

  it('applies custom className', () => {
    render(<CategoryCaption {...defaultProps} className="custom-class" />);
    expect(screen.getByText('Test caption')).toHaveClass('custom-class');
  });
});
