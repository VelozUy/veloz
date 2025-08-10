'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { shouldSkipFirebase } from '@/lib/static-page-detection';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip Firebase auth on static pages
    if (shouldSkipFirebase()) {
      // Skipping Firebase auth on static page
      setLoading(false);
      return;
    }

    // Dynamic import of Firebase auth to prevent SSR issues
    const initAuth = async () => {
      try {
        // Only initialize on client side
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Wait for Firebase to be properly initialized using the async service
        const { getAuthService } = await import('@/lib/firebase');
        const auth = await getAuthService();

        // Check if auth is properly initialized
        if (!auth || typeof auth.onAuthStateChanged !== 'function') {
          console.warn('Firebase auth not properly initialized');
          setLoading(false);
          return;
        }

        const unsubscribe = onAuthStateChanged(auth, user => {
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    const unsubscribePromise = initAuth();

    return () => {
      unsubscribePromise?.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  const signOut = async () => {
    try {
      if (typeof window === 'undefined' || shouldSkipFirebase()) return;

      // Use the async auth service
      const { getAuthService } = await import('@/lib/firebase');
      const auth = await getAuthService();

      if (auth && typeof auth.signOut === 'function') {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
