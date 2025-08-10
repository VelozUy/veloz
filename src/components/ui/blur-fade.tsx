'use client';

import {
  AnimatePresence,
  motion,
  useInView,
  UseInViewOptions,
  Variants,
  MotionProps,
} from 'motion/react';
import { useRef } from 'react';
import { getPriorityClasses } from '@/lib/utils';
import { cn } from '@/lib/utils';

type MarginType = UseInViewOptions['margin'];

interface BlurFadeProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  inViewMargin?: MarginType;
  threshold?: number;
  blur?: string;
  priority?: 'top' | 'mid' | 'low';
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = 'down',
  inViewMargin = '0px',
  threshold = 0.1,
  blur = '2px',
  priority = 'top',
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: inViewMargin,
    amount: threshold,
  });
  const defaultVariants: Variants = {
    hidden: {
      [direction === 'left' || direction === 'right' ? 'x' : 'y']:
        direction === 'right' || direction === 'down' ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [direction === 'left' || direction === 'right' ? 'x' : 'y']: 0,
      opacity: 1,
      filter: `blur(0px)`,
    },
  };
  const combinedVariants = variant || defaultVariants;
  const priorityClasses = getPriorityClasses(priority);
  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: 'easeOut',
        }}
        className={cn(
          priorityClasses.bg,
          priorityClasses.text,
          priorityClasses.border,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
