'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
  MetricCardGrid,
  ViewsMetricCard,
  VisitorsMetricCard,
  TimeOnPageMetricCard,
  CtaClicksMetricCard,
  MediaInteractionsMetricCard,
  CrewInteractionsMetricCard,
} from '@/components/admin/MetricCard';

interface DashboardMetrics {
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  ctaClicks: number;
  mediaInteractions: number;
  crewInteractions: number;
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
  });
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, custom
  const [summaries, setSummaries] = useState<AnalyticsSummary[]>([]);
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

      // Aggregate metrics
      const aggregatedMetrics: DashboardMetrics = {
        totalViews: 0,
        uniqueVisitors: 0,
        averageTimeOnPage: 0,
        ctaClicks: 0,
        mediaInteractions: 0,
        crewInteractions: 0,
      };

      let totalTime = 0;
      let summaryCount = 0;

      summaries.forEach(summary => {
        aggregatedMetrics.totalViews += summary.totalViews;
        aggregatedMetrics.uniqueVisitors += summary.uniqueVisitors;
        aggregatedMetrics.ctaClicks += summary.ctaClicks;
        aggregatedMetrics.mediaInteractions += summary.mediaInteractions;
        aggregatedMetrics.crewInteractions += summary.crewInteractions;

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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadAnalyticsData}>Reintentar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
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
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            Última actualización: {lastUpdated.toLocaleString('es-ES')}
          </p>
        )}
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(range => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
                disabled={isLoading}
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
      <MetricCardGrid className="mb-8">
        <ViewsMetricCard
          value={metrics.totalViews}
          isLoading={isLoading}
          trend={{
            value: 20.1,
            isPositive: true,
            period: 'desde el mes pasado',
          }}
        />
        <VisitorsMetricCard
          value={metrics.uniqueVisitors}
          isLoading={isLoading}
          trend={{
            value: 15.3,
            isPositive: true,
            period: 'desde el mes pasado',
          }}
        />
        <TimeOnPageMetricCard
          value={metrics.averageTimeOnPage}
          isLoading={isLoading}
          trend={{
            value: 5.2,
            isPositive: true,
            period: 'desde el mes pasado',
          }}
        />
        <CtaClicksMetricCard
          value={metrics.ctaClicks}
          isLoading={isLoading}
          trend={{
            value: 12.7,
            isPositive: true,
            period: 'desde el mes pasado',
          }}
        />
        <MediaInteractionsMetricCard
          value={metrics.mediaInteractions}
          isLoading={isLoading}
          trend={{
            value: 8.9,
            isPositive: true,
            period: 'desde el mes pasado',
          }}
        />
        <CrewInteractionsMetricCard
          value={metrics.crewInteractions}
          isLoading={isLoading}
          trend={{
            value: 3.4,
            isPositive: true,
            period: 'desde el mes pasado',
          }}
        />
      </MetricCardGrid>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversiones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen General</CardTitle>
              <CardDescription>
                Vista general del rendimiento de analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaries.length === 0 ? (
                <p className="text-muted-foreground">
                  No hay datos de analytics disponibles para el período
                  seleccionado.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
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
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">
                            Distribución por idioma
                          </h4>
                          <ul className="text-sm text-muted-foreground">
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
                        <div className="mt-4 text-red-600 text-xs">
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

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Proyecto</CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento de cada proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La tabla de proyectos con métricas detalladas se implementará
                próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Engagement</CardTitle>
              <CardDescription>
                Profundidad de scroll, tiempo en página, y interacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Los gráficos de engagement se implementarán próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Conversiones</CardTitle>
              <CardDescription>
                Tasa de conversión y análisis de leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Los análisis de conversión se implementarán próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
