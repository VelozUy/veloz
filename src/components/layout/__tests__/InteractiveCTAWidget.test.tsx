import { render, fireEvent } from '@testing-library/react';
import { InteractiveCTAWidget } from '../InteractiveCTAWidget';

// Mock useAnalytics hook
const mockTrackCTAInteraction = jest.fn();
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackCTAInteraction: mockTrackCTAInteraction,
  }),
}));

describe('InteractiveCTAWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls trackCTAInteraction when sticky button is clicked', () => {
    const { getByRole } = render(<InteractiveCTAWidget />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(mockTrackCTAInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'widget',
        ctaType: 'contact_form',
        ctaLocation: 'sticky_button',
      })
    );
  });
}); 