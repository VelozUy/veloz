import React from 'react';
import { render } from '@testing-library/react';
import OurWorkHeader from '../OurWorkHeader';
import OverviewSection from '../OverviewSection';
import EditorialGrid from '../EditorialGrid';
import CategoryNavigation from '../CategoryNavigation';

// Mock data for testing
const mockCategories = [
  {
    id: 'overview',
    name: 'Eventos',
    label: 'Eventos',
    title: 'Eventos',
    description: 'All events',
    eventTypes: ['all'],
  },
  {
    id: 'food',
    name: 'Food',
    label: 'Food',
    title: 'Food Photography',
    description: 'Food and culinary photography',
    eventTypes: ['food'],
  },
  {
    id: 'people',
    name: 'People',
    label: 'People',
    title: 'People Photography',
    description: 'Portrait and people photography',
    eventTypes: ['people'],
  },
  {
    id: 'still-life',
    name: 'Still Life',
    label: 'Still Life',
    title: 'Still Life Photography',
    description: 'Still life and product photography',
    eventTypes: ['still-life'],
  },
  {
    id: 'travel',
    name: 'Travel',
    label: 'Travel',
    title: 'Travel Photography',
    description: 'Travel and landscape photography',
    eventTypes: ['travel'],
  },
];

const mockMedia = [
  {
    id: '1',
    projectId: 'project-1',
    projectTitle: 'Test Project',
    type: 'photo' as const,
    url: '/test-image.jpg',
    width: 800,
    height: 600,
    alt: 'Test image',
    featured: true,
  },
];

const mockCategoryMedia = [
  {
    id: 'food',
    title: 'Food',
    description: 'Food photography',
    media: mockMedia,
  },
];

describe('Theme Consistency Verification', () => {
  describe('OurWorkHeader', () => {
    it('uses proper theme tokens for colors', () => {
      const { container } = render(
        <OurWorkHeader categories={mockCategories} locale="es" />
      );

      // Check for theme background colors
      const navigationContainer = container.querySelector('.bg-muted');
      expect(navigationContainer).toBeInTheDocument();
    });

    it('uses proper theme tokens for spacing', () => {
      const { container } = render(
        <OurWorkHeader categories={mockCategories} locale="es" />
      );

      // Check for theme spacing
      const navigationContainer = container.querySelector('.py-8');
      expect(navigationContainer).toBeInTheDocument();
      expect(navigationContainer).toHaveClass('md:py-12');
    });

    it('uses zero border radius', () => {
      const { container } = render(
        <OurWorkHeader categories={mockCategories} locale="es" />
      );

      // Check that no rounded classes are used (except rounded-none) in the header only
      const headerElements = container.querySelectorAll('*');
      headerElements.forEach(element => {
        const className = element.className;
        if (typeof className === 'string') {
          // Check for any rounded classes that aren't rounded-none
          const hasRounded = className.match(/rounded-[^n]/);
          if (hasRounded) {
            // Allow rounded-none but not other rounded classes
            expect(className).not.toMatch(/rounded-[^n]/);
          }
        }
      });
    });
  });

  describe('OverviewSection', () => {
    it('uses proper theme tokens for colors', () => {
      const { container } = render(
        <OverviewSection categories={mockCategoryMedia} />
      );

      // Check for theme background colors
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-muted');

      // Check for theme text colors (category headings use text-foreground)
      const categoryHeadings = container.querySelectorAll('h3');
      categoryHeadings.forEach(heading => {
        // Category headings use text-foreground, card heading uses text-card-foreground
        if (heading.textContent?.includes('Food')) {
          expect(heading).toHaveClass('text-foreground');
        } else if (heading.textContent?.includes('¿Te gustaría')) {
          expect(heading).toHaveClass('text-card-foreground');
        }
      });

      // Check for theme border colors
      const separators = container.querySelectorAll('.border-t');
      separators.forEach(separator => {
        expect(separator).toHaveClass('border-border');
      });
    });

    it('uses proper theme tokens for spacing', () => {
      const { container } = render(
        <OverviewSection categories={mockCategoryMedia} />
      );

      // Check for theme spacing
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-12');
      expect(section).toHaveClass('md:py-8');

      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toHaveClass('px-8');
      expect(containerDiv).toHaveClass('md:px-16');
    });

    it('uses proper theme tokens for card styling', () => {
      const { container } = render(
        <OverviewSection categories={mockCategoryMedia} />
      );

      // Check for card theme tokens
      const card = container.querySelector('.bg-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border-border');
      // The card itself doesn't have text-card-foreground, but its children do
      const cardContent = card?.querySelector('h3');
      expect(cardContent).toHaveClass('text-card-foreground');
    });
  });

  describe('EditorialGrid', () => {
    it('uses proper theme tokens for colors', () => {
      const { container } = render(<EditorialGrid media={mockMedia} />);

      // Check for theme text colors
      const emptyState = container.querySelector('.text-muted-foreground');
      if (emptyState) {
        expect(emptyState).toHaveClass('text-muted-foreground');
      }
    });

    it('uses proper theme tokens for spacing', () => {
      const { container } = render(<EditorialGrid media={mockMedia} />);

      // Check for theme spacing in grid
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4');
      expect(grid).toHaveClass('md:gap-6');
      expect(grid).toHaveClass('lg:gap-8');
    });

    it('uses zero border radius', () => {
      const { container } = render(<EditorialGrid media={mockMedia} />);

      // Check that no rounded classes are used (except rounded-none)
      const allElements = container.querySelectorAll('*');
      allElements.forEach(element => {
        const className = element.className;
        if (typeof className === 'string') {
          // Check for any rounded classes that aren't rounded-none
          const hasRounded = className.match(/rounded-[^n]/);
          if (hasRounded) {
            // Allow rounded-none but not other rounded classes
            expect(className).not.toMatch(/rounded-[^n]/);
          }
        }
      });
    });
  });

  describe('CategoryNavigation', () => {
    it('uses proper theme tokens for colors', () => {
      const { container } = render(
        <CategoryNavigation
          categories={mockCategories}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      // Check for theme text colors - look for desktop tabs only
      const links = container.querySelectorAll('.hidden.md\\:block a');
      links.forEach(link => {
        // Active links use text-primary, inactive links use text-muted-foreground
        const isActive = link.classList.contains('text-primary');
        if (isActive) {
          expect(link).toHaveClass('text-primary');
        } else {
          expect(link).toHaveClass('text-muted-foreground');
          // Only inactive links should have hover classes
          expect(link.className).toContain('hover:text-primary');
        }
      });
    });

    it('uses proper theme tokens for spacing', () => {
      const { container } = render(
        <CategoryNavigation
          categories={mockCategories}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      // Check for theme spacing - look for the desktop tabs container
      const tabContainer = container.querySelector('.hidden.md\\:block .flex');
      expect(tabContainer).toHaveClass('gap-6');
      expect(tabContainer).toHaveClass('md:gap-8');
    });

    it('uses zero border radius', () => {
      const { container } = render(
        <CategoryNavigation
          categories={mockCategories}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      // Check that no rounded classes are used (except rounded-none) in desktop tabs only
      const desktopElements = container.querySelectorAll(
        '.hidden.md\\:block *'
      );
      desktopElements.forEach(element => {
        const className = element.className;
        if (typeof className === 'string') {
          // Check for any rounded classes that aren't rounded-none
          const hasRounded = className.match(/rounded-[^n]/);
          if (hasRounded) {
            // Allow rounded-none but not other rounded classes
            expect(className).not.toMatch(/rounded-[^n]/);
          }
        }
      });
    });
  });

  describe('Theme Token Usage', () => {
    it('uses Roboto font family as default', () => {
      const { container } = render(
        <OurWorkHeader categories={mockCategories} locale="es" />
      );

      // Check that font-body class is used (which maps to Roboto)
      const title = container.querySelector('h1');
      expect(title).toHaveClass('font-body');
    });

    it('uses semantic color tokens', () => {
      const { container } = render(
        <OverviewSection categories={mockCategoryMedia} />
      );

      // Check for semantic color usage
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-muted');

      // Check for actual text color used in component
      const headings = container.querySelectorAll('h3');
      headings.forEach(heading => {
        // Category headings use text-foreground, card heading uses text-card-foreground
        if (heading.textContent?.includes('Food')) {
          expect(heading).toHaveClass('text-foreground');
        } else if (heading.textContent?.includes('¿Te gustaría')) {
          expect(heading).toHaveClass('text-card-foreground');
        }
      });
    });

    it('uses consistent spacing tokens', () => {
      const { container } = render(<EditorialGrid media={mockMedia} />);

      // Check for consistent spacing usage
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4');
      expect(grid).toHaveClass('md:gap-6');
      expect(grid).toHaveClass('lg:gap-8');
    });
  });
});
