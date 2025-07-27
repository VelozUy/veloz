import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  VelozSignature,
  PerimeterBox,
  TargetLoader,
  StripedDivider,
  VelozStamp,
  GridDotOverlay,
} from '../index';

describe('Veloz Brand Components', () => {
  describe('VelozSignature', () => {
    it('renders horizontal variant with text', () => {
      render(<VelozSignature variant="horizontal" />);
      expect(screen.getByText('VELOZ')).toBeInTheDocument();
    });

    it('renders compact variant without text', () => {
      render(<VelozSignature variant="compact" />);
      expect(screen.queryByText('VELOZ')).not.toBeInTheDocument();
    });
  });

  describe('PerimeterBox', () => {
    it('renders children content', () => {
      render(
        <PerimeterBox>
          <div>Test content</div>
        </PerimeterBox>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('TargetLoader', () => {
    it('renders without crashing', () => {
      render(<TargetLoader />);
      // The loader should render without errors and have animation classes
      expect(
        document.querySelector('.animate-target-bounce')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.animate-target-pulse')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.animate-target-scale')
      ).toBeInTheDocument();
    });
  });

  describe('StripedDivider', () => {
    it('renders without crashing', () => {
      render(<StripedDivider />);
      // The divider should render without errors
      expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
    });
  });

  describe('VelozStamp', () => {
    it('renders with studio text', () => {
      render(<VelozStamp />);
      expect(screen.getByText('Veloz Studio')).toBeInTheDocument();
    });
  });

  describe('GridDotOverlay', () => {
    it('renders with default spacing', () => {
      render(<GridDotOverlay />);
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with custom spacing', () => {
      render(<GridDotOverlay spacing={5} />);
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });
});
