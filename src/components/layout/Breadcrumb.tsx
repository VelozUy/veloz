'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
  ariaLabel?: string;
}

/**
 * Breadcrumb Component
 *
 * A navigation component that shows the user's current location within the site
 * hierarchy. Automatically generates breadcrumbs from the current path or accepts
 * custom items. Includes accessibility features and responsive design.
 */
export default function Breadcrumb({
  items,
  className = '',
  showHome = true,
  separator = <ChevronRight className="w-4 h-4" />,
  ariaLabel = 'Breadcrumb navigation',
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home if enabled
    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath,
        current: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Don't render if only home and no other items
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex items-center space-x-2 text-sm',
        'text-muted-foreground',
        className
      )}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span
                className="mx-2 text-muted-foreground/50"
                aria-hidden="true"
              >
                {separator}
              </span>
            )}

            {item.current ? (
              <span className="text-foreground font-medium" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'hover:text-foreground transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
                  'flex items-center space-x-1'
                )}
              >
                {item.label === 'Home' && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="text-muted-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
