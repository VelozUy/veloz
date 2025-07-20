'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  Users,
  FolderOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Pause,
  Plus,
  Edit,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  Filter,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from 'firebase/firestore';

interface Project {
  id: string;
  title: {
    en: string;
    es: string;
    pt: string;
  };
  description: {
    en: string;
    es: string;
    pt: string;
  };
  eventType: string;
  location: string;
  eventDate: string;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived' | 'in-progress' | 'completed';
  coverImage?: string;
  mediaCount: {
    photos: number;
    videos: number;
  };
  crewMembers?: string[];
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  timeline?: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      id: string;
      title: string;
      date: string;
      status: 'pending' | 'completed' | 'overdue';
    }>;
  };
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

interface DashboardStats {
  total: number;
  published: number;
  inProgress: number;
  completed: number;
  overdue: number;
  thisMonth: number;
  totalBudget: number;
  averageCompletionTime: number;
}

export default function ProjectDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    published: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    thisMonth: 0,
    totalBudget: 0,
    averageCompletionTime: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        setLoading(false);
        return;
      }

      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(projectsQuery);
      const projectList: Project[] = [];

      snapshot.forEach(doc => {
        projectList.push({ id: doc.id, ...doc.data() } as Project);
      });

      setProjects(projectList);
      calculateStats(projectList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      setLoading(false);
    }
  };

  const calculateStats = (projectList: Project[]) => {
    const now = new Date();
    let total = 0;
    let published = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;
    let thisMonth = 0;
    let totalBudget = 0;
    let totalCompletionTime = 0;
    let completedCount = 0;

    projectList.forEach(project => {
      total++;
      if (project.status === 'published') published++;
      if (project.status === 'in-progress') inProgress++;
      if (project.status === 'completed') {
        completed++;
        if (project.createdAt && project.updatedAt) {
          const startDate = project.createdAt.toDate();
          const endDate = project.updatedAt.toDate();
          const completionTime =
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          totalCompletionTime += completionTime;
          completedCount++;
        }
      }

      // Check for overdue projects
      if (project.timeline?.endDate) {
        const endDate = new Date(project.timeline.endDate);
        if (endDate < now && project.status !== 'completed') {
          overdue++;
        }
      }

      // This month projects
      const projectDate = project.createdAt?.toDate();
      if (
        projectDate &&
        projectDate.getMonth() === now.getMonth() &&
        projectDate.getFullYear() === now.getFullYear()
      ) {
        thisMonth++;
      }

      // Budget calculation
      if (project.budget) {
        totalBudget += project.budget.total;
      }
    });

    setStats({
      total,
      published,
      inProgress,
      completed,
      overdue,
      thisMonth,
      totalBudget,
      averageCompletionTime:
        completedCount > 0 ? totalCompletionTime / completedCount : 0,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-primary';
      case 'in-progress':
        return 'bg-muted';
      case 'completed':
        return 'bg-green-600';
      case 'draft':
        return 'bg-gray-500';
      case 'archived':
        return 'bg-gray-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-primary-foreground" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-primary-foreground" />;
      case 'draft':
        return <Pause className="h-4 w-4 text-muted-foreground" />;
      case 'archived':
        return <FolderOpen className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.title.es.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.eventType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (project: Project) => {
    if (!project.timeline?.milestones) return 0;
    const completed = project.timeline.milestones.filter(
      m => m.status === 'completed'
    ).length;
    return (completed / project.timeline.milestones.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Project Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time overview of all projects and team activities
          </p>
        </div>
        <Button onClick={() => router.push('/admin/projects/new/edit')}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdue} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageCompletionTime.toFixed(1)} days avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <Card
                key={project.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {project.title.es || project.title.en}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.eventType}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(project.status)} text-primary-foreground`}
                    >
                      {getStatusIcon(project.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  {project.timeline?.milestones && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>
                          {getProgressPercentage(project).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(project)}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {new Date(project.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                    {project.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    {project.mediaCount && (
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {project.mediaCount.photos +
                            project.mediaCount.videos}{' '}
                          media
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/projects/${project.id}/edit`)
                      }
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/our-work/${project.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects
                  .filter(p => p.timeline?.milestones)
                  .map(project => (
                    <div
                      key={project.id}
                      className="border-l-2 border-primary pl-4"
                    >
                      <h4 className="font-medium">
                        {project.title.es || project.title.en}
                      </h4>
                      <div className="mt-2 space-y-2">
                        {project.timeline?.milestones.map(milestone => (
                          <div
                            key={milestone.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                milestone.status === 'completed'
                                  ? 'bg-green-500'
                                  : milestone.status === 'overdue'
                                    ? 'bg-destructive'
                                    : 'bg-accent'
                              }`}
                            />
                            <span className="flex-1">{milestone.title}</span>
                            <span className="text-muted-foreground">
                              {new Date(milestone.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects
                  .filter(p => p.clientInfo)
                  .map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {project.clientInfo?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {project.clientInfo?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project.title.es || project.title.en}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {project.clientInfo?.email && (
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {project.clientInfo?.phone && (
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects
                  .filter(p => p.crewMembers && p.crewMembers.length > 0)
                  .map(project => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">
                        {project.title.es || project.title.en}
                      </h4>
                      <div className="flex items-center gap-2">
                        {project.crewMembers?.map((memberId, index) => (
                          <Avatar key={memberId} className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {memberId.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
