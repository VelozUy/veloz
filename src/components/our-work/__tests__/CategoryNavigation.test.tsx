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
    { id: 'overview', name: 'Overview', label: 'Vista General' },
    { id: 'food', name: 'Food', label: 'Fotografía Gastronómica' },
    { id: 'people', name: 'People', label: 'Fotografía de Personas' },
    { id: 'still-life', name: 'Still Life', label: 'Bodegones' },
    { id: 'travel', name: 'Travel', label: 'Fotografía de Viajes' },
  ],
  activeCategory: 'overview',
  onCategoryChange: jest.fn(),
};

describe('CategoryNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tabs Navigation', () => {
    it('renders all category tabs', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Should render 5 categories
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('People')).toBeInTheDocument();
      expect(screen.getByText('Still Life')).toBeInTheDocument();
      expect(screen.getByText('Travel')).toBeInTheDocument();
    });

    it('highlights active category', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const activeTab = screen.getByText('Overview');
      expect(activeTab).toHaveClass('data-[state=active]:border-primary');
    });

    it('renders tabs with correct values', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      const tabValues = tabs.map(tab => tab.getAttribute('data-state'));

      // Should have 5 tabs: overview (active) + 4 categories (inactive)
      expect(tabValues).toEqual([
        'active',
        'inactive',
        'inactive',
        'inactive',
        'inactive',
      ]);
    });

    it('applies editorial styling classes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('text-base');
        expect(tab).toHaveClass('uppercase');
        expect(tab).toHaveClass('tracking-tight');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles arrow key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Test right arrow (should go from overview to food)
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('food');

      // Test left arrow (should go from overview to travel)
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('travel');
    });

    it('handles Home key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'Home' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('overview');
    });

    it('handles End key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'End' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('travel');
    });
  });

  describe('Accessibility', () => {
    it('has proper tab role attributes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      // Should have 5 tabs
      expect(tabs).toHaveLength(5);

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('role', 'tab');
      });
    });

    it('has proper tablist role', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct classes for horizontal navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('w-full');
      expect(tabList).toHaveClass('justify-center');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty categories array', () => {
      render(
        <CategoryNavigation
          categories={[]}
          activeCategory=""
          onCategoryChange={jest.fn()}
        />
      );

      const tabs = screen.queryAllByRole('tab');
      expect(tabs).toHaveLength(0);
    });

    it('handles single category', () => {
      render(
        <CategoryNavigation
          categories={[
            { id: 'overview', name: 'Overview', label: 'Vista General' },
          ]}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      // Should have 1 tab
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('handles active category not in list', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="nonexistent" />
      );

      // Should still render all tabs
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
  });
});
