import React from 'react';
import { render, screen } from '@testing-library/react';
import StickyTabs from '../sticky-section-tabs';

describe('StickyTabs', () => {
  it('renders sticky tabs with items', () => {
    render(
      <StickyTabs>
        <StickyTabs.Item title="Test Section 1" id="section1">
          <div>Content for section 1</div>
        </StickyTabs.Item>
        <StickyTabs.Item title="Test Section 2" id="section2">
          <div>Content for section 2</div>
        </StickyTabs.Item>
      </StickyTabs>
    );

    expect(screen.getByText('Test Section 1')).toBeInTheDocument();
    expect(screen.getByText('Test Section 2')).toBeInTheDocument();
    expect(screen.getByText('Content for section 1')).toBeInTheDocument();
    expect(screen.getByText('Content for section 2')).toBeInTheDocument();
  });

  it('applies custom mainNavHeight', () => {
    const { container } = render(
      <StickyTabs mainNavHeight="8rem">
        <StickyTabs.Item title="Test Section" id="section1">
          <div>Content</div>
        </StickyTabs.Item>
      </StickyTabs>
    );

    const navSpacer = container.querySelector('[aria-hidden="true"]');
    expect(navSpacer).toHaveStyle({ height: '8rem' });
  });

  it('applies theme classes correctly', () => {
    const { container } = render(
      <StickyTabs>
        <StickyTabs.Item title="Test Section" id="section1">
          <div>Content</div>
        </StickyTabs.Item>
      </StickyTabs>
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('overflow-clip');
  });

  it('ignores non-StickyTabItem children', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <StickyTabs>
        <div>Invalid child</div>
        <StickyTabs.Item title="Valid Section" id="section1">
          <div>Content</div>
        </StickyTabs.Item>
      </StickyTabs>
    );

    expect(screen.getByText('Valid Section')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Invalid child')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders with custom className props', () => {
    const { container } = render(
      <StickyTabs rootClassName="custom-root" titleClassName="custom-title">
        <StickyTabs.Item title="Test Section" id="section1">
          <div>Content</div>
        </StickyTabs.Item>
      </StickyTabs>
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('custom-root');
  });
});
