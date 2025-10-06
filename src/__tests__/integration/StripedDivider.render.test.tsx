import { render, screen } from '@testing-library/react';
import React from 'react';
import { StripedDivider } from '@/components/shared/StripedDivider';

describe('StripedDivider', () => {
  test('renders with expected structure', () => {
    render(<StripedDivider />);
    const dividers = screen.getAllByRole('generic');
    // Should render container + inner gradient element
    expect(dividers.length).toBeGreaterThanOrEqual(2);
  });
});
