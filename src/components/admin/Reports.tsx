// Reports Component for Admin Analytics
// Displays comprehensive project analytics and business metrics

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { 
  analyticsService, 
  ProjectMetrics, 
  BusinessMetrics, 
  TimelineAnalysis,
  RevenueAnalysis 
} from '@/lib/analytics';

interface ReportsProps {
  projectId?: string;
}

export default function Reports({ projectId }: ReportsProps) {
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [timelineAnalysis, setTimelineAnalysis] = useState<TimelineAnalysis | null>(null);
  const [revenueAnalysis, setRevenueAnalysis] = useState<RevenueAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, [projectId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');

      // Load business metrics (always available)
      const business = await analyticsService.getBusinessMetrics();
      setBusinessMetrics(business);

      // Load project-specific metrics if projectId is provided
      if (projectId) {
        const project = await analyticsService.getProjectMetrics(projectId);
        setProjectMetrics(project);

        const timeline = await analyticsService.getTimelineAnalysis(projectId);
        setTimelineAnalysis(timeline);
      }

      // Load revenue analysis
      const revenue = await analyticsService.getRevenueAnalysis();
      setRevenueAnalysis(revenue);
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Activity className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
              <p>{error}</p>
              <Button onClick={loadMetrics} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Overview */}
      {businessMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Business Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{businessMetrics.totalProjects}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{businessMetrics.activeProjects}</div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(businessMetrics.totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatPercentage(businessMetrics.clientRetentionRate)}</div>
                <div className="text-sm text-muted-foreground">Client Retention</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Metrics */}
      {projectMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{formatPercentage(projectMetrics.progress)}</span>
                </div>
                <Progress value={projectMetrics.progress} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusColor(projectMetrics.status)}>
                    {projectMetrics.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="text-sm">
                    {projectMetrics.timelinePerformance.onTime ? (
                      <span className="text-green-600">On Time</span>
                    ) : (
                      <span className="text-red-600">{projectMetrics.timelinePerformance.daysOverdue} days overdue</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Budget Utilization</div>
                  <div className="text-sm font-medium">{formatPercentage(projectMetrics.budgetPerformance.budgetUtilization)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Team Efficiency</div>
                  <div className="text-sm font-medium">{formatPercentage(projectMetrics.teamPerformance.efficiency)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team & Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                  <div className="text-2xl font-bold">{projectMetrics.teamPerformance.assignedMembers}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Completed Tasks</div>
                  <div className="text-2xl font-bold">{projectMetrics.teamPerformance.completedTasks}/{projectMetrics.teamPerformance.totalTasks}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Communications</div>
                  <div className="text-2xl font-bold">{projectMetrics.communicationMetrics.totalCommunications}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Client Engagement</div>
                  <div className="text-2xl font-bold">{formatPercentage(projectMetrics.communicationMetrics.clientEngagement)}</div>
                </div>
              </div>

              {projectMetrics.clientSatisfaction.rating && (
                <div>
                  <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{projectMetrics.clientSatisfaction.rating}/5</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <CheckCircle
                          key={i}
                          className={`w-4 h-4 ${
                            i < projectMetrics.clientSatisfaction.rating! 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline Analysis */}
      {timelineAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Planned Progress</div>
                  <div className="text-2xl font-bold">{formatPercentage(timelineAnalysis.overallTimeline.plannedProgress)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Actual Progress</div>
                  <div className="text-2xl font-bold">{formatPercentage(timelineAnalysis.overallTimeline.actualProgress)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Variance</div>
                  <div className={`text-2xl font-bold ${
                    timelineAnalysis.overallTimeline.variance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {timelineAnalysis.overallTimeline.variance >= 0 ? '+' : ''}{formatPercentage(timelineAnalysis.overallTimeline.variance)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Milestone Status</div>
                <div className="space-y-2">
                  {timelineAnalysis.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                        <span className="text-sm">{milestone.title}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {milestone.delayDays && milestone.delayDays > 0 && (
                          <span className="text-red-600">+{milestone.delayDays} days</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Analysis */}
      {revenueAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Project Type Revenue */}
              <div>
                <div className="text-sm font-medium mb-3">Revenue by Project Type</div>
                <div className="space-y-2">
                  {revenueAnalysis.projectTypeRevenue.slice(0, 5).map((type) => (
                    <div key={type.eventType} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{type.eventType}</span>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(type.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Clients */}
              <div>
                <div className="text-sm font-medium mb-3">Top Clients by Value</div>
                <div className="space-y-2">
                  {revenueAnalysis.clientValueAnalysis.slice(0, 5).map((client) => (
                    <div key={client.clientName} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{client.clientName}</span>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(client.totalValue)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Revenue */}
              <div>
                <div className="text-sm font-medium mb-3">Monthly Revenue Trend</div>
                <div className="space-y-2">
                  {revenueAnalysis.monthlyRevenue.slice(-6).map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">{month.month}</span>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(month.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              Export Project Report
            </Button>
            <Button variant="outline" className="w-full">
              Export Business Metrics
            </Button>
            <Button variant="outline" className="w-full">
              Export Revenue Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 