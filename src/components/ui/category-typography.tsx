'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';
import {
  EventCategory,
  getCategoryStyle,
  getCategoryDisplayName,
  getCategoryDescription,
} from '@/constants/categories';

interface CategoryTypographyProps {
  category: EventCategory;
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
  language?: 'es' | 'en' | 'pt';
}

export function CategoryTypography({
  category,
  variant = 'body',
  size = 'md',
  className = '',
  children,
  language = 'es',
}: CategoryTypographyProps) {
  const style = getCategoryStyle(category);

  // Get the appropriate font size class
  const fontSizeClass = style.typography.fontSize[size];

  // Get variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'title':
        return 'font-bold text-2xl md:text-3xl lg:text-4xl';
      case 'subtitle':
        return 'font-semibold text-lg md:text-xl lg:text-2xl';
      case 'body':
        return 'font-normal';
      case 'caption':
        return 'font-light text-sm';
      default:
        return 'font-normal';
    }
  };

  const baseClasses = [
    style.typography.fontFamily,
    style.typography.fontWeight,
    fontSizeClass,
    style.typography.letterSpacing,
    style.typography.lineHeight,
    style.colors.text,
    getVariantClasses(),
  ];

  return <span className={cn(baseClasses, className)}>{children}</span>;
}

interface CategoryBadgeProps {
  category: EventCategory;
  language?: 'es' | 'en' | 'pt';
  className?: string;
  showIcon?: boolean;
  showDescription?: boolean;
  priority?: 'top' | 'mid' | 'low';
}

export function CategoryBadge({
  category,
  language = 'es',
  className = '',
  showIcon = true,
  showDescription = false,
  priority = 'top',
}: CategoryBadgeProps) {
  const style = getCategoryStyle(category);
  const displayName = getCategoryDisplayName(category, language);
  const description = getCategoryDescription(category, language);
  const priorityClasses = getPriorityClasses(priority);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full',
        style.colors.background,
        style.colors.primary,
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
    >
      {showIcon && <span className="text-sm">{style.icon}</span>}
      <span
        className={cn(
          'text-sm font-medium',
          style.typography.fontFamily,
          style.typography.fontWeight,
          style.typography.letterSpacing
        )}
      >
        {displayName}
      </span>
      {showDescription && (
        <span
          className={cn(
            'text-xs opacity-75',
            style.typography.fontFamily,
            style.typography.fontWeight,
            style.typography.letterSpacing
          )}
        >
          {description}
        </span>
      )}
    </div>
  );
}

interface CategoryTitleProps {
  category: EventCategory;
  title: string;
  language?: 'es' | 'en' | 'pt';
  className?: string;
  showBadge?: boolean;
}

export function CategoryTitle({
  category,
  title,
  language = 'es',
  className = '',
  showBadge = true,
}: CategoryTitleProps) {
  const style = getCategoryStyle(category);

  return (
    <div className={cn('space-y-2', className)}>
      {showBadge && <CategoryBadge category={category} language={language} />}
      <CategoryTypography
        category={category}
        variant="title"
        size="xl"
        language={language}
      >
        {title}
      </CategoryTypography>
    </div>
  );
}

interface CategorySubtitleProps {
  category: EventCategory;
  subtitle: string;
  language?: 'es' | 'en' | 'pt';
  className?: string;
}

export function CategorySubtitle({
  category,
  subtitle,
  language = 'es',
  className = '',
}: CategorySubtitleProps) {
  return (
    <CategoryTypography
      category={category}
      variant="subtitle"
      size="lg"
      language={language}
      className={cn('opacity-90', className)}
    >
      {subtitle}
    </CategoryTypography>
  );
}

interface CategoryBodyProps {
  category: EventCategory;
  children: React.ReactNode;
  language?: 'es' | 'en' | 'pt';
  className?: string;
}

export function CategoryBody({
  category,
  children,
  language = 'es',
  className = '',
}: CategoryBodyProps) {
  return (
    <CategoryTypography
      category={category}
      variant="body"
      size="md"
      language={language}
      className={cn('leading-relaxed', className)}
    >
      {children}
    </CategoryTypography>
  );
}

interface CategoryCaptionProps {
  category: EventCategory;
  children: React.ReactNode;
  language?: 'es' | 'en' | 'pt';
  className?: string;
}

export function CategoryCaption({
  category,
  children,
  language = 'es',
  className = '',
}: CategoryCaptionProps) {
  return (
    <CategoryTypography
      category={category}
      variant="caption"
      size="sm"
      language={language}
      className={cn('opacity-75', className)}
    >
      {children}
    </CategoryTypography>
  );
}
