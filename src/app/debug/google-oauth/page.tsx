'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getAuthService } from '@/lib/firebase';

interface OAuthDebugInfo {
  isClient: boolean;
  authAvailable: boolean;
  signInAttempted: boolean;
  signInResult: {
    success: boolean;
    user?: {
      uid: string;
      email: string;
      displayName?: string;
    };
    error?: string;
  } | null;
}

export default function GoogleOAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<OAuthDebugInfo>({
    isClient: typeof window !== 'undefined',
    authAvailable: false,
    signInAttempted: false,
    signInResult: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await getAuthService();
        setDebugInfo(prev => ({
          ...prev,
          authAvailable: !!auth,
        }));
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, signInAttempted: true }));

      const auth = await getAuthService();
      if (!auth) {
        setDebugInfo(prev => ({
          ...prev,
          signInResult: {
            success: false,
            error: 'Auth not available',
          },
        }));
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setDebugInfo(prev => ({
        ...prev,
        signInResult: {
          success: true,
          user: {
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || undefined,
          },
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setDebugInfo(prev => ({
        ...prev,
        signInResult: {
          success: false,
          error: errorMessage,
        },
      }));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Google OAuth Debug</h1>

      <div className="mb-4">
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Google Sign-In
        </button>
      </div>

      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
