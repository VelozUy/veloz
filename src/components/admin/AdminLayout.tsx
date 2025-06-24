'use client';

import { ReactNode } from 'react';
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
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const navigation = [
  { name: 'Panel Principal', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', icon: User },
  { name: 'Proyectos', href: '/admin/projects', icon: FolderOpen },
  { name: 'Página de Inicio', href: '/admin/homepage', icon: Home },
  { name: 'Preguntas Frecuentes', href: '/admin/faqs', icon: HelpCircle },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <LayoutDashboard className="w-8 h-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-primary">Veloz Admin</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map(item => {
                const Icon = item.icon;
                const isActive =
                  typeof window !== 'undefined' &&
                  window.location.pathname === item.href;

                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={`w-5 h-5 mr-3 ${
                          isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t">
            <div className="flex items-center mb-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors mr-4"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-foreground">
                {title || 'Panel de Administración'}
              </h2>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                {user.email}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
