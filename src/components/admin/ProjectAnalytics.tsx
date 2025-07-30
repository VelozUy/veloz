'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Activity,
  MessageSquare,
  Star,
  RefreshCw,
  Download,
  Filter,
  FolderOpen
} from 'lucide-react';
import { 
  analyticsService, 
  ProjectMetrics, 
  BusinessMetrics, 
  TimelineAnalysis,
  RevenueAnalysis 
} from '@/lib/analytics';

interface ProjectAnalyticsProps {
  projectId?: string;
  showBusinessMetrics?: boolean;
}

interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  progress: number;
  timelinePerformance: {
    onTime: boolean;
    daysRemaining: number;
    daysOverdue: number;
  };
  budgetPerformance: {
    totalBudget: number;
    spentAmount: number;
    remainingBudget: number;
    budgetUtilization: number;
  };
}

export default function ProjectAnalytics({ 
  projectId, 
  showBusinessMetrics = true 
}: ProjectAnalyticsProps) {
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [timelineAnalysis, setTimelineAnalysis] = useState<TimelineAnalysis | null>(null);
  const [revenueAnalysis, setRevenueAnalysis] = useState<RevenueAnalysis | null>(null);
  const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedProject, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load business metrics (always available)
      if (showBusinessMetrics) {
        const business = await analyticsService.getBusinessMetrics();
        setBusinessMetrics(business);
        
        const revenue = await analyticsService.getRevenueAnalysis();
        setRevenueAnalysis(revenue);
      }

      // Load project-specific metrics if projectId is provided
      if (selectedProject) {
        const project = await analyticsService.getProjectMetrics(selectedProject);
        setProjectMetrics(project);

        const timeline = await analyticsService.getTimelineAnalysis(selectedProject);
        setTimelineAnalysis(timeline);
      }

      // Load project summaries for overview
      await loadProjectSummaries();
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectSummaries = async () => {
    // This would typically load from the analytics service
    // For now, we'll use placeholder data
    setProjectSummaries([
      {
        id: '1',
        title: 'Wedding Project Alpha',
        status: 'in-progress',
        progress: 75,
        timelinePerformance: {
          onTime: true,
          daysRemaining: 15,
          daysOverdue: 0,
        },
        budgetPerformance: {
          totalBudget: 5000,
          spentAmount: 3750,
          remainingBudget: 1250,
          budgetUtilization: 75,
        },
      },
      {
        id: '2',
        title: 'Corporate Event Beta',
        status: 'completed',
        progress: 100,
        timelinePerformance: {
          onTime: false,
          daysRemaining: 0,
          daysOverdue: 5,
        },
        budgetPerformance: {
          totalBudget: 3000,
          spentAmount: 3200,
          remainingBudget: -200,
          budgetUtilization: 107,
        },
      },
    ]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Activity className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleExportData = () => {
    // Export functionality would be implemented here
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Analytics</h2>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Analytics</h2>
          <p className="text-gray-600">Comprehensive project performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalyticsData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          {showBusinessMetrics && (
            <TabsTrigger value="business">Business</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {businessMetrics?.totalProjects || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {businessMetrics?.activeProjects || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {businessMetrics?.averageProjectDuration || 0} days
                </div>
                <p className="text-xs text-muted-foreground">
                  Project lifecycle
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(businessMetrics?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {businessMetrics?.averageClientSatisfaction?.toFixed(1) || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Project Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectSummaries.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(project.status)}
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-gray-600">
                          {project.timelinePerformance.onTime ? 'On track' : `${project.timelinePerformance.daysOverdue} days overdue`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Progress</p>
                        <p className="text-sm text-gray-600">{formatPercentage(project.progress)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Budget</p>
                        <p className="text-sm text-gray-600">{formatPercentage(project.budgetPerformance.budgetUtilization)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {projectMetrics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{formatPercentage(projectMetrics.progress)}</span>
                      </div>
                      <Progress value={projectMetrics.progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {projectMetrics.teamPerformance.completedTasks}
                        </div>
                        <div className="text-sm text-gray-600">Tasks Completed</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(projectMetrics.teamPerformance.efficiency)}
                        </div>
                        <div className="text-sm text-gray-600">Team Efficiency</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className={projectMetrics.timelinePerformance.onTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {projectMetrics.timelinePerformance.onTime ? 'On Time' : 'Overdue'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {projectMetrics.timelinePerformance.daysRemaining}
                        </div>
                        <div className="text-sm text-gray-600">Days Remaining</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {projectMetrics.timelinePerformance.daysOverdue}
                        </div>
                        <div className="text-sm text-gray-600">Days Overdue</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {projectMetrics.communicationMetrics.totalCommunications}
                        </div>
                        <div className="text-sm text-gray-600">Total Communications</div>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatPercentage(projectMetrics.communicationMetrics.clientEngagement)}
                        </div>
                        <div className="text-sm text-gray-600">Client Engagement</div>
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {projectMetrics.communicationMetrics.responseTime.toFixed(1)}h
                      </div>
                      <div className="text-sm text-gray-600">Avg. Response Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Satisfaction */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectMetrics.clientSatisfaction.rating ? (
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {projectMetrics.clientSatisfaction.rating}/5
                        </div>
                        <div className="text-sm text-gray-600">Client Rating</div>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">N/A</div>
                        <div className="text-sm text-gray-600">No rating yet</div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <strong>Last Contact:</strong> {projectMetrics.clientSatisfaction.lastContact.toLocaleDateString()}
                    </div>
                    
                    {projectMetrics.clientSatisfaction.feedback && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm italic">&ldquo;{projectMetrics.clientSatisfaction.feedback}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Select a project to view detailed performance metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          {timelineAnalysis ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {timelineAnalysis.overallTimeline.actualProgress.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Actual Progress</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {timelineAnalysis.overallTimeline.plannedProgress.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Planned Progress</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {timelineAnalysis.overallTimeline.variance.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Variance</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Milestones</h4>
                      {timelineAnalysis.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-500' :
                              milestone.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            <div>
                              <p className="font-medium">{milestone.title}</p>
                              <p className="text-sm text-gray-600">
                                Planned: {milestone.plannedDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                            milestone.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {milestone.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Timeline analysis not available for this project</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {projectMetrics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(projectMetrics.budgetPerformance.totalBudget)}
                        </div>
                        <div className="text-sm text-gray-600">Total Budget</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(projectMetrics.budgetPerformance.spentAmount)}
                        </div>
                        <div className="text-sm text-gray-600">Spent</div>
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(projectMetrics.budgetPerformance.remainingBudget)}
                      </div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Budget Utilization</span>
                        <span>{formatPercentage(projectMetrics.budgetPerformance.budgetUtilization)}</span>
                      </div>
                      <Progress 
                        value={Math.min(projectMetrics.budgetPerformance.budgetUtilization, 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Analysis */}
              {revenueAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {revenueAnalysis.monthlyRevenue.length > 0 
                            ? formatCurrency(revenueAnalysis.monthlyRevenue[revenueAnalysis.monthlyRevenue.length - 1].revenue)
                            : '$0'
                          }
                        </div>
                        <div className="text-sm text-gray-600">This Month&apos;s Revenue</div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Top Project Types</h4>
                        {revenueAnalysis.projectTypeRevenue.slice(0, 3).map((type) => (
                          <div key={type.eventType} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{type.eventType}</span>
                            <span className="text-sm font-medium">{formatCurrency(type.revenue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Financial data not available for this project</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          {projectMetrics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {projectMetrics.teamPerformance.assignedMembers}
                        </div>
                        <div className="text-sm text-gray-600">Team Members</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {projectMetrics.teamPerformance.totalTasks}
                        </div>
                        <div className="text-sm text-gray-600">Total Tasks</div>
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentage(projectMetrics.teamPerformance.efficiency)}
                      </div>
                      <div className="text-sm text-gray-600">Team Efficiency</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Task Completion</span>
                        <span>{projectMetrics.teamPerformance.completedTasks}/{projectMetrics.teamPerformance.totalTasks}</span>
                      </div>
                      <Progress 
                        value={projectMetrics.teamPerformance.totalTasks > 0 
                          ? (projectMetrics.teamPerformance.completedTasks / projectMetrics.teamPerformance.totalTasks) * 100 
                          : 0
                        } 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800">Performance Highlights</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• {projectMetrics.teamPerformance.completedTasks} tasks completed successfully</li>
                        <li>• {formatPercentage(projectMetrics.teamPerformance.efficiency)} overall efficiency</li>
                        <li>• {projectMetrics.teamPerformance.assignedMembers} team members actively engaged</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">Recommendations</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        {projectMetrics.teamPerformance.efficiency < 80 && (
                          <li>• Consider additional team resources to improve efficiency</li>
                        )}
                        {projectMetrics.teamPerformance.totalTasks - projectMetrics.teamPerformance.completedTasks > 5 && (
                          <li>• Focus on completing remaining tasks to meet deadlines</li>
                        )}
                        <li>• Regular team check-ins to maintain momentum</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Team data not available for this project</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Business Tab */}
        {showBusinessMetrics && (
          <TabsContent value="business" className="space-y-6">
            {businessMetrics && revenueAnalysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Business Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {businessMetrics.activeProjects}
                          </div>
                          <div className="text-sm text-gray-600">Active Projects</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPercentage(businessMetrics.clientRetentionRate)}
                          </div>
                          <div className="text-sm text-gray-600">Client Retention</div>
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(businessMetrics.averageProjectValue)}
                        </div>
                        <div className="text-sm text-gray-600">Average Project Value</div>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatPercentage(businessMetrics.teamProductivity)}
                        </div>
                        <div className="text-sm text-gray-600">Team Productivity</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Monthly Revenue</h4>
                        {revenueAnalysis.monthlyRevenue.slice(-6).map((month) => (
                          <div key={month.month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{month.month}</span>
                            <span className="text-sm font-medium">{formatCurrency(month.revenue)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Top Clients</h4>
                        {revenueAnalysis.clientValueAnalysis.slice(0, 3).map((client) => (
                          <div key={client.clientName} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{client.clientName}</span>
                            <span className="text-sm font-medium">{formatCurrency(client.totalValue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">Business metrics not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 