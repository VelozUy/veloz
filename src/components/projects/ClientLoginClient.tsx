'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Users,
  Shield,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!email || !password) {
        setError('Por favor completa todos los campos');
        return;
      }

      if (!email.includes('@')) {
        setError('Por favor ingresa un email válido');
        return;
      }

      // Simulate authentication (replace with actual auth logic)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password combination
      // In production, this would validate against your authentication system
      if (email && password) {
        setSuccess('Inicio de sesión exitoso. Redirigiendo...');

        // Redirect to client portal after successful login
        setTimeout(() => {
          router.push('/client');
        }, 1500);
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/projects"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Proceso
          </Link>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary text-primary-foreground">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Acceso Clientes
          </h1>
          <p className="text-muted-foreground">
            Ingresa tus credenciales para acceder a tu proyecto
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Acceder
                  </>
                )}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground block"
              >
                ¿No tienes acceso? Contacta con nosotros
              </Link>
              <Link
                href="/projects"
                className="text-sm text-muted-foreground hover:text-foreground block"
              >
                Volver al proceso
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Conexión segura</span>
          </div>
        </div>
      </div>
    </div>
  );
}
