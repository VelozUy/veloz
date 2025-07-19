import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryNavigation from '../CategoryNavigation';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockCategories = [
  { id: 'boda', name: 'Boda', label: 'Bodas y Eventos' },
  { id: 'corporativo', name: 'Corporativo', label: 'Eventos Corporativos' },
  { id: 'producto', name: 'Producto', label: 'Fotografía de Producto' },
  { id: 'moda', name: 'Moda', label: 'Fotografía de Moda' },
];

const defaultProps = {
  categories: mockCategories,
  activeCategory: 'boda',
  onCategoryChange: jest.fn(),
};

describe('CategoryNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Navigation', () => {
    it('renders all category buttons', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Check that all categories are rendered (both desktop and mobile)
      expect(screen.getAllByText('Boda')).toHaveLength(2); // Desktop + Mobile
      expect(screen.getAllByText('Corporativo')).toHaveLength(2);
      expect(screen.getAllByText('Producto')).toHaveLength(2);
      expect(screen.getAllByText('Moda')).toHaveLength(2);
    });

    it('highlights active category', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Find the desktop navigation button (first one)
      const activeButtons = screen.getAllByText('Boda');
      const desktopButton = activeButtons[0].closest('button');
      expect(desktopButton).toHaveAttribute('aria-current', 'page');
    });

    it('calls onCategoryChange when category is clicked', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Find the desktop navigation button (first one)
      const corporativoButtons = screen.getAllByText('Corporativo');
      const desktopButton = corporativoButtons[0].closest('button');
      fireEvent.click(desktopButton!);

      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('corporativo');
    });

    it('applies hover effects correctly', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Find the desktop navigation button (first one)
      const productoButtons = screen.getAllByText('Producto');
      const desktopButton = productoButtons[0].closest('button');
      expect(desktopButton).toHaveClass('group');
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('renders mobile navigation elements', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Check for progress bar
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Check for keyboard navigation hint
      expect(screen.getByText(/Usa las flechas/)).toBeInTheDocument();
    });

    it('shows correct progress bar value', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '25'); // First category = 25%
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles arrow key navigation', async () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Test right arrow
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      await waitFor(() => {
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(
          'corporativo'
        );
      });
    });

    it('handles Home key navigation', async () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'Home' });
      await waitFor(() => {
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('boda');
      });
    });

    it('handles End key navigation', async () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'End' });
      await waitFor(() => {
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('moda');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Find the desktop navigation button (first one)
      const activeButtons = screen.getAllByText('Boda');
      const desktopButton = activeButtons[0].closest('button');
      expect(desktopButton).toHaveAttribute('aria-current', 'page');
    });

    it('has proper role attributes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute(
        'aria-label',
        'Progreso de navegación'
      );
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct classes for desktop navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const desktopNav = document.querySelector('.hidden.lg\\:block');
      expect(desktopNav).toBeInTheDocument();
    });

    it('applies correct classes for mobile navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const mobileNav = document.querySelector('.lg\\:hidden');
      expect(mobileNav).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty categories array', () => {
      render(<CategoryNavigation {...defaultProps} categories={[]} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles single category', () => {
      render(
        <CategoryNavigation
          {...defaultProps}
          categories={[mockCategories[0]]}
        />
      );

      // Should render both desktop and mobile versions
      expect(screen.getAllByText('Boda')).toHaveLength(2);
      expect(screen.queryByText('Corporativo')).not.toBeInTheDocument();
    });

    it('handles active category not in list', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="nonexistent" />
      );

      // Should still render all categories (both desktop and mobile)
      expect(screen.getAllByText('Boda')).toHaveLength(2);
      expect(screen.getAllByText('Corporativo')).toHaveLength(2);
    });
  });
});
