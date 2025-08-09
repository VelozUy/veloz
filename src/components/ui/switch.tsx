'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" ref={ref} {...props} />
        <div
          className={cn(
            // Track
            'relative w-11 h-6 rounded-full bg-input transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring peer-checked:bg-primary',
            // Thumb
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-background after:transition-transform peer-checked:after:translate-x-5",
            className
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
