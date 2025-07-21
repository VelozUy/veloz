'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getAuthService, getFirestoreService } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAdminBackground } from '@/hooks/useBackground';

// Owner email - this user is always allowed
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || '';

export default function AdminLoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the new background system for admin sections
  const { classes: adminClasses } = useAdminBackground();

  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div
        className={`min-h-screen ${adminClasses.background} ${adminClasses.text} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (user) {
    return null; // Will redirect to admin
  }

  const checkUserAccess = async (email: string) => {
    // Owner is always allowed
    if (email === OWNER_EMAIL) {
      return true;
    }

    // Check if user is in the invited users collection
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return false;
      }
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
      // Try to get auth synchronously first
      const { getAuthSync } = await import('@/lib/firebase');
      let auth = getAuthSync();

      // If auth is not available synchronously, try async initialization
      if (!auth) {
        auth = await getAuthService();
      }

      if (!auth) {
        setError('Firebase Auth not available');
        return;
      }

      // Debug Firebase configuration
      const { debugFirebaseConfig } = await import('@/lib/firebase-config');
      const configDebug = debugFirebaseConfig();

      if (!configDebug.isValid) {
        console.error('Firebase config validation failed:', configDebug);
        setError(
          'Error de configuración de Firebase. Contacta al administrador.'
        );
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      console.log('🔐 Attempting Google sign-in...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('✅ Google sign-in successful:', {
        email: user.email,
        uid: user.uid,
      });

      if (!user.email) {
        setError('No se pudo obtener el email de la cuenta de Google.');
        return;
      }

      // Check if user has access
      const hasAccess = await checkUserAccess(user.email);

      if (!hasAccess) {
        // Sign out the user immediately
        await auth.signOut();
        setError(
          'Acceso denegado. Necesitas ser invitado por un administrador para acceder a este sistema.'
        );
        return;
      }

      // User has access, redirect to admin dashboard
      router.push('/admin');
    } catch (error: unknown) {
      console.error('❌ Login error:', error);

      const firebaseError = error as { code?: string; message?: string };

      // Log detailed error information for debugging
      console.error('Firebase error details:', {
        code: firebaseError.code,
        message: firebaseError.message,
        error: firebaseError,
      });

      switch (firebaseError.code) {
        case 'auth/internal-error':
          setError(
            'Error interno de Firebase. Esto puede deberse a una configuración incorrecta de Google OAuth. Contacta al administrador.'
          );
          break;
        case 'auth/popup-closed-by-user':
          setError('El inicio de sesión fue cancelado.');
          break;
        case 'auth/popup-blocked':
          setError(
            'La ventana emergente fue bloqueada por tu navegador. Por favor permite ventanas emergentes e intenta de nuevo.'
          );
          break;
        case 'auth/account-exists-with-different-credential':
          setError(
            'Ya existe una cuenta con este email usando un método de inicio de sesión diferente.'
          );
          break;
        case 'auth/cancelled-popup-request':
          setError('El inicio de sesión fue cancelado.');
          break;
        case 'auth/operation-not-allowed':
          setError(
            'El inicio de sesión con Google no está habilitado. Contacta al administrador.'
          );
          break;
        case 'auth/network-request-failed':
          setError(
            'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.'
          );
          break;
        default:
          setError(
            `Error al iniciar sesión: ${firebaseError.message || 'Error desconocido'}. Por favor intenta de nuevo.`
          );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${adminClasses.background} ${adminClasses.text} flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">
              Administración Veloz
            </h1>
          </div>
          <p className="text-muted-foreground">
            Inicia sesión con Google para acceder al sistema de gestión de
            contenido
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Inicio de Sesión de Administrador</CardTitle>
            <CardDescription>
              Solo los administradores invitados pueden acceder a este sistema
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
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Continuar con Google
                </>
              )}
            </Button>

            {/* Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Debes ser invitado por un administrador para acceder a este
                sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2024 Veloz. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
