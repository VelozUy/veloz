'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground',
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-foreground transition-colors"
            aria-label="Inicio"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            {item.current ? (
              <span className="text-foreground font-medium" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Predefined breadcrumb configurations
export const breadcrumbConfigs = {
  contact: [{ name: 'Contacto', href: '/contact', current: true }],
  about: [{ name: 'Sobre Nosotros', href: '/about', current: true }],
  ourWork: [{ name: 'Nuestro Trabajo', href: '/our-work', current: true }],
  project: (projectName: string, projectSlug: string) => [
    { name: 'Nuestro Trabajo', href: '/our-work' },
    { name: projectName, href: `/our-work/${projectSlug}`, current: true },
  ],
  category: (categoryName: string, categorySlug: string) => [
    { name: 'Nuestro Trabajo', href: '/our-work' },
    {
      name: categoryName,
      href: `/our-work/categories/${categorySlug}`,
      current: true,
    },
  ],
};
