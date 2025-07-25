import { ReactNode } from 'react';

interface TemplatesLayoutProps {
  children: ReactNode;
}

export default function TemplatesLayout({ children }: TemplatesLayoutProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
} 