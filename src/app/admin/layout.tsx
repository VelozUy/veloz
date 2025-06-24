'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface AdminRootLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
