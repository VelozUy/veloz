import * as React from 'react';
import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { priority?: 'top' | 'mid' | 'low' }
>(({ className, priority = 'top', ...props }, ref) => {
  const priorityClasses = getPriorityClasses(priority);
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
      {...props}
    />
  );
});
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt = '', ...props }, ref) => (
  <img
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    alt={alt}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
