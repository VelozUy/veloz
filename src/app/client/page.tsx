'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Eye,
  Star,
  TrendingUp,
  Users,
  FileText,
  Video,
  Image as ImageIcon,
  FolderOpen,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

interface ClientProject {
  id: string;
  title: {
    en: string;
    es: string;
    pt: string;
  };
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  eventType: string;
  eventDate: string;
  location: string;
  progress: number;
  mediaCount: {
    photos: number;
    videos: number;
  };
  lastUpdate: Date;
  crewMembers?: string[];
  milestones?: Array<{
    id: string;
    title: string;
    date: string;
    status: 'pending' | 'completed' | 'overdue';
  }>;
}

interface ClientDashboardStats {
  totalProjects: number;
  inProgress: number;
  completed: number;
  totalFiles: number;
  recentMessages: number;
  upcomingMilestones: number;
}

export default function ClientDashboard() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [stats, setStats] = useState<ClientDashboardStats>({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    totalFiles: 0,
    recentMessages: 0,
    upcomingMilestones: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const clientId = localStorage.getItem('clientId');
      if (!clientId) {
        setError('Client not authenticated');
        return;
      }

      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        return;
      }

      // Load client's projects
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(
        projectsRef,
        where('clientId', '==', clientId),
        orderBy('updatedAt', 'desc')
      );
      const projectsSnapshot = await getDocs(projectsQuery);

      const projectsData: ClientProject[] = [];
      let totalFiles = 0;
      let upcomingMilestones = 0;

      projectsSnapshot.forEach(doc => {
        const projectData = doc.data() as ClientProject;
        const project = { ...projectData, id: doc.id };

        // Calculate progress based on milestones
        if (project.milestones) {
          const completed = project.milestones.filter(
            m => m.status === 'completed'
          ).length;
          project.progress = Math.round(
            (completed / project.milestones.length) * 100
          );

          // Count upcoming milestones
          const now = new Date();
          upcomingMilestones += project.milestones.filter(m => {
            const milestoneDate = new Date(m.date);
            return milestoneDate > now && m.status === 'pending';
          }).length;
        } else {
          project.progress = 0;
        }

        // Count total files
        totalFiles +=
          (project.mediaCount?.photos || 0) + (project.mediaCount?.videos || 0);

        projectsData.push(project);
      });

      setProjects(projectsData);

      // Calculate stats
      const inProgress = projectsData.filter(
        p => p.status === 'in-progress'
      ).length;
      const completed = projectsData.filter(
        p => p.status === 'completed'
      ).length;

      setStats({
        totalProjects: projectsData.length,
        inProgress,
        completed,
        totalFiles,
        recentMessages: 0, // TODO: Implement message counting
        upcomingMilestones,
      });
    } catch (error) {
      console.error('Error loading client data:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'in-progress':
        return 'bg-primary/10 text-primary';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'archived':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects
          </p>
        </div>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Team
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
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgress} in progress
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
              {stats.totalProjects > 0
                ? Math.round((stats.completed / stats.totalProjects) * 100)
                : 0}
              % success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Photos and videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMilestones}</div>
            <p className="text-xs text-muted-foreground">Milestones due soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground">
                Your projects will appear here once they&apos;re created
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarFallback>
                          {project.title.es?.charAt(0) ||
                            project.title.en?.charAt(0) ||
                            'P'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium">
                        {project.title.es ||
                          project.title.en ||
                          project.title.pt}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {project.eventType} • {project.location}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                        {project.progress > 0 && (
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={project.progress}
                              className="w-20"
                            />
                            <span className="text-xs text-muted-foreground">
                              {project.progress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {project.mediaCount.photos > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {project.mediaCount.photos}
                      </Badge>
                    )}
                    {project.mediaCount.videos > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        {project.mediaCount.videos}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {projects.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">View All Projects</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Files
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">New photos uploaded</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Project milestone completed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">New message from team</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Final Review</p>
                  <p className="text-xs text-muted-foreground">
                    Wedding Project
                  </p>
                </div>
                <Badge variant="secondary">Tomorrow</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Photo Selection</p>
                  <p className="text-xs text-muted-foreground">
                    Corporate Event
                  </p>
                </div>
                <Badge variant="outline">3 days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Video Edit</p>
                  <p className="text-xs text-muted-foreground">
                    Product Launch
                  </p>
                </div>
                <Badge variant="outline">1 week</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
