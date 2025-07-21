import * as React from 'react';

import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

function Textarea({
  className,
  priority = 'top',
  ...props
}: React.ComponentProps<'textarea'> & { priority?: 'top' | 'mid' | 'low' }) {
  const priorityClasses = getPriorityClasses(priority);
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-none transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'placeholder:text-muted-foreground',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
