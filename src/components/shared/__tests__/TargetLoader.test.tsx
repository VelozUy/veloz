import React from 'react';
import { render, screen } from '@testing-library/react';
import { TargetLoader } from '../TargetLoader';

describe('TargetLoader', () => {
  it('renders with single circle animation', () => {
    render(<TargetLoader />);

    // Check that the container renders
    const container = document.querySelector('.relative.w-12.h-12');
    expect(container).toBeInTheDocument();

    // Check that the SVG renders
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check that only one circle is present with animation
    const circles = document.querySelectorAll('circle');
    expect(circles).toHaveLength(1);

    // Check that the circle has the pulse animation
    const circle = circles[0];
    expect(circle).toHaveAttribute('style');
    expect(circle.getAttribute('style')).toContain('targetPulse');

    // Check that crosshair lines are present but not animated
    const paths = document.querySelectorAll('path');
    expect(paths).toHaveLength(2); // Two crosshair lines
    paths.forEach(path => {
      expect(path).not.toHaveAttribute('style'); // No animation on lines
    });
  });
});
