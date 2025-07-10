import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsDashboardPage from '../page';
import { getAnalyticsSummaries } from '@/services/analytics-data';
import { Timestamp } from 'firebase/firestore';

// Mock the analytics data service
jest.mock('@/services/analytics-data', () => ({
  getAnalyticsSummaries: jest.fn(),
}));

// Mock the metric card components
jest.mock('@/components/admin/MetricCard', () => ({
  MetricCardGrid: ({ children, className }: any) => (
    <div data-testid="metric-card-grid" className={className}>
      {children}
    </div>
  ),
  ViewsMetricCard: ({ value, isLoading, trend }: any) => (
    <div data-testid="views-metric-card">
      {isLoading ? 'Loading...' : `Views: ${value}`}
      {trend && <span data-testid="trend">{trend.value}%</span>}
    </div>
  ),
  VisitorsMetricCard: ({ value, isLoading, trend }: any) => (
    <div data-testid="visitors-metric-card">
      {isLoading ? 'Loading...' : `Visitors: ${value}`}
      {trend && <span data-testid="trend">{trend.value}%</span>}
    </div>
  ),
  TimeOnPageMetricCard: ({ value, isLoading, trend }: any) => (
    <div data-testid="time-metric-card">
      {isLoading ? 'Loading...' : `Time: ${value}s`}
      {trend && <span data-testid="trend">{trend.value}%</span>}
    </div>
  ),
  CtaClicksMetricCard: ({ value, isLoading, trend }: any) => (
    <div data-testid="cta-metric-card">
      {isLoading ? 'Loading...' : `CTA Clicks: ${value}`}
      {trend && <span data-testid="trend">{trend.value}%</span>}
    </div>
  ),
  MediaInteractionsMetricCard: ({ value, isLoading, trend }: any) => (
    <div data-testid="media-metric-card">
      {isLoading ? 'Loading...' : `Media Interactions: ${value}`}
      {trend && <span data-testid="trend">{trend.value}%</span>}
    </div>
  ),
  CrewInteractionsMetricCard: ({ value, isLoading, trend }: any) => (
    <div data-testid="crew-metric-card">
      {isLoading ? 'Loading...' : `Crew Interactions: ${value}`}
      {trend && <span data-testid="trend">{trend.value}%</span>}
    </div>
  ),
}));

const mockGetAnalyticsSummaries = getAnalyticsSummaries as jest.MockedFunction<typeof getAnalyticsSummaries>;

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analytics dashboard with title and description', () => {
    mockGetAnalyticsSummaries.mockResolvedValue([]);
    
    render(<AnalyticsDashboardPage />);
    
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Monitorea el rendimiento de tus proyectos/)).toBeInTheDocument();
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
        averageTimeOnPage: 120,
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
    mockGetAnalyticsSummaries.mockRejectedValue(new Error('Failed to load data'));
    
    render(<AnalyticsDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos de analytics')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('allows retrying after error', async () => {
    mockGetAnalyticsSummaries
      .mockRejectedValueOnce(new Error('Failed to load data'))
      .mockResolvedValueOnce([]);
    
    render(<AnalyticsDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos de analytics')).toBeInTheDocument();
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
      expect(mockGetAnalyticsSummaries).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
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
    expect(screen.getByText('Vista general del rendimiento de analytics')).toBeInTheDocument();
  });

  it('aggregates metrics from multiple summaries', async () => {
    const mockSummaries = [
      {
        date: '2025-01-08',
        totalViews: 1000,
        uniqueVisitors: 500,
        averageTimeOnPage: 120,
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
        averageTimeOnPage: 90,
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