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
    { id: 'overview', name: 'Eventos', label: 'Eventos' },
    { id: 'casamiento', name: 'Casamiento', label: 'Casamientos' },
    { id: 'photoshoot', name: 'Photoshoot', label: 'Photoshoot' },
    {
      id: 'culturales-y-artsticos',
      name: 'Culturales y artísticos',
      label: 'Culturales y artísticos',
    },
    { id: 'corporativos', name: 'Corporativos', label: 'Corporativos' },
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

      // Should render 5 categories in the desktop tabs
      const desktopTabs = screen.getAllByRole('tab');
      expect(desktopTabs).toHaveLength(5);

      // Check that all category names are present in the tabs by checking the tab elements
      const tabTexts = desktopTabs.map(tab => tab.textContent);
      expect(tabTexts).toContain('Eventos');
      expect(tabTexts).toContain('Casamientos');
      expect(tabTexts).toContain('Photoshoot');
      expect(tabTexts).toContain('Culturales y artísticos');
      expect(tabTexts).toContain('Corporativos');
    });

    it('highlights active category', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Find the active tab specifically in the desktop tabs
      const activeTab = screen.getByRole('tab', { selected: true });
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

  describe('Mobile Select', () => {
    it('renders select component for mobile', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Check that the select trigger is present
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();

      // Check that the select shows the active category
      expect(selectTrigger).toHaveTextContent('Eventos');
    });

    it('select component has all categories as options', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Open the select dropdown
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      // Check that all categories are available as options by looking for select items
      const selectItems = screen.getAllByRole('option');
      expect(selectItems).toHaveLength(5);

      const itemTexts = selectItems.map(item => item.textContent);
      expect(itemTexts).toContain('Eventos');
      expect(itemTexts).toContain('Casamientos');
      expect(itemTexts).toContain('Photoshoot');
      expect(itemTexts).toContain('Culturales y artísticos');
      expect(itemTexts).toContain('Corporativos');
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles arrow key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Test right arrow (should go from overview to casamiento)
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('casamiento');

      // Test left arrow (should go from overview to corporativos)
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(
        'corporativos'
      );
    });

    it('handles Home key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'Home' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('overview');
    });

    it('handles End key navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'End' });
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(
        'corporativos'
      );
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

    it('has proper select accessibility', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
      expect(selectTrigger).toHaveAttribute('aria-expanded');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct classes for horizontal navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('w-full');
      expect(tabList).toHaveClass('justify-center');
      expect(tabList).toHaveClass('gap-8');
    });

    it('renders both mobile and desktop components', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Check that both mobile select and desktop tabs are present
      const selectTrigger = screen.getByRole('combobox');
      const tabList = screen.getByRole('tablist');

      expect(selectTrigger).toBeInTheDocument();
      expect(tabList).toBeInTheDocument();
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
          categories={[{ id: 'overview', name: 'Eventos', label: 'Eventos' }]}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      // Should have 1 tab in desktop view
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(1);

      // Should also have the select component
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
    });

    it('handles active category not in list', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="nonexistent" />
      );

      // Should still render all tabs
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
    });
  });
});
