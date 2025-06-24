'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Loader2, Mail } from 'lucide-react';

// Owner email - this user is always allowed
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || '';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const checkUserAccess = async (email: string) => {
    // Owner is always allowed
    if (email === OWNER_EMAIL) {
      return true;
    }

    // Check if user is in the invited users collection
    try {
      const userDoc = await getDoc(doc(db, 'adminUsers', email));
      return userDoc.exists() && userDoc.data()?.status === 'active';
    } catch (error) {
      console.error('Error checking user access:', error);
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        setError('Unable to retrieve email from Google account.');
        return;
      }

      // Check if user has access
      const hasAccess = await checkUserAccess(user.email);

      if (!hasAccess) {
        // Sign out the user immediately
        await auth.signOut();
        setError(
          'Access denied. You need to be invited by an administrator to access this system.'
        );
        return;
      }

      // User has access, redirect to admin dashboard
      router.push('/admin');
    } catch (error: unknown) {
      console.error('Login error:', error);

      const firebaseError = error as { code?: string; message?: string };
      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-in was cancelled.');
          break;
        case 'auth/popup-blocked':
          setError(
            'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
          );
          break;
        case 'auth/account-exists-with-different-credential':
          setError(
            'An account already exists with this email using a different sign-in method.'
          );
          break;
        case 'auth/cancelled-popup-request':
          setError('Sign-in was cancelled.');
          break;
        default:
          setError('Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Veloz Admin
            </h1>
          </div>
          <p className="text-muted-foreground">
            Sign in with Google to access the content management system
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Administrator Sign In</CardTitle>
            <CardDescription>
              Only invited administrators can access this system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>

            {/* Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                You must be invited by an administrator to access this system.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2024 Veloz. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
