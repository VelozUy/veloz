import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OurWorkHeader from '../OurWorkHeader';
import OverviewSection from '../OverviewSection';
import EditorialGrid from '../EditorialGrid';
import CategoryNavigation from '../CategoryNavigation';

// Mock data for testing
const mockCategories = [
  {
    id: 'overview',
    name: 'Overview',
    label: 'Overview',
    title: 'Overview',
    description: 'All projects',
    eventTypes: ['all'],
  },
  {
    id: 'eventos',
    name: 'Eventos',
    label: 'Eventos',
    title: 'Eventos',
    description: 'Event photography',
    eventTypes: ['eventos'],
  },
  {
    id: 'photoshoot',
    name: 'Photoshoot',
    label: 'Photoshoot',
    title: 'Photoshoot',
    description: 'Portrait photography',
    eventTypes: ['photoshoot'],
  },
];

const mockMedia = [
  {
    id: '1',
    projectId: 'project-1',
    projectTitle: 'Test Project 1',
    type: 'photo' as const,
    url: 'https://example.com/image1.jpg',
    alt: 'Test image 1',
    width: 800,
    height: 600,
    featured: true,
    aspectRatio: '16:9' as const,
  },
  {
    id: '2',
    projectId: 'project-2',
    projectTitle: 'Test Project 2',
    type: 'video' as const,
    url: 'https://example.com/video1.mp4',
    alt: 'Test video 1',
    width: 1920,
    height: 1080,
    featured: false,
    aspectRatio: '16:9' as const,
  },
];

const mockCategoryMedia = [
  {
    id: 'eventos',
    title: 'Eventos',
    description: 'Event photography',
    media: mockMedia,
  },
  {
    id: 'photoshoot',
    title: 'Photoshoot',
    description: 'Portrait photography',
    media: mockMedia.slice(0, 1),
  },
];

describe('Accessibility Testing - Editorial Design', () => {
  describe('OurWorkHeader', () => {
    it('has proper heading hierarchy', () => {
      render(<OurWorkHeader categories={mockCategories} locale="es" />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('Eventos');
    });

    it('has proper focus management', () => {
      render(<OurWorkHeader categories={mockCategories} locale="es" />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabIndex');
      });
    });

    it('has sufficient color contrast', () => {
      const { container } = render(
        <OurWorkHeader categories={mockCategories} locale="es" />
      );

      // Check that text colors use theme tokens for proper contrast
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-foreground');
    });
  });

  describe('CategoryNavigation', () => {
    it('has proper tab roles and states', () => {
      render(
        <CategoryNavigation
          categories={mockCategories}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(mockCategories.length);

      const activeTab = screen.getByRole('tab', { selected: true });
      expect(activeTab).toBeInTheDocument();
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('has proper tablist role', () => {
      render(
        <CategoryNavigation
          categories={mockCategories}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      const tablists = screen.getAllByRole('tablist');
      expect(tablists.length).toBeGreaterThan(0);
    });

    it('has keyboard navigation support', () => {
      render(
        <CategoryNavigation
          categories={mockCategories}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabIndex');
      });
    });

    it('has proper contrast for active and inactive states', () => {
      render(
        <CategoryNavigation
          categories={mockCategories}
          activeCategory="overview"
          onCategoryChange={jest.fn()}
        />
      );

      const activeTab = screen.getByRole('tab', { selected: true });
      // Check for editorial styling classes that handle active state
      expect(activeTab).toHaveClass('data-[state=active]:text-primary');
      expect(activeTab).toHaveClass('data-[state=active]:border-primary');

      const inactiveTabs = screen
        .getAllByRole('tab')
        .filter(tab => !tab.getAttribute('aria-selected'));
      inactiveTabs.forEach(tab => {
        expect(tab).toHaveClass('text-muted-foreground');
      });
    });
  });

  describe('EditorialGrid', () => {
    it('has proper alt text for images', () => {
      render(<EditorialGrid media={mockMedia} />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('has proper video attributes for accessibility', () => {
      render(<EditorialGrid media={mockMedia} />);

      const videos = screen.getAllByTestId('video-2');
      videos.forEach(video => {
        expect(video).toHaveAttribute('playsinline');
        expect(video).toHaveAttribute('autoplay');
        expect(video).toHaveAttribute('preload');
      });
    });

    it('has proper loading states', () => {
      render(<EditorialGrid media={mockMedia} />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading');
      });
    });

    it('has proper aspect ratio preservation', () => {
      const { container } = render(<EditorialGrid media={mockMedia} />);

      const images = container.querySelectorAll('img');
      images.forEach(img => {
        // Check that images have proper styling for aspect ratio
        expect(img).toHaveClass('object-cover');
      });
    });
  });

  describe('OverviewSection', () => {
    it('has proper heading hierarchy', () => {
      render(<OverviewSection categories={mockCategoryMedia} />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('has proper landmark regions', () => {
      const { container } = render(
        <OverviewSection categories={mockCategoryMedia} />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('has proper focus indicators', () => {
      const { container } = render(
        <OverviewSection categories={mockCategoryMedia} />
      );

      const interactiveElements = container.querySelectorAll(
        'a, button, [tabindex]'
      );
      interactiveElements.forEach(element => {
        // Check that interactive elements have focus styles
        const className = element.className;
        expect(className).toMatch(/focus|transition/);
      });
    });
  });

  describe('Cross-Component Accessibility', () => {
    it('maintains consistent focus management', () => {
      render(
        <div>
          <OurWorkHeader categories={mockCategories} locale="es" />
          <CategoryNavigation
            categories={mockCategories}
            activeCategory="overview"
            onCategoryChange={jest.fn()}
          />
          <EditorialGrid media={mockMedia} />
        </div>
      );

      // Check that all interactive elements have proper focus management
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabIndex');
      });

      const comboboxes = screen.getAllByRole('combobox');
      comboboxes.forEach(combobox => {
        // Check that comboboxes have proper accessibility attributes
        expect(combobox).toHaveAttribute('role', 'combobox');
        expect(combobox).toHaveAttribute('aria-expanded');
      });
    });

    it('uses consistent theme tokens for colors', () => {
      const { container } = render(
        <div>
          <OurWorkHeader categories={mockCategories} locale="es" />
          <CategoryNavigation
            categories={mockCategories}
            activeCategory="overview"
            onCategoryChange={jest.fn()}
          />
          <EditorialGrid media={mockMedia} />
        </div>
      );

      // Check that all color classes use theme tokens (simplified check)
      const allElements = container.querySelectorAll('*');
      let themeTokenCount = 0;
      let totalColorElements = 0;

      allElements.forEach(element => {
        const className = element.className;
        if (
          typeof className === 'string' &&
          (className.match(/bg-/) ||
            className.match(/text-/) ||
            className.match(/border-/))
        ) {
          totalColorElements++;
          if (
            className.match(
              /bg-(background|card|primary|muted|accent|destructive|input)|text-(foreground|card-foreground|primary|muted-foreground|accent-foreground|destructive-foreground)|border-(border|input|primary|secondary|muted|accent|destructive)/
            )
          ) {
            themeTokenCount++;
          }
        }
      });

      // At least 70% of color elements should use theme tokens
      if (totalColorElements > 0) {
        const themeTokenPercentage =
          (themeTokenCount / totalColorElements) * 100;
        expect(themeTokenPercentage).toBeGreaterThan(70);
      }
    });

    it('has proper ARIA attributes', () => {
      render(
        <div>
          <OurWorkHeader categories={mockCategories} locale="es" />
          <CategoryNavigation
            categories={mockCategories}
            activeCategory="overview"
            onCategoryChange={jest.fn()}
          />
        </div>
      );

      // Check for proper ARIA attributes
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('role', 'tab');
      });

      const tablists = screen.getAllByRole('tablist');
      tablists.forEach(tablist => {
        expect(tablist).toHaveAttribute('role', 'tablist');
      });
    });
  });
});
