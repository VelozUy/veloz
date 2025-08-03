'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkAdminStatus, getCurrentAdminUser } from '@/lib/admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthStatusDebugPage() {
  const { user, loading } = useAuth();
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAdminAccess = async () => {
    if (!user?.email) return;
    
    setChecking(true);
    setError(null);
    
    try {
      const isAdmin = await checkAdminStatus(user.email);
      setAdminStatus(isAdmin);
      
      if (isAdmin) {
        const adminData = await getCurrentAdminUser(user.email);
        setAdminUser(adminData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      checkAdminAccess();
    }
  }, [user]);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="w-4 h-4" />;
    return status ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'text-muted-foreground';
    return status ? 'text-primary' : 'text-destructive';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Auth Status Debug</h1>
        <p className="text-muted-foreground">
          Diagnostic tool to check authentication and admin status
        </p>
      </div>

      <div className="grid gap-6">
        {/* Firebase Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Firebase Authentication
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                getStatusIcon(!!user)
              )}
            </CardTitle>
            <CardDescription>
              Current Firebase authentication status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking authentication...</span>
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-primary">
                    Authenticated
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>UID:</strong> {user.uid}</p>
                  <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
                  <p><strong>Provider:</strong> {user.providerData[0]?.providerId || 'Unknown'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-destructive">
                  Not Authenticated
                </Badge>
                <span className="text-sm text-muted-foreground">
                  User is not signed in to Firebase
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Admin Access
              {checking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                getStatusIcon(adminStatus)
              )}
            </CardTitle>
            <CardDescription>
              Firestore admin user verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checking ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking admin status...</span>
                </div>
              ) : user?.email ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={adminStatus ? 'text-primary' : 'text-destructive'}
                    >
                      {adminStatus ? 'Admin Access Granted' : 'Admin Access Denied'}
                    </Badge>
                  </div>
                  
                  {adminStatus && adminUser && (
                    <div className="text-sm space-y-1 bg-muted p-3 rounded">
                      <p><strong>Status:</strong> {adminUser.status}</p>
                      <p><strong>Role:</strong> {adminUser.role || 'Not specified'}</p>
                      <p><strong>Created:</strong> {adminUser.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
                      <p><strong>Updated:</strong> {adminUser.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
                    </div>
                  )}
                  
                  {!adminStatus && (
                    <Alert>
                      <AlertDescription>
                        User email <strong>{user.email}</strong> is not found in the adminUsers collection 
                        or does not have active status. Contact an administrator to be added to the system.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No user email available to check admin status
                </div>
              )}
              
              <Button 
                onClick={checkAdminAccess} 
                disabled={checking || !user?.email}
                variant="outline"
                size="sm"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Recheck Admin Status'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
            <CardDescription>
              Configuration and environment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Firebase Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
              <p><strong>Owner Email:</strong> {process.env.NEXT_PUBLIC_OWNER_EMAIL || 'Not set'}</p>
              <p><strong>Client Side:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 