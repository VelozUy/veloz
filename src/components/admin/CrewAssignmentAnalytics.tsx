'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  TrendingUp,
  Clock,
  Star,
  Target,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  crewAssignmentAnalyticsService,
  type CrewAssignmentAnalytics,
} from '@/services/crew-assignment-analytics';

export default function CrewAssignmentAnalytics() {
  const [analytics, setAnalytics] = useState<CrewAssignmentAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await crewAssignmentAnalyticsService.getCrewAssignmentAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Error al cargar los datos');
      }
    } catch (error) {
      console.error('Error loading crew assignment analytics:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando análisis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadAnalytics}>Reintentar</Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron datos de asignación de equipo.
        </p>
      </div>
    );
  }

  const { overallMetrics, categoryAnalysis, timeAnalysis } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Análisis de Asignación de Equipo
          </h2>
          <p className="text-muted-foreground">
            Métricas de efectividad y colaboración del equipo
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los períodos</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="quarter">Último trimestre</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Miembros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallMetrics.totalCrewMembers}
            </div>
            <p className="text-xs text-muted-foreground">Miembros del equipo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Asignaciones
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallMetrics.totalAssignments}
            </div>
            <p className="text-xs text-muted-foreground">Proyectos asignados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Éxito Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallMetrics.averageSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Proyectos completados exitosamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Duración Promedio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeAnalysis.averageProjectDuration.toFixed(1)} días
            </div>
            <p className="text-xs text-muted-foreground">Por proyecto</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Crew */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Mejores Miembros del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallMetrics.topPerformingCrew.map((crew, index) => (
              <div
                key={crew.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{crew.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {crew.projectsCompleted} proyectos completados
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {crew.successRate.toFixed(1)}%
                  </div>
                  <Progress value={crew.successRate} className="w-24 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Team Combinations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mejores Combinaciones de Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallMetrics.bestTeamCombinations
              .slice(0, 5)
              .map((team, index) => (
                <div
                  key={team.members.join('-')}
                  className="p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <span className="font-medium">
                        {team.projectsTogether} proyectos juntos
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {team.successRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {team.members.map(memberId => (
                      <Badge
                        key={memberId}
                        variant="outline"
                        className="text-xs"
                      >
                        {memberId}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Análisis por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryAnalysis.map(category => (
              <div key={category.category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">
                    {category.category}
                  </h4>
                  <Badge variant="secondary">
                    {category.totalProjects} proyectos
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tasa de éxito</span>
                    <span className="font-medium">
                      {category.averageSuccessRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={category.averageSuccessRate}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {category.preferredCrewMembers.length} miembros preferidos
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Análisis de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {timeAnalysis.onTimeDeliveryRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Entregas a tiempo</p>
              <CheckCircle className="w-8 h-8 text-primary mx-auto mt-2" />
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {timeAnalysis.averageProjectDuration.toFixed(1)} días
              </div>
              <p className="text-sm text-muted-foreground">Duración promedio</p>
              <Clock className="w-8 h-8 text-primary mx-auto mt-2" />
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {timeAnalysis.efficiencyTrends[
                  timeAnalysis.efficiencyTrends.length - 1
                ]?.efficiencyScore.toFixed(1)}
                %
              </div>
              <p className="text-sm text-muted-foreground">Eficiencia actual</p>
              <TrendingUp className="w-8 h-8 text-primary mx-auto mt-2" />
            </div>
          </div>

          {/* Efficiency Trends */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Tendencias de Eficiencia</h4>
            <div className="flex items-end gap-2 h-32">
              {timeAnalysis.efficiencyTrends.slice(-6).map((trend, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary/20 rounded-t"
                    style={{
                      height: `${trend.efficiencyScore}%`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {trend.period}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
