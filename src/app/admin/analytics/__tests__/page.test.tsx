import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsDashboardPage from '../page';
import { getAnalyticsSummaries } from '@/services/analytics-data';

// Mock Firebase Timestamp
jest.mock('firebase/firestore', () => ({
  Timestamp: {
    now: jest.fn(() => ({
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
      toDate: () => new Date(),
      toMillis: () => Date.now(),
    })),
    fromDate: jest.fn((date: Date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
      toDate: () => date,
      toMillis: () => date.getTime(),
    })),
    fromMillis: jest.fn((millis: number) => ({
      seconds: Math.floor(millis / 1000),
      nanoseconds: 0,
      toDate: () => new Date(millis),
      toMillis: () => millis,
    })),
  },
}));

const { Timestamp } = require('firebase/firestore');

// Mock the analytics data service
jest.mock('@/services/analytics-data', () => ({
  getAnalyticsSummaries: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/admin/analytics'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock AdminLayout - render children in a div
jest.mock('@/components/admin/AdminLayout', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, title }: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'admin-layout', 'data-title': title },
        children
      ),
  };
});

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { email: 'admin@test.com' },
    loading: false,
  })),
}));

// Mock admin-auth
jest.mock('@/lib/admin-auth', () => ({
  checkAdminStatus: jest.fn().mockResolvedValue(true),
}));

// Mock AuthGuard - make it render children directly (bypass auth check)
jest.mock('@/components/admin/AuthGuard', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children }: any) => {
      // In tests, always render children (bypass auth)
      return React.createElement(
        'div',
        { 'data-testid': 'auth-guard' },
        children
      );
    },
  };
});

// Mock other admin components
jest.mock('@/components/admin/ProjectAnalytics', () => ({
  __esModule: true,
  default: () => <div data-testid="project-analytics">Project Analytics</div>,
}));

// CrewAnalytics may not exist - only mock if it's imported

// Mock UI components
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
  CardDescription: ({ children }: any) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <svg data-testid="calendar-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
}));

// Mock metric cards - they receive a `data` prop
jest.mock('@/components/admin/MetricCard', () => ({
  MetricCardGrid: ({ children, className }: any) => (
    <div data-testid="metric-card-grid" className={className}>
      {children}
    </div>
  ),
  ViewsMetricCard: ({ data, isLoading }: any) => (
    <div data-testid="views-metric-card">
      {isLoading ? 'Loading...' : `Views: ${data?.totalViews ?? 0}`}
    </div>
  ),
  VisitorsMetricCard: ({ data, isLoading }: any) => (
    <div data-testid="visitors-metric-card">
      {isLoading ? 'Loading...' : `Visitors: ${data?.uniqueVisitors ?? 0}`}
    </div>
  ),
  TimeOnPageMetricCard: ({ data, isLoading }: any) => (
    <div data-testid="time-metric-card">
      {isLoading ? 'Loading...' : `Time: ${data?.avgTimeOnPage ?? 0}s`}
    </div>
  ),
  CtaClicksMetricCard: ({ data, isLoading }: any) => (
    <div data-testid="cta-metric-card">
      {isLoading ? 'Loading...' : `CTA Clicks: ${data?.ctaClicks ?? 0}`}
    </div>
  ),
  MediaInteractionsMetricCard: ({ data, isLoading }: any) => (
    <div data-testid="media-metric-card">
      {isLoading
        ? 'Loading...'
        : `Media Interactions: ${data?.mediaInteractions ?? 0}`}
    </div>
  ),
  CrewInteractionsMetricCard: ({ data, isLoading }: any) => (
    <div data-testid="crew-metric-card">
      {isLoading
        ? 'Loading...'
        : `Crew Interactions: ${data?.crewInteractions ?? 0}`}
    </div>
  ),
  MediaInteractionBreakdownCard: () => (
    <div data-testid="media-breakdown-card">Media Breakdown</div>
  ),
  DeviceBreakdownCard: () => (
    <div data-testid="device-breakdown-card">Device Breakdown</div>
  ),
}));

// Mock analytics service
jest.mock('@/lib/analytics', () => ({
  analyticsService: {
    getCrewAnalyticsSummary: jest.fn().mockResolvedValue({
      totalCrewMembers: 0,
      averageProfileViews: 0,
      topPerformingCrew: [],
      categoryPopularity: [],
      overallEngagement: {
        totalProfileViews: 0,
        totalPortfolioViews: 0,
        totalInquiries: 0,
        averageResponseTime: 0,
      },
    }),
  },
}));

const mockGetAnalyticsSummaries = getAnalyticsSummaries as jest.MockedFunction<
  typeof getAnalyticsSummaries
>;

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analytics dashboard with title and description', () => {
    mockGetAnalyticsSummaries.mockResolvedValue([]);

    render(<AnalyticsDashboardPage />);

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText(/Monitorea el rendimiento de tus proyectos/)
    ).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockGetAnalyticsSummaries.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AnalyticsDashboardPage />);

    expect(screen.getAllByText('Loading...')).toHaveLength(6); // 6 metric cards
  });

  it('displays metrics cards with data after loading', async () => {
    const mockSummaries = [
      {
        date: '2025-01-08',
        totalViews: 1000,
        uniqueVisitors: 500,
        avgTimeOnPage: 120,
        ctaClicks: 50,
        mediaInteractions: 200,
        crewInteractions: 30,
        scrollDepth25: 800,
        scrollDepth50: 600,
        scrollDepth75: 400,
        scrollDepth100: 200,
        deviceBreakdown: { desktop: 600, mobile: 300, tablet: 100 },
        languageBreakdown: { es: 800, en: 150, pt: 50 },
        lastUpdated: Timestamp.now(),
      },
    ];

    mockGetAnalyticsSummaries.mockResolvedValue(mockSummaries);

    render(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Views: 1000')).toBeInTheDocument();
      expect(screen.getByText('Visitors: 500')).toBeInTheDocument();
      expect(screen.getByText('Time: 120s')).toBeInTheDocument();
      expect(screen.getByText('CTA Clicks: 50')).toBeInTheDocument();
      expect(screen.getByText('Media Interactions: 200')).toBeInTheDocument();
      expect(screen.getByText('Crew Interactions: 30')).toBeInTheDocument();
    });
  });

  it('shows error state when data loading fails', async () => {
    mockGetAnalyticsSummaries.mockRejectedValue(
      new Error('Failed to load data')
    );

    render(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error al cargar datos de analytics/)
      ).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('allows retrying after error', async () => {
    mockGetAnalyticsSummaries
      .mockRejectedValueOnce(new Error('Failed to load data'))
      .mockResolvedValueOnce([]);

    render(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error al cargar datos de analytics/)
      ).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Reintentar');
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(mockGetAnalyticsSummaries).toHaveBeenCalledTimes(2);
    });
  });

  it('displays date range selector buttons', () => {
    mockGetAnalyticsSummaries.mockResolvedValue([]);

    render(<AnalyticsDashboardPage />);

    expect(screen.getByText('7 días')).toBeInTheDocument();
    expect(screen.getByText('30 días')).toBeInTheDocument();
    expect(screen.getByText('90 días')).toBeInTheDocument();
  });

  it('changes date range when buttons are clicked', async () => {
    mockGetAnalyticsSummaries.mockResolvedValue([]);

    render(<AnalyticsDashboardPage />);

    const thirtyDaysButton = screen.getByText('30 días');
    await userEvent.click(thirtyDaysButton);

    await waitFor(() => {
      expect(mockGetAnalyticsSummaries).toHaveBeenCalledWith('daily', 30);
    });
  });

  it('displays analytics tabs', () => {
    mockGetAnalyticsSummaries.mockResolvedValue([]);

    render(<AnalyticsDashboardPage />);

    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Conversiones')).toBeInTheDocument();
  });

  it('shows placeholder content in tabs', async () => {
    mockGetAnalyticsSummaries.mockResolvedValue([]);

    render(<AnalyticsDashboardPage />);

    // Wait for the component to load and then check for tab content
    await waitFor(() => {
      expect(screen.getByText('Resumen General')).toBeInTheDocument();
    });

    // The other tab content might not be visible by default, so we'll just check the overview tab
    expect(
      screen.getByText('Vista general del rendimiento de analytics')
    ).toBeInTheDocument();
  });

  it('aggregates metrics from multiple summaries', async () => {
    const mockSummaries = [
      {
        date: '2025-01-08',
        totalViews: 1000,
        uniqueVisitors: 500,
        avgTimeOnPage: 120,
        ctaClicks: 50,
        mediaInteractions: 200,
        crewInteractions: 30,
        scrollDepth25: 800,
        scrollDepth50: 600,
        scrollDepth75: 400,
        scrollDepth100: 200,
        deviceBreakdown: { desktop: 600, mobile: 300, tablet: 100 },
        languageBreakdown: { es: 800, en: 150, pt: 50 },
        lastUpdated: Timestamp.now(),
      },
      {
        date: '2025-01-07',
        totalViews: 800,
        uniqueVisitors: 400,
        avgTimeOnPage: 90,
        ctaClicks: 30,
        mediaInteractions: 150,
        crewInteractions: 20,
        scrollDepth25: 600,
        scrollDepth50: 400,
        scrollDepth75: 300,
        scrollDepth100: 150,
        deviceBreakdown: { desktop: 500, mobile: 250, tablet: 50 },
        languageBreakdown: { es: 600, en: 120, pt: 80 },
        lastUpdated: Timestamp.now(),
      },
    ];

    mockGetAnalyticsSummaries.mockResolvedValue(mockSummaries);

    render(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Views: 1800')).toBeInTheDocument();
      expect(screen.getByText('Visitors: 900')).toBeInTheDocument();
      expect(screen.getByText('Time: 105s')).toBeInTheDocument();
      expect(screen.getByText('CTA Clicks: 80')).toBeInTheDocument();
      expect(screen.getByText('Media Interactions: 350')).toBeInTheDocument();
      expect(screen.getByText('Crew Interactions: 50')).toBeInTheDocument();
    });
  });
});
