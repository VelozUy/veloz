'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagnosticResult {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function AdminDiagnostic() {
  const { user, loading } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Check if we're on client side
    results.push({
      name: 'Client Side Rendering',
      status: typeof window !== 'undefined' ? 'success' : 'error',
      message: typeof window !== 'undefined' ? 'Running on client side' : 'Running on server side',
    });

    // 2. Check Firebase config
    try {
      const { validateFirebaseConfig } = await import('@/lib/firebase-config');
      const config = validateFirebaseConfig();
      results.push({
        name: 'Firebase Configuration',
        status: config.isValid ? 'success' : 'error',
        message: config.isValid ? 'Firebase config is valid' : `Missing environment variables: ${config.missing.join(', ')}`,
        details: {
          ...config,
          instructions: config.isValid ? null : 'Create a .env.local file in the project root with your Firebase configuration. See the Firebase Console for your project settings.',
        },
      });
    } catch (error) {
      results.push({
        name: 'Firebase Configuration',
        status: 'error',
        message: `Error loading Firebase config: ${error}`,
      });
    }

    // 3. Check Firebase services
    try {
      const { getAuthService, getFirestoreService } = await import('@/lib/firebase');
      const auth = await getAuthService();
      const db = await getFirestoreService();
      
      results.push({
        name: 'Firebase Services',
        status: auth && db ? 'success' : 'error',
        message: auth && db ? 'Firebase services initialized' : 'Firebase services failed to initialize',
        details: { auth: !!auth, db: !!db },
      });
    } catch (error) {
      results.push({
        name: 'Firebase Services',
        status: 'error',
        message: `Error initializing Firebase services: ${error}`,
      });
    }

    // 4. Check authentication state
    results.push({
      name: 'Authentication State',
      status: loading ? 'loading' : (user ? 'success' : 'error'),
      message: loading ? 'Checking authentication...' : (user ? `Authenticated as ${user.email}` : 'Not authenticated'),
      details: { user: !!user, loading, email: user?.email },
    });

    // 5. Check admin status
    if (user?.email) {
      try {
        const { checkAdminStatus } = await import('@/lib/admin-auth');
        const isAdmin = await checkAdminStatus(user.email);
        results.push({
          name: 'Admin Status',
          status: isAdmin ? 'success' : 'error',
          message: isAdmin ? 'User has admin privileges' : 'User does not have admin privileges',
          details: { email: user.email, isAdmin },
        });
      } catch (error) {
        results.push({
          name: 'Admin Status',
          status: 'error',
          message: `Error checking admin status: ${error}`,
        });
      }
    } else {
      results.push({
        name: 'Admin Status',
        status: 'error',
        message: 'Cannot check admin status - no user email',
      });
    }

    // 6. Check component imports
    try {
      const { default: AdminLayout } = await import('@/components/admin/AdminLayout');
      const { default: DashboardUpcomingTasks } = await import('@/components/admin/DashboardUpcomingTasks');
      const { default: ProjectStatusDashboard } = await import('@/components/admin/ProjectStatusDashboard');
      
      results.push({
        name: 'Component Imports',
        status: 'success',
        message: 'All admin components imported successfully',
        details: { 
          AdminLayout: !!AdminLayout, 
          DashboardUpcomingTasks: !!DashboardUpcomingTasks, 
          ProjectStatusDashboard: !!ProjectStatusDashboard 
        },
      });
    } catch (error) {
      results.push({
        name: 'Component Imports',
        status: 'error',
        message: `Error importing components: ${error}`,
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user, loading]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Admin Panel Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostic.status)}
                <div>
                  <div className="font-medium">{diagnostic.name}</div>
                  <div className="text-sm text-muted-foreground">{diagnostic.message}</div>
                  {diagnostic.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted-foreground">
                        Show details
                      </summary>
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(diagnostic.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
              {getStatusBadge(diagnostic.status)}
            </div>
          ))}
          
          {isRunning && (
            <Alert>
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription>Running diagnostics...</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              'Run Diagnostics Again'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 