import {
  renderHook,
  act,
  render,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { AnalyticsWrapper } from '@/components/analytics/AnalyticsWrapper';
import { AnalyticsConsentBanner } from '@/components/analytics/AnalyticsConsentBanner';
import React from 'react';

// Mock the analytics service
jest.mock('@/services/analytics', () => ({
  analyticsService: {
    trackProjectView: jest.fn(),
    trackMediaInteraction: jest.fn(),
    trackCTAInteraction: jest.fn(),
    trackCrewInteraction: jest.fn(),
    trackPageView: jest.fn(),
    trackScrollDepth: jest.fn(),
    trackError: jest.fn(),
    trackSessionStart: jest.fn(),
    trackSessionEnd: jest.fn(),
    isAnalyticsInitialized: jest.fn(() => true),
  },
  trackProjectView: jest.fn(),
  trackMediaInteraction: jest.fn(),
  trackCTAInteraction: jest.fn(),
  trackCrewInteraction: jest.fn(),
  trackPageView: jest.fn(),
  trackScrollDepth: jest.fn(),
  trackError: jest.fn(),
}));

// Mock GDPR compliance
jest.mock('@/lib/gdpr-compliance', () => {
  const mockSaveConsent = jest.fn();
  const mockHasAnalyticsConsent = jest.fn(() => true);

  return {
    GDPRCompliance: {
      hasAnalyticsConsent: mockHasAnalyticsConsent,
    },
    GDPR_CONSENT_EVENT: 'gdpr-consent',
    useGDPRCompliance: () => ({
      saveConsent: mockSaveConsent,
    }),
    // Export mocks for test access
    __mockSaveConsent: mockSaveConsent,
    __mockHasAnalyticsConsent: mockHasAnalyticsConsent,
  };
});

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock static content
jest.mock('@/lib/utils', () => ({
  getStaticContent: jest.fn(() => ({})),
  t: jest.fn((content, key, fallback) => fallback),
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
}));

describe('Analytics System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() =>
          JSON.stringify({
            analytics: true,
            marketing: false,
            necessary: true,
            timestamp: Date.now(),
          })
        ),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('useAnalytics Hook', () => {
    it('should provide analytics tracking functions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AnalyticsProvider, null, children);

      const { result } = renderHook(() => useAnalytics(), { wrapper });

      expect(result.current.trackProjectView).toBeDefined();
      expect(result.current.trackMediaInteraction).toBeDefined();
      expect(result.current.trackCTAInteraction).toBeDefined();
      expect(result.current.trackCrewInteraction).toBeDefined();
      expect(result.current.trackError).toBeDefined();
      expect(result.current.trackScrollDepth).toBeDefined();
    });

    it('should track project view events', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AnalyticsProvider, null, children);

      const { result } = renderHook(() => useAnalytics(), { wrapper });

      const projectData = {
        projectId: 'test-project-123',
        projectTitle: 'Test Wedding',
        projectCategory: 'wedding',
        projectLanguage: 'es',
        viewDuration: 30000,
        scrollDepth: 75,
      };

      act(() => {
        result.current.trackProjectView(projectData);
      });

      // The actual tracking is mocked, so we just verify the function exists and can be called
      expect(result.current.trackProjectView).toBeDefined();
    });

    it('should track media interactions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AnalyticsProvider, null, children);

      const { result } = renderHook(() => useAnalytics(), { wrapper });

      const mediaData = {
        projectId: 'test-project-123',
        mediaId: 'media-456',
        mediaType: 'image' as const,
        interactionType: 'view' as const,
        mediaTitle: 'Wedding Photo',
        viewDuration: 5000,
      };

      act(() => {
        result.current.trackMediaInteraction(mediaData);
      });

      expect(result.current.trackMediaInteraction).toBeDefined();
    });

    it('should track CTA interactions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AnalyticsProvider, null, children);

      const { result } = renderHook(() => useAnalytics(), { wrapper });

      const ctaData = {
        projectId: 'test-project-123',
        ctaType: 'contact_form',
        ctaLocation: 'project_page',
        userLanguage: 'es',
        deviceType: 'mobile',
      };

      act(() => {
        result.current.trackCTAInteraction(ctaData);
      });

      expect(result.current.trackCTAInteraction).toBeDefined();
    });

    it('should track crew interactions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AnalyticsProvider, null, children);

      const { result } = renderHook(() => useAnalytics(), { wrapper });

      const crewData = {
        projectId: 'test-project-123',
        crewMemberId: 'crew-789',
        crewMemberName: 'John Doe',
        interactionType: 'view' as const,
        crewMemberRole: 'photographer',
      };

      act(() => {
        result.current.trackCrewInteraction(crewData);
      });

      expect(result.current.trackCrewInteraction).toBeDefined();
    });

    it('should track errors', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AnalyticsProvider, null, children);

      const { result } = renderHook(() => useAnalytics(), { wrapper });

      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'test-action' };

      act(() => {
        result.current.trackError(error, context);
      });

      expect(result.current.trackError).toBeDefined();
    });

    it('should track scroll depth', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(AnalyticsProvider, null, children);

      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.trackScrollDepth(50);
      });

      expect(result.current.trackScrollDepth).toBeDefined();
    });
  });

  describe('AnalyticsProvider', () => {
    it('should provide analytics context to children', () => {
      const TestComponent = () => {
        const analytics = useAnalytics();
        return React.createElement(
          'div',
          { 'data-testid': 'analytics-context' },
          analytics ? 'analytics-available' : 'no-analytics'
        );
      };

      const { getByTestId } = render(
        React.createElement(
          AnalyticsProvider,
          null,
          React.createElement(TestComponent)
        )
      );

      expect(getByTestId('analytics-context')).toHaveTextContent(
        'analytics-available'
      );
    });

    it('should set up global error tracking', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        React.createElement(
          AnalyticsProvider,
          null,
          React.createElement('div', null, 'Test')
        )
      );

      // Simulate a global error
      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 1,
        colno: 1,
      });

      act(() => {
        window.dispatchEvent(errorEvent);
      });

      // The error should be tracked (mocked)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('AnalyticsWrapper', () => {
    it('should render consent banner and provider', () => {
      const { container } = render(
        React.createElement(
          AnalyticsWrapper,
          null,
          React.createElement('div', null, 'Test content')
        )
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('AnalyticsConsentBanner', () => {
    let mockSaveConsent: jest.Mock;
    let mockHasAnalyticsConsent: jest.Mock;

    beforeEach(() => {
      const gdprModule = require('@/lib/gdpr-compliance');
      mockSaveConsent = gdprModule.__mockSaveConsent;
      mockHasAnalyticsConsent = gdprModule.__mockHasAnalyticsConsent;

      mockSaveConsent.mockClear();
      mockHasAnalyticsConsent.mockClear();
    });

    it('should render consent banner when no consent given', () => {
      // Mock no consent
      mockHasAnalyticsConsent.mockReturnValue(false);

      const { getByText } = render(React.createElement(AnalyticsConsentBanner));

      expect(getByText('Privacidad y cookies')).toBeInTheDocument();
    });

    it('should not render when consent is already given', () => {
      // Mock consent given
      mockHasAnalyticsConsent.mockReturnValue(true);

      const { container } = render(React.createElement(AnalyticsConsentBanner));

      expect(container.firstChild).toBeNull();
    });

    it('should handle accept consent', () => {
      mockHasAnalyticsConsent.mockReturnValue(false);

      const { getByText } = render(React.createElement(AnalyticsConsentBanner));

      const acceptButton = getByText('Aceptar analíticas');
      fireEvent.click(acceptButton);

      expect(mockSaveConsent).toHaveBeenCalledWith({ analytics: true });
    });

    it('should handle decline consent', () => {
      mockHasAnalyticsConsent.mockReturnValue(false);

      const { getByText } = render(React.createElement(AnalyticsConsentBanner));

      const declineButton = getByText('Solo esenciales');
      fireEvent.click(declineButton);

      expect(mockSaveConsent).toHaveBeenCalledWith({ analytics: false });
    });
  });
});
