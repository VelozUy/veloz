'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AuthGuard from '@/components/admin/AuthGuard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';
import { getAnalyticsSummaries } from '@/services/analytics-data';
import type { AnalyticsSummary } from '@/services/analytics-data';
import { analyticsService } from '@/lib/analytics';
import type { CrewAnalyticsSummary } from '@/lib/analytics';
import { 
  MetricCardGrid,
  ViewsMetricCard,
  VisitorsMetricCard,
  TimeOnPageMetricCard,
  CtaClicksMetricCard,
  MediaInteractionsMetricCard,
  CrewInteractionsMetricCard,
  MediaInteractionBreakdownCard,
  DeviceBreakdownCard,
} from '@/components/admin/MetricCard';
import ProjectAnalytics from '@/components/admin/ProjectAnalytics';

interface DashboardMetrics {
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  ctaClicks: number;
  mediaInteractions: number;
  crewInteractions: number;
  mediaInteractionBreakdown: {
    views: number;
    plays: number;
    pauses: number;
    completes: number;
    zooms: number;
  };
  deviceBreakdown: Record<string, number>;
}

export default function AnalyticsDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalViews: 0,
    uniqueVisitors: 0,
    averageTimeOnPage: 0,
    ctaClicks: 0,
    mediaInteractions: 0,
    crewInteractions: 0,
    mediaInteractionBreakdown: {
      views: 0,
      plays: 0,
      pauses: 0,
      completes: 0,
      zooms: 0,
    },
    deviceBreakdown: {},
  });
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, custom
  const [summaries, setSummaries] = useState<AnalyticsSummary[]>([]);
  const [crewAnalytics, setCrewAnalytics] =
    useState<CrewAnalyticsSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range
      const startDate = new Date();

      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Get analytics summaries for the date range
      const summaries = await getAnalyticsSummaries(
        'daily',
        dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      );
      setSummaries(summaries);

      // Get crew analytics
      const crewAnalyticsData =
        await analyticsService.getCrewAnalyticsSummary();
      setCrewAnalytics(crewAnalyticsData);

      // Aggregate metrics
      const aggregatedMetrics: DashboardMetrics = {
        totalViews: 0,
        uniqueVisitors: 0,
        averageTimeOnPage: 0,
        ctaClicks: 0,
        mediaInteractions: 0,
        crewInteractions: 0,
        mediaInteractionBreakdown: {
          views: 0,
          plays: 0,
          pauses: 0,
          completes: 0,
          zooms: 0,
        },
        deviceBreakdown: {},
      };

      let totalTime = 0;
      let summaryCount = 0;

      summaries.forEach(summary => {
        aggregatedMetrics.totalViews += summary.totalViews;
        aggregatedMetrics.uniqueVisitors += summary.uniqueVisitors;
        aggregatedMetrics.ctaClicks += summary.ctaClicks;
        aggregatedMetrics.mediaInteractions += summary.mediaInteractions;
        aggregatedMetrics.crewInteractions += summary.crewInteractions;

        // Aggregate media interaction breakdown
        if (summary.mediaInteractionBreakdown) {
          aggregatedMetrics.mediaInteractionBreakdown.views +=
            summary.mediaInteractionBreakdown.views;
          aggregatedMetrics.mediaInteractionBreakdown.plays +=
            summary.mediaInteractionBreakdown.plays;
          aggregatedMetrics.mediaInteractionBreakdown.pauses +=
            summary.mediaInteractionBreakdown.pauses;
          aggregatedMetrics.mediaInteractionBreakdown.completes +=
            summary.mediaInteractionBreakdown.completes;
          aggregatedMetrics.mediaInteractionBreakdown.zooms +=
            summary.mediaInteractionBreakdown.zooms;
        }

        // Aggregate device breakdown
        if (summary.deviceBreakdown) {
          Object.entries(summary.deviceBreakdown).forEach(
            ([deviceType, count]) => {
              aggregatedMetrics.deviceBreakdown[deviceType] =
                (aggregatedMetrics.deviceBreakdown[deviceType] || 0) + count;
            }
          );
        }

        totalTime += summary.avgTimeOnPage;
        summaryCount++;
      });

      if (summaryCount > 0) {
        aggregatedMetrics.averageTimeOnPage = Math.round(
          totalTime / summaryCount
        );
      }

      setMetrics(aggregatedMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError(
        'Error al cargar datos de analytics. Verifica tu conexión e intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-48">
          <Card className="w-full max-w-md">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-destructive mb-3 text-sm">{error}</p>
                <Button onClick={loadAnalyticsData} size="sm">
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout title="Analytics">
        <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Monitorea el rendimiento de tus proyectos y la engagement de los
              usuarios
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-3 w-3 mr-1.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Última actualización: {lastUpdated.toLocaleString('es-ES')}
          </p>
        )}
      </div>

      {/* Date Range Selector */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1.5">
            {['7d', '30d', '90d'].map(range => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
                disabled={isLoading}
                className="text-xs"
              >
                {range === '7d'
                  ? '7 días'
                  : range === '30d'
                    ? '30 días'
                    : '90 días'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mb-6">
        <MetricCardGrid>
          <ViewsMetricCard
            data={{
              totalViews: metrics.totalViews,
              viewsChange: 20.1,
              viewsProgress: 75,
            }}
          />
          <VisitorsMetricCard
            data={{
              uniqueVisitors: metrics.uniqueVisitors,
              visitorsChange: 15.3,
              visitorsProgress: 80,
            }}
          />
          <TimeOnPageMetricCard
            data={{
              avgTimeOnPage: metrics.averageTimeOnPage,
              timeChange: 5.2,
              timeTrend: 5.2,
            }}
          />
          <CtaClicksMetricCard
            data={{
              ctaClicks: metrics.ctaClicks,
              ctaChange: 12.7,
              ctaProgress: 65,
            }}
          />
          <MediaInteractionsMetricCard
            data={{
              mediaInteractions: metrics.mediaInteractions,
              mediaChange: 8.9,
              mediaTrend: 8.9,
            }}
          />
          <CrewInteractionsMetricCard
            data={{
              crewInteractions: metrics.crewInteractions,
              crewChange: 3.4,
              crewTrend: 3.4,
            }}
          />
          <MediaInteractionBreakdownCard
            data={{
              mediaInteractionBreakdown: metrics.mediaInteractionBreakdown,
            }}
          />
          <DeviceBreakdownCard
            data={{
              deviceBreakdown: metrics.deviceBreakdown,
            }}
          />
        </MetricCardGrid>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="text-xs">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs">
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="conversions" className="text-xs">
            Conversiones
          </TabsTrigger>
          <TabsTrigger value="crew" className="text-xs">
            Equipo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen General</CardTitle>
              <CardDescription className="text-sm">
                Vista general del rendimiento de analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {summaries.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay datos de analytics disponibles para el período
                  seleccionado.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Los gráficos detallados y análisis se implementarán
                    próximamente.
                  </p>
                  {/* Language Breakdown Display */}
                  {(() => {
                    if (
                      summaries.length > 0 &&
                      summaries[0].languageBreakdown &&
                      typeof summaries[0].languageBreakdown === 'object' &&
                      !Array.isArray(summaries[0].languageBreakdown) &&
                      Object.values(summaries[0].languageBreakdown).every(
                        v => typeof v === 'number'
                      )
                    ) {
                      return (
                        <div className="mt-3">
                          <h4 className="font-semibold mb-1.5 text-sm">
                            Distribución por idioma
                          </h4>
                          <ul className="text-xs text-muted-foreground">
                            {Object.entries(summaries[0].languageBreakdown).map(
                              ([lang, count]) => (
                                <li key={lang}>
                                  {lang.toUpperCase()}: {count}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      );
                    } else if (
                      summaries.length > 0 &&
                      summaries[0].languageBreakdown
                    ) {
                      if (typeof window !== 'undefined') {
                        console.warn(
                          'Malformed languageBreakdown:',
                          summaries[0].languageBreakdown
                        );
                      }
                      return (
                        <div className="mt-3 text-destructive text-xs">
                          <strong>Advertencia:</strong> Datos de idioma
                          malformados, no se puede mostrar la distribución.
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-3">
          <ProjectAnalytics showBusinessMetrics={true} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Métricas de Engagement</CardTitle>
              <CardDescription className="text-sm">
                Profundidad de scroll, tiempo en página, y interacciones
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm">
                Los gráficos de engagement se implementarán próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Análisis de Conversiones
              </CardTitle>
              <CardDescription className="text-sm">
                Tasa de conversión y análisis de leads
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm">
                Los análisis de conversión se implementarán próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Analytics del Equipo</CardTitle>
              <CardDescription className="text-sm">
                Rendimiento y engagement de los miembros del equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {crewAnalytics ? (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {crewAnalytics.totalCrewMembers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Miembros del Equipo
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {crewAnalytics.overallEngagement.totalProfileViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vistas de Perfiles
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {crewAnalytics.overallEngagement.totalPortfolioViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vistas de Portfolio
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {crewAnalytics.overallEngagement.totalInquiries}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Consultas Recibidas
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Crew */}
                  <div>
                    <h4 className="font-semibold mb-3">Mejores Rendimientos</h4>
                    <div className="space-y-2">
                      {crewAnalytics.topPerformingCrew.map((crew, index) => (
                        <div
                          key={crew.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{crew.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {crew.projectsCompleted} proyectos completados
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {crew.profileViews.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              vistas
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Popularity */}
                  <div>
                    <h4 className="font-semibold mb-3">
                      Popularidad por Categoría
                    </h4>
                    <div className="space-y-2">
                      {crewAnalytics.categoryPopularity.map(category => (
                        <div
                          key={category.category}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-none"
                        >
                          <div>
                            <div className="font-medium capitalize">
                              {category.category}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {category.crewMembers} miembros del equipo
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {category.totalViews.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              vistas
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Time */}
                  <div>
                    <h4 className="font-semibold mb-3">
                      Tiempo de Respuesta Promedio
                    </h4>
                    <div className="text-center p-4 bg-muted/50 rounded-none">
                      <div className="text-3xl font-bold text-primary">
                        {crewAnalytics.overallEngagement.averageResponseTime.toFixed(
                          1
                        )}
                        h
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Horas promedio de respuesta a consultas
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Cargando analytics del equipo...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
