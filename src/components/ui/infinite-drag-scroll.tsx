import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  wrap,
} from 'motion/react';
import {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  createContext,
} from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

//Types
type variants = 'default' | 'masonry' | 'polaroid';

// Create Context
const GridVariantContext = createContext<variants | undefined>(undefined);

//Motion Variants
const rowVariants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: () => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: Math.random() + 1.5,
      duration: 1.4,
      ease: cubicBezier(0.18, 0.71, 0.11, 1),
    },
  }),
};

export const DraggableContainer = ({
  className,
  children,
  variant,
  priority = 'top',
}: {
  className?: string;
  children: React.ReactNode;
  variant?: variants;
  priority?: 'top' | 'mid' | 'low';
}) => {
  const priorityClasses = getPriorityClasses(priority);
  return (
    <GridVariantContext.Provider value={variant}>
      <div
        className={cn(
          'w-full min-h-screen p-4',
          priorityClasses.bg,
          priorityClasses.text,
          priorityClasses.border,
          className
        )}
      >
        {children}
      </div>
    </GridVariantContext.Provider>
  );
};

export const GridItem = ({
  children,
  className,
  onClick,
  aspectRatio = '1:1',
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}) => {
  const variant = useContext(GridVariantContext);

  // Determine grid span based on aspect ratio
  const getGridSpan = (ratio: string) => {
    switch (ratio) {
      case '9:16': // Portrait - 1 column, 2 rows (tall)
        return 'col-span-1 row-span-2';
      case '16:9': // Landscape - 2 columns, 1 row (wide)
        return 'col-span-2 row-span-1';
      case '1:1': // Square - 1 column, 1 row
      default:
        return 'col-span-1 row-span-1';
    }
  };

  const gridItemStyles = cva(
    'overflow-hidden hover:cursor-pointer will-change-transform',
    {
      variants: {
        variant: {
          default: '',
          masonry: '',
          polaroid:
            'border-2 border-primary-foreground shadow-lg hover:shadow-xl transition-shadow',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    }
  );

  return (
    <motion.div
      className={cn(
        gridItemStyles({ variant, className }),
        getGridSpan(aspectRatio)
      )}
      variants={rowVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export const GridBody = memo(
  ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    const variant = useContext(GridVariantContext);

    const gridBodyStyles = cva(
      'grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 auto-rows-[120px] w-full gap-0',
      {
        variants: {
          variant: {
            default: 'gap-0',
            masonry: 'gap-0',
            polaroid: 'gap-0',
          },
        },
        defaultVariants: {
          variant: 'default',
        },
      }
    );

    return (
      <div className={cn(gridBodyStyles({ variant, className }))}>
        {children}
      </div>
    );
  }
);

GridBody.displayName = 'GridBody';
