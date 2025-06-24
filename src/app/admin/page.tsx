'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Home,
  Plus,
  BarChart3,
  Calendar,
  User,
  FolderOpen,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Invite new administrators and manage access',
      icon: User,
      href: '/admin/users',
      color: 'text-blue-500',
    },
    {
      title: 'Create Project',
      description: 'Start a new photography/videography project',
      icon: FolderOpen,
      href: '/admin/projects',
      color: 'text-green-500',
    },
    {
      title: 'Edit Homepage',
      description: 'Update homepage content and headlines',
      icon: Home,
      href: '/admin/homepage',
      color: 'text-purple-500',
    },
    {
      title: 'Manage FAQs',
      description: 'Add or edit frequently asked questions',
      icon: HelpCircle,
      href: '/admin/faqs',
      color: 'text-orange-500',
    },
  ];

  const stats = [
    {
      title: 'Total Projects',
      value: '0',
      description: 'Active projects',
      icon: FolderOpen,
    },
    {
      title: 'Published',
      value: '0',
      description: 'Live projects',
      icon: BarChart3,
    },
    {
      title: 'FAQ Items',
      value: '0',
      description: 'Active questions',
      icon: HelpCircle,
    },
    {
      title: 'Last Updated',
      value: 'Today',
      description: 'Content modified',
      icon: Calendar,
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your Veloz content management
            system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.title}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {action.title}
                        </CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a href={action.href}>
                        <Plus className="w-4 h-4 mr-2" />
                        Get Started
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No recent activity
                  </h3>
                  <p className="text-muted-foreground">
                    Start managing your content to see activity here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
