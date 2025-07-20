import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-none hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90',
        outline:
          'border border-border bg-transparent text-foreground shadow-none hover:bg-accent hover:text-accent-foreground',
        secondary:
          'border border-border bg-transparent text-foreground shadow-none hover:bg-accent hover:text-accent-foreground',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  priority = 'top',
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    priority?: 'top' | 'mid' | 'low';
  }) {
  const Comp = asChild ? Slot : 'button';
  const priorityClasses = getPriorityClasses(priority);

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
