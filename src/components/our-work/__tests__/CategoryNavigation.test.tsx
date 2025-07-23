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
      id: 'culturales',
      name: 'Culturales',
      label: 'Culturales',
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

  describe('Navigation Links', () => {
    it('renders all category links', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Should render 5 categories in the desktop navigation
      const desktopLinks = screen.getAllByRole('link');
      expect(desktopLinks).toHaveLength(5);

      // Check that all category names are present in the links by checking the link elements
      const linkTexts = desktopLinks.map(link => link.textContent);
      expect(linkTexts).toContain('Eventos');
      expect(linkTexts).toContain('Casamientos');
      expect(linkTexts).toContain('Photoshoot');
      expect(linkTexts).toContain('Culturales');
      expect(linkTexts).toContain('Corporativos');
    });

    it('highlights active category', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Find the active link in the desktop navigation
      const activeLink = screen.getByRole('link', { name: 'Eventos' });
      expect(activeLink).toHaveClass('text-primary');
    });

    it('renders links with correct href values', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const links = screen.getAllByRole('link');
      const hrefs = links.map(link => link.getAttribute('href'));

      // Should have 5 links with correct href values
      expect(hrefs).toEqual([
        '/our-work',
        '/our-work/casamiento',
        '/our-work/photoshoot',
        '/our-work/culturales',
        '/our-work/corporativos',
      ]);
    });

    it('applies editorial styling classes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('text-xl');
        expect(link).toHaveClass('uppercase');
        expect(link).toHaveClass('tracking-tight');
      });
    });
  });

  describe('Mobile Custom Navigation', () => {
    it('renders custom mobile button', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Check that the mobile button is present using class selector
      const mobileButton = document.querySelector('.block.md\\:hidden button');
      expect(mobileButton).toBeInTheDocument();

      // Check that the button shows the active category
      expect(mobileButton).toHaveTextContent('Eventos');
      
      // Check that it has the chevron icon
      const chevronIcon = mobileButton?.querySelector('svg');
      expect(chevronIcon).toBeInTheDocument();
    });

    it('opens drawer when mobile button is clicked', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Find and click the mobile button using class selector
      const mobileButton = document.querySelector('.block.md\\:hidden button');
      fireEvent.click(mobileButton!);

      // Check that the dropdown opens with categories
      // Check that all categories are present in the dropdown
      expect(screen.getAllByText('Eventos')).toHaveLength(3); // One in button, one in desktop nav, one in dropdown
      expect(screen.getAllByText('Casamientos')).toHaveLength(2); // One in desktop nav, one in dropdown
      expect(screen.getAllByText('Photoshoot')).toHaveLength(2); // One in desktop nav, one in dropdown
      expect(screen.getAllByText('Culturales')).toHaveLength(2); // One in desktop nav, one in dropdown
      expect(screen.getAllByText('Corporativos')).toHaveLength(2); // One in desktop nav, one in dropdown
    });

    it('closes dropdown when clicking outside', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Open the dropdown
      const mobileButton = document.querySelector('.block.md\\:hidden button');
      fireEvent.click(mobileButton!);

      // Check dropdown is open by verifying categories are visible
      expect(screen.getAllByText('Casamientos')).toHaveLength(2);

      // Close the dropdown by clicking the overlay
      const overlay = document.querySelector('.fixed.inset-0.bg-transparent');
      fireEvent.click(overlay!);

      // Check dropdown closes (only desktop nav categories should remain)
      expect(screen.getAllByText('Casamientos')).toHaveLength(1); // Only in desktop nav
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
    it('has proper link role attributes', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const links = screen.getAllByRole('link');
      // Should have 5 links
      expect(links).toHaveLength(5);

      links.forEach(link => {
        // Links have implicit role="link", no need to check explicit attribute
        expect(link.tagName.toLowerCase()).toBe('a');
        expect(link).toHaveAttribute('href');
      });
    });

    it('has proper navigation structure', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      // Check that all links have valid href attributes
      links.forEach(link => {
        expect(link.getAttribute('href')).toMatch(/^\/our-work/);
      });
    });

    it('has proper mobile button accessibility', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const mobileButton = document.querySelector('.block.md\\:hidden button');
      expect(mobileButton).toBeInTheDocument();
      expect(mobileButton).toHaveClass('focus-visible:outline-none');
      expect(mobileButton).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct classes for horizontal navigation', () => {
      render(<CategoryNavigation {...defaultProps} />);

      const navigationContainer = document.querySelector('.hidden.md\\:block .flex');
      expect(navigationContainer).toHaveClass('w-full');
      expect(navigationContainer).toHaveClass('justify-center');
      expect(navigationContainer).toHaveClass('gap-6');
      expect(navigationContainer).toHaveClass('md:gap-8');
    });

    it('renders both mobile and desktop components', () => {
      render(<CategoryNavigation {...defaultProps} />);

      // Check that both mobile button and desktop navigation links are present
      const mobileButton = document.querySelector('.block.md\\:hidden button'); 
      const navigationLinks = screen.getAllByRole('link');

      expect(mobileButton).toBeInTheDocument();
      expect(navigationLinks.length).toBeGreaterThan(0);
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

      const links = screen.queryAllByRole('link');
      expect(links).toHaveLength(0);
    });

    it('handles single category', () => {
      render(
        <CategoryNavigation
          categories={[{ id: 'overview', name: 'Eventos', label: 'Eventos' }]}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      // Should have 1 link in desktop view
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);

      // Should also have the mobile button
      const mobileButton = document.querySelector('.block.md\\:hidden button');
      expect(mobileButton).toBeInTheDocument();
    });

    it('handles active category not in list', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="nonexistent" />
      );

      // Should still render all links
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(5);
    });
  });

  describe('Active State Styling', () => {
    it('applies active state styling to selected link', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="overview" />
      );

      const activeLink = screen.getByRole('link', { name: 'Eventos' });
      // Check for editorial styling classes from navigation links
      expect(activeLink).toHaveClass('text-xl');
      expect(activeLink).toHaveClass('uppercase');
      expect(activeLink).toHaveClass('tracking-tight');
      expect(activeLink).toHaveClass('text-primary');
      expect(activeLink).toHaveClass('after:bg-primary');
      expect(activeLink).toHaveClass('after:opacity-100');
    });

    it('has proper editorial styling for navigation links', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="overview" />
      );

      const activeLink = screen.getByRole('link', { name: 'Eventos' });
      // Check for editorial styling from navigation links
      expect(activeLink).toHaveClass('inline-flex');
      expect(activeLink).toHaveClass('items-center');
      expect(activeLink).toHaveClass('px-2');
      expect(activeLink).toHaveClass('py-3');
      expect(activeLink).toHaveClass('text-xl');
      expect(activeLink).toHaveClass('uppercase');
      expect(activeLink).toHaveClass('tracking-tight');
      expect(activeLink).toHaveClass('hover:text-primary');
      expect(activeLink).toHaveClass('transition-all');
      expect(activeLink).toHaveClass('duration-300');
    });

    it('has proper href attribute for navigation', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="overview" />
      );

      const activeLink = screen.getByRole('link', { name: 'Eventos' });
      // Check that the link has the proper href attribute
      expect(activeLink).toHaveAttribute('href', '/our-work');
    });

    it('does not have custom underline spans', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="overview" />
      );

      const activeLink = screen.getByRole('link', { name: 'Eventos' });
      // With editorial styling, there should be no custom underline spans
      const underline = activeLink.querySelector('span');
      expect(underline).not.toBeInTheDocument();
    });

    it('has proper padding for editorial styling', () => {
      render(
        <CategoryNavigation {...defaultProps} activeCategory="overview" />
      );

      const activeLink = screen.getByRole('link', { name: 'Eventos' });
      // Editorial styling uses px-2 py-3 for proper spacing
      expect(activeLink).toHaveClass('px-2');
      expect(activeLink).toHaveClass('py-3');
    });
  });
});
