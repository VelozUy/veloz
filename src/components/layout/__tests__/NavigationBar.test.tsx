import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavigationBar from '../NavigationBar';
import { NavItem } from '../NavigationBar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/test',
}));

describe('NavigationBar', () => {
  const mockNavItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
  ];

  const mockRightItems = [
    <a key="contact" href="/contact">
      Contact
    </a>,
    <button key="language">Language</button>,
  ];

  it('renders navigation items on desktop', () => {
    render(
      <NavigationBar
        logo={<div>Logo</div>}
        navItems={mockNavItems}
        rightItems={mockRightItems}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('shows mobile menu button on mobile', () => {
    render(
      <NavigationBar
        logo={<div>Logo</div>}
        navItems={mockNavItems}
        rightItems={mockRightItems}
      />
    );

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('opens mobile menu and shows all items when menu button is clicked', () => {
    render(
      <NavigationBar
        logo={<div>Logo</div>}
        navItems={mockNavItems}
        rightItems={mockRightItems}
      />
    );

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(menuButton);

    // Check that all navigation items are visible in mobile menu
    const homeElements = screen.getAllByText('Home');
    const aboutElements = screen.getAllByText('About');
    const contactElements = screen.getAllByText('Contact');
    const languageElements = screen.getAllByText('Language');

    // Should have 2 of each (desktop + mobile)
    expect(homeElements).toHaveLength(2);
    expect(aboutElements).toHaveLength(2);
    expect(contactElements).toHaveLength(2);
    expect(languageElements).toHaveLength(2);
  });

  it('closes mobile menu when a navigation item is clicked', () => {
    render(
      <NavigationBar
        logo={<div>Logo</div>}
        navItems={mockNavItems}
        rightItems={mockRightItems}
      />
    );

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(menuButton);

    // Menu should be open - should have 2 About elements (desktop + mobile)
    const aboutElements = screen.getAllByText('About');
    expect(aboutElements).toHaveLength(2);

    // Click on the mobile navigation item (second one)
    const mobileAboutLink = aboutElements[1];
    fireEvent.click(mobileAboutLink);

    // Menu should be closed - should only have 1 About element (desktop only)
    expect(screen.getAllByText('About')).toHaveLength(1);
  });

  it('closes mobile menu when a right item is clicked', () => {
    render(
      <NavigationBar
        logo={<div>Logo</div>}
        navItems={mockNavItems}
        rightItems={mockRightItems}
      />
    );

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(menuButton);

    // Menu should be open - should have 2 Contact elements (desktop + mobile)
    const contactElements = screen.getAllByText('Contact');
    expect(contactElements).toHaveLength(2);

    // Click on the mobile contact link (second one)
    const mobileContactLink = contactElements[1];
    fireEvent.click(mobileContactLink);

    // Menu should be closed - should only have 1 Contact element (desktop only)
    expect(screen.getAllByText('Contact')).toHaveLength(1);
  });
});
