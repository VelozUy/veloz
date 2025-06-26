import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  items?: Array<{
    size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
    aspectRatio?: string;
    [key: string]: unknown;
  }>;
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  aspectRatio?: string;
  onClick?: () => void;
  index?: number;
}

interface BentoChildProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

// Predefined bento grid patterns for different screen sizes
const bentoPatterns = {
  mobile: [
    'small',
    'small',
    'medium',
    'small',
    'small',
    'wide',
    'small',
    'medium',
    'small',
    'small',
    'wide',
    'small',
  ],
  tablet: [
    'large',
    'small',
    'small',
    'small',
    'small',
    'medium',
    'small',
    'wide',
    'small',
    'small',
    'small',
    'tall',
    'medium',
    'small',
    'small',
    'wide',
    'small',
    'small',
  ],
  desktop: [
    'large',
    'small',
    'small',
    'medium',
    'small',
    'small',
    'small',
    'tall',
    'small',
    'wide',
    'small',
    'small',
    'small',
    'small',
    'medium',
    'small',
    'large',
    'small',
    'wide',
    'small',
    'small',
    'small',
    'tall',
    'small',
  ],
};

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-2',
  large: 'col-span-2 row-span-3', // Made less wide but taller
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-3', // Made taller for portrait content
};

// Dynamic aspect ratio based styling with size variations
const getAspectRatioStyle = (
  aspectRatio: string,
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall'
) => {
  const baseAspectRatio = (() => {
    switch (aspectRatio) {
      case '9:16': // Portrait
        return '9/16';
      case '16:9': // Landscape
        return '16/9';
      case '1:1': // Square
        return '1/1';
      default:
        return '16/9';
    }
  })();

  // Simplified sizing - only use column spans to avoid row overlap issues
  const gridSpan = (() => {
    switch (size) {
      case 'large':
        return {
          gridColumn: 'span 2',
          width: '100%',
        };
      case 'wide':
        return {
          gridColumn: 'span 2',
          width: '100%',
        };
      case 'tall':
      case 'medium':
      case 'small':
      default:
        return {
          gridColumn: 'span 1',
          width: '100%',
        };
    }
  })();

  return {
    aspectRatio: baseAspectRatio,
    ...gridSpan,
  };
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const BentoItem: React.FC<BentoItemProps> = ({
  children,
  className,
  size = 'small',
  aspectRatio,
  onClick,
}) => {
  // Use aspect ratio styling if provided, otherwise fall back to size classes
  const dynamicStyle = aspectRatio
    ? getAspectRatioStyle(aspectRatio, size)
    : {};
  const useAspectRatio = !!aspectRatio;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        // Only use size classes if we're not using aspect ratio
        !useAspectRatio && sizeClasses[size],
        'group cursor-pointer overflow-hidden rounded-xl bg-card',
        'hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300',
        'hover:scale-[1.02] hover:-translate-y-1',
        'border border-border/50 hover:border-primary/20',
        // When using aspect ratio, ensure proper sizing
        useAspectRatio && 'w-full',
        className
      )}
      style={dynamicStyle}
      onClick={onClick}
      whileHover={{
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-full h-full">
        {children}
        {/* Subtle overlay for better hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
};

const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className,
  items,
}) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );

  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getPattern = () => bentoPatterns[screenSize];
  const pattern = getPattern();

  const getGridCols = () => {
    switch (screenSize) {
      case 'mobile':
        return 'grid-cols-2';
      case 'tablet':
        return 'grid-cols-3';
      case 'desktop':
        return 'grid-cols-4';
    }
  };

  // Check if we're using aspect ratio mode (when items have aspectRatio)
  const useAspectRatioMode = items && items.some(item => item.aspectRatio);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(
        'grid gap-4 p-4',
        useAspectRatioMode
          ? `${getGridCols()} auto-rows-[minmax(150px,auto)]` // Auto-sizing rows with minimum height
          : `auto-rows-[140px] ${getGridCols()}`, // Original bento grid
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null;

          // Use custom size from items array if provided, otherwise fall back to pattern
          const size =
            items && items[index]
              ? items[index].size
              : (pattern[index % pattern.length] as BentoItemProps['size']);

          // Get aspect ratio if available
          const aspectRatio =
            items && items[index]
              ? (items[index].aspectRatio as string)
              : undefined;

          const childProps = child.props as BentoChildProps;

          return (
            <BentoItem
              key={`bento-item-${index}`}
              size={size}
              aspectRatio={aspectRatio}
              index={index}
              onClick={childProps.onClick}
              className={childProps.className}
            >
              {childProps.children}
            </BentoItem>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export { BentoGrid, BentoItem };
