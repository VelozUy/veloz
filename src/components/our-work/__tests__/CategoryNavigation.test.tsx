import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryNavigation from '../CategoryNavigation';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const defaultProps = {
  categories: [
    { id: 'boda', name: 'Boda', label: 'Bodas y Eventos' },
    { id: 'corporativo', name: 'Corporativo', label: 'Eventos Corporativos' },
    { id: 'producto', name: 'Producto', label: 'Fotografía de Producto' },
    { id: 'moda', name: 'Moda', label: 'Fotografía de Moda' },
  ],
  activeCategory: 'boda',
  onCategoryChange: jest.fn(),
};

describe('CategoryNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tabs Navigation', () => {
    it('renders all category tabs', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Check that all categories are rendered as tabs
      expect(screen.getByText('Boda')).toBeInTheDocument();
      expect(screen.getByText('Corporativo')).toBeInTheDocument();
      expect(screen.getByText('Producto')).toBeInTheDocument();
      expect(screen.getByText('Moda')).toBeInTheDocument();
    });

    it('highlights active category', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const activeTab = screen.getByRole('tab', { name: 'Boda' });
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('calls onCategoryChange when category is clicked', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const corporativoTab = screen.getByRole('tab', { name: 'Corporativo' });

      // Simulate the Radix UI Tabs onValueChange behavior
      fireEvent.click(corporativoTab);

      // The Radix UI Tabs component should trigger the onValueChange
      // which is mapped to onCategoryChange in our component
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('corporativo');
    });

    it('applies editorial styling classes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('text-base');
        expect(tab).toHaveClass('uppercase');
        expect(tab).toHaveClass('tracking-tight');
        expect(tab).toHaveClass('border-b-2');
        expect(tab).toHaveClass('border-transparent');
        expect(tab).toHaveClass('hover:border-primary');
        expect(tab).toHaveClass('hover:text-primary');
        expect(tab).toHaveClass('transition-all');
        expect(tab).toHaveClass('duration-200');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles arrow key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Test right arrow
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('corporativo');

      // Test left arrow
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('moda');
    });

    it('handles Home key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'Home' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('boda');
    });

    it('handles End key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'End' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('moda');
    });
  });

  describe('Accessibility', () => {
    it('has proper tab role attributes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('role', 'tab');
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('has proper tablist role', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
      expect(tablist).toHaveAttribute('role', 'tablist');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct classes for horizontal navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('w-full');
      expect(tabsList).toHaveClass('justify-start');
      expect(tabsList).toHaveClass('bg-transparent');
      expect(tabsList).toHaveClass('border-b');
      expect(tabsList).toHaveClass('border-border');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty categories array', () => {
      render(<CategoryNavigation {...defaultProps} categories={[]} />);

      const tabs = screen.queryAllByRole('tab');
      expect(tabs).toHaveLength(0);
    });

    it('handles single category', () => {
      const singleCategoryProps = {
        ...defaultProps,
        categories: [{ id: 'boda', name: 'Boda', label: 'Bodas y Eventos' }],
      };

      render(<CategoryNavigation {...singleCategoryProps} />);

      expect(screen.getByText('Boda')).toBeInTheDocument();
      expect(screen.queryByText('Corporativo')).not.toBeInTheDocument();
    });

    it('handles active category not in list', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="nonexistent" />
      );

      // Should still render all categories
      expect(screen.getByText('Boda')).toBeInTheDocument();
      expect(screen.getByText('Corporativo')).toBeInTheDocument();
      expect(screen.getByText('Producto')).toBeInTheDocument();
      expect(screen.getByText('Moda')).toBeInTheDocument();
    });
  });
});
