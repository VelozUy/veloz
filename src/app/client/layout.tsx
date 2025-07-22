'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  FolderOpen,
  MessageSquare,
  Download,
  Calendar,
  Settings,
  LogOut,
  User,
  Bell,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';

interface ClientUser {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  company?: string;
  projects: string[];
  lastLogin: Date;
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check if user is already logged in
    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      loadClientData(clientId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadClientData = async (clientId: string) => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        setUser(null);
        return;
      }
      
      const clientDoc = await getDoc(doc(db, 'clients', clientId));
      
      if (clientDoc.exists()) {
        const clientData = clientDoc.data() as ClientUser;
        setUser({ ...clientData, id: clientId });
      } else {
        // Invalid client ID, clear and redirect to login
        localStorage.removeItem('clientId');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const db = await getFirestoreService();
      if (!db) {
        alert('Service not available');
        return;
      }
      
      const clientsRef = collection(db, 'clients');
      const q = query(
        clientsRef,
        where('email', '==', loginForm.email),
        where('password', '==', loginForm.password) // In production, use proper auth
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const clientDoc = querySnapshot.docs[0];
        const clientData = clientDoc.data() as ClientUser;
        
        // Store client ID in localStorage
        localStorage.setItem('clientId', clientDoc.id);
        setUser({ ...clientData, id: clientDoc.id });
        
        // Update last login
        await updateDoc(doc(db, 'clients', clientDoc.id), {
          lastLogin: new Date(),
        });
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientId');
    setUser(null);
    router.push('/client');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow signup pages to render without authentication
  if (pathname?.startsWith('/client/signup')) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Client Portal</CardTitle>
            <p className="text-muted-foreground">
              Access your project updates and files
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Client Portal</h1>
              <Badge variant="secondary">Welcome, {user.name || user.fullName || 'Client'}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/client')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/client/projects')}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  My Projects
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/client/messages')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/client/files')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Files
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/client/calendar')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
                
                <Separator />
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/client/settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 