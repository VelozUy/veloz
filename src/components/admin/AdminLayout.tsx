'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Home,
  HelpCircle,
  LogOut,
  Menu,
  X,
  User,
  FolderOpen,
  Mail,
  FileText,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import BuildTrigger from './BuildTrigger';
import { useAdminBackground } from '@/hooks/useBackground';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const navigation = [
  { name: 'Panel Principal', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', icon: User },
  { name: 'Proyectos', href: '/admin/projects', icon: FolderOpen },
  { name: 'Gestión de Equipo', href: '/admin/crew', icon: Users },
  { name: 'Página de Inicio', href: '/admin/homepage', icon: Home },
  { name: 'Página Sobre Nosotros', href: '/admin/about', icon: FileText },
  { name: 'Formularios', href: '/admin/forms', icon: FileText },
  { name: 'Preguntas Frecuentes', href: '/admin/faqs', icon: HelpCircle },
  { name: 'Mensajes de Contacto', href: '/admin/contacts', icon: Mail },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use the new background system for admin sections
  const { classes: adminClasses } = useAdminBackground();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔍 AdminLayout Auth State:', {
      user: !!user,
      loading,
      userEmail: user?.email,
    });
    if (!user && !loading) {
      console.log('🔄 Redirecting to login - no user and not loading');
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${adminClasses.background} ${adminClasses.text}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-body-sm text-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Using theme variables */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <LayoutDashboard className="w-6 h-6 text-sidebar-foreground mr-2" />
              <h1 className="text-body-lg font-body text-sidebar-foreground">
                Veloz Admin
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-none hover:bg-sidebar-accent/20 transition-colors text-sidebar-foreground"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation - Using theme variables */}
          <nav className="flex-1 p-3">
            <ul className="space-y-1">
              {navigation.map(item => {
                const Icon = item.icon;
                const isActive =
                  typeof window !== 'undefined' &&
                  window.location.pathname === item.href;

                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors group text-sm ${
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm border border-sidebar-primary/30'
                          : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                      aria-label={`Navigate to ${item.name}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 mr-2.5 ${
                          isActive
                            ? 'text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground group-hover:text-sidebar-foreground'
                        }`}
                      />
                      <span className="font-medium text-body-sm">
                        {item.name}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section - Using theme variables */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center mb-3 p-2 rounded-md bg-muted">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-2">
                <User className="w-3 h-3 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-xs font-medium text-muted-foreground truncate">
                  {user.email}
                </p>
                <p className="text-body-xs text-muted-foreground">
                  Administrador
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full text-xs border-border text-foreground hover:bg-accent"
              aria-label="Sign out of admin panel"
            >
              <LogOut className="w-3 h-3 mr-1.5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Using theme variables */}
      <div className="lg:pl-56">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-none hover:bg-accent/80 transition-colors mr-3 text-card-foreground"
                aria-label="Open sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
              <h2 className="text-body-lg font-body text-card-foreground">
                {title || 'Panel de Administración'}
              </h2>
            </div>
            <div className="hidden lg:flex items-center space-x-3">
              <BuildTrigger variant="outline" size="sm" className="text-xs" />
              <div className="flex items-center text-body-xs text-muted-foreground">
                <User className="w-3 h-3 mr-1.5" />
                {user.email}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Using theme variables */}
        <main className="p-4 bg-background text-foreground min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
