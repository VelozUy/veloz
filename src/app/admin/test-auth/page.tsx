'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getAuthService } from '@/lib/firebase';
import { checkAdminStatus } from '@/lib/admin-auth';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function TestAuthPage() {
  const { user, loading, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      const auth = await getAuthService();
      if (!auth) {
        setError('Firebase Auth not available');
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful:', result.user.email);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      console.error('Sign in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const checkAdmin = async () => {
    if (!user?.email) return;
    
    setCheckingAdmin(true);
    try {
      const isAdmin = await checkAdminStatus(user.email);
      setAdminStatus(isAdmin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin check failed');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAdminStatus(null);
      setError(null);
    } catch (err) {
      setError('Sign out failed');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Authentication Test</h1>
        <p className="text-muted-foreground">
          Test Firebase authentication and admin status
        </p>
      </div>

      <div className="space-y-6">
        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>
              Current Firebase authentication state
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <Badge variant="outline" className="text-primary">
                    Signed In
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>UID:</strong> {user.uid}</p>
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <Badge variant="outline" className="text-destructive">
                    Not Signed In
                  </Badge>
                </div>
                <Button 
                  onClick={handleGoogleSignIn} 
                  disabled={isSigningIn}
                  className="w-full"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In with Google'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Status */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Status</CardTitle>
              <CardDescription>
                Check if user has admin access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checkingAdmin ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking admin status...</span>
                  </div>
                ) : adminStatus !== null ? (
                  <div className="flex items-center gap-2">
                    {adminStatus ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <Badge variant="outline" className="text-primary">
                          Admin Access Granted
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-destructive" />
                        <Badge variant="outline" className="text-destructive">
                          Admin Access Denied
                        </Badge>
                      </>
                    )}
                  </div>
                ) : (
                  <Button onClick={checkAdmin} variant="outline" size="sm">
                    Check Admin Status
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
            <CardDescription>
              Quick links to test different pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a 
                href="/admin/login" 
                className="block text-primary hover:underline"
              >
                → Admin Login Page
              </a>
              <a 
                href="/admin/dashboard" 
                className="block text-primary hover:underline"
              >
                → Admin Dashboard
              </a>
              <a 
                href="/admin/debug/auth-status" 
                className="block text-primary hover:underline"
              >
                → Detailed Auth Debug
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 