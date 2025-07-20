import React from 'react';
import { render, screen } from '@testing-library/react';
import { H1, H2, H3, Text, Small } from '../typography';

describe('Typography Components', () => {
  describe('H1 Component', () => {
    it('renders with default styles', () => {
      render(<H1>Test Heading</H1>);
      const heading = screen.getByText('Test Heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('applies custom className', () => {
      render(<H1 className="custom-class">Test Heading</H1>);
      const heading = screen.getByText('Test Heading');
      expect(heading).toHaveClass('custom-class');
    });
  });

  describe('H2 Component', () => {
    it('renders with default styles', () => {
      render(<H2>Test Heading</H2>);
      const heading = screen.getByText('Test Heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('applies custom className', () => {
      render(<H2 className="custom-class">Test Heading</H2>);
      const heading = screen.getByText('Test Heading');
      expect(heading).toHaveClass('custom-class');
    });
  });

  describe('H3 Component', () => {
    it('renders with default styles', () => {
      render(<H3>Test Heading</H3>);
      const heading = screen.getByText('Test Heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H3');
    });

    it('applies custom className', () => {
      render(<H3 className="custom-class">Test Heading</H3>);
      const heading = screen.getByText('Test Heading');
      expect(heading).toHaveClass('custom-class');
    });
  });

  describe('Text Component', () => {
    it('renders with default styles', () => {
      render(<Text>Test paragraph</Text>);
      const paragraph = screen.getByText('Test paragraph');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.tagName).toBe('P');
    });

    it('applies custom className', () => {
      render(<Text className="custom-class">Test paragraph</Text>);
      const paragraph = screen.getByText('Test paragraph');
      expect(paragraph).toHaveClass('custom-class');
    });
  });

  describe('Small Component', () => {
    it('renders with default styles', () => {
      render(<Small>Test small text</Small>);
      const small = screen.getByText('Test small text');
      expect(small).toBeInTheDocument();
      expect(small.tagName).toBe('P');
    });

    it('applies custom className', () => {
      render(<Small className="custom-class">Test small text</Small>);
      const small = screen.getByText('Test small text');
      expect(small).toHaveClass('custom-class');
    });
  });
});
