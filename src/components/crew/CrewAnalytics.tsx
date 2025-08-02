'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Eye,
  Users,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Camera,
  Video,
  ExternalLink,
  Download,
} from 'lucide-react';
import type { CrewMember } from '@/types';
import { crewPortfolioService, type CrewWork } from '@/services/crew-portfolio';

interface CrewAnalyticsProps {
  crewMember: CrewMember;
}

interface AnalyticsData {
  totalViews: number;
  totalProjects: number;
  averageRating: number;
  totalWorks: number;
  completedProjects: number;
  inProgressProjects: number;
  topCategories: Array<{ category: string; count: number }>;
  monthlyViews: Array<{ month: string; views: number }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  recentActivity: Array<{ date: string; action: string; project: string }>;
}

// Mock analytics data - in a real implementation, this would come from analytics service
const mockAnalyticsData: AnalyticsData = {
  totalViews: 1247,
  totalProjects: 23,
  averageRating: 4.8,
  totalWorks: 156,
  completedProjects: 18,
  inProgressProjects: 5,
  topCategories: [
    { category: 'Casamientos', count: 8 },
    { category: 'Corporativos', count: 6 },
    { category: 'Moda', count: 4 },
    { category: 'Culturales', count: 3 },
    { category: 'Producto', count: 2 },
  ],
  monthlyViews: [
    { month: 'Ene', views: 120 },
    { month: 'Feb', views: 145 },
    { month: 'Mar', views: 180 },
    { month: 'Abr', views: 165 },
    { month: 'May', views: 200 },
    { month: 'Jun', views: 235 },
    { month: 'Jul', views: 202 },
  ],
  categoryDistribution: [
    { name: 'Casamientos', value: 35, color: 'var(--primary)' },
    { name: 'Corporativos', value: 25, color: 'var(--muted-foreground)' },
    { name: 'Moda', value: 20, color: 'var(--secondary)' },
    { name: 'Culturales', value: 15, color: 'var(--accent)' },
    { name: 'Producto', value: 5, color: 'var(--destructive)' },
  ],
  recentActivity: [
    {
      date: '2024-01-15',
      action: 'Proyecto completado',
      project: 'Boda María y Juan',
    },
    {
      date: '2024-01-12',
      action: 'Nuevo proyecto asignado',
      project: 'Evento Corporativo TechCorp',
    },
    {
      date: '2024-01-10',
      action: 'Portfolio actualizado',
      project: 'Sesión de Moda',
    },
    {
      date: '2024-01-08',
      action: 'Cliente contactó',
      project: 'Boda en Viña del Mar',
    },
    {
      date: '2024-01-05',
      action: 'Proyecto entregado',
      project: 'Evento Cultural',
    },
  ],
};

export default function CrewAnalytics({ crewMember }: CrewAnalyticsProps) {
  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsData>(mockAnalyticsData);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>(
    'month'
  );

  useEffect(() => {
    // In a real implementation, this would fetch analytics data from the service
    loadAnalyticsData();
  }, [crewMember.id, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // TODO: Implement real analytics service call
      // const data = await analyticsService.getCrewMemberAnalytics(crewMember.id, timeRange);
      // setAnalyticsData(data);

      // For now, use mock data
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    // TODO: Implement analytics export functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Analytics de {crewMember.name.es}
          </h2>
          <p className="text-muted-foreground">
            Métricas de rendimiento y engagement del portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vistas Totales
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.totalViews.toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Proyectos Totales
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.totalProjects}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rating Promedio
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.averageRating}/5
                </p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trabajos Totales
                </p>
                <p className="text-2xl font-bold">{analyticsData.totalWorks}</p>
              </div>
              <Camera className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vistas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="var(--primary)"
                  dataKey="value"
                >
                  {analyticsData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--primary)" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completados</span>
                <span className="text-lg font-bold text-primary">
                  {analyticsData.completedProjects}
                </span>
              </div>
              <Progress
                value={
                  (analyticsData.completedProjects /
                    analyticsData.totalProjects) *
                  100
                }
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">En Progreso</span>
                <span className="text-lg font-bold text-primary">
                  {analyticsData.inProgressProjects}
                </span>
              </div>
              <Progress
                value={
                  (analyticsData.inProgressProjects /
                    analyticsData.totalProjects) *
                  100
                }
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pendientes</span>
                <span className="text-lg font-bold text-muted-foreground">
                  {analyticsData.totalProjects -
                    analyticsData.completedProjects -
                    analyticsData.inProgressProjects}
                </span>
              </div>
              <Progress
                value={
                  ((analyticsData.totalProjects -
                    analyticsData.completedProjects -
                    analyticsData.inProgressProjects) /
                    analyticsData.totalProjects) *
                  100
                }
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías Principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topCategories.map((category, index) => (
              <div
                key={category.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {category.count} proyectos
                  </span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(category.count / Math.max(...analyticsData.topCategories.map(c => c.count))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.project}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
