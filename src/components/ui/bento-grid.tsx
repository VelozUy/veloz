import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BlurFade } from './blur-fade';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  items?: Array<{
    size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
    aspectRatio?: string;
    [key: string]: unknown;
  }>;
  enableRandomLayout?: boolean;
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

// Utility function to shuffle array randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Smart size assignment based on aspect ratio and position to minimize gaps
const getOptimalSize = (
  aspectRatio: string,
  index: number,
  totalItems: number,
  screenSize: 'mobile' | 'tablet' | 'desktop'
): 'small' | 'medium' | 'large' | 'wide' | 'tall' => {
  // Base probabilities for each size to ensure variety and space filling
  const sizeProbabilities = {
    mobile: {
      small: 0.5,
      medium: 0.3,
      wide: 0.2,
      tall: 0,
      large: 0,
    },
    tablet: {
      small: 0.4,
      medium: 0.25,
      wide: 0.15,
      tall: 0.1,
      large: 0.1,
    },
    desktop: {
      small: 0.35,
      medium: 0.25,
      wide: 0.15,
      tall: 0.15,
      large: 0.1,
    },
  };

  const probs = sizeProbabilities[screenSize];

  // Adjust size based on aspect ratio for better fitting
  switch (aspectRatio) {
    case '9:16': // Portrait
      // Portrait images work better as tall or medium
      const portraitOptions: Array<{
        size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
        weight: number;
      }> = [
        { size: 'tall', weight: 0.4 },
        { size: 'medium', weight: 0.35 },
        { size: 'small', weight: 0.25 },
      ];
      return weightedRandomSelect(portraitOptions);

    case '16:9': // Landscape
      // Landscape images work better as wide or large
      const landscapeOptions: Array<{
        size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
        weight: number;
      }> = [
        { size: 'wide', weight: 0.35 },
        { size: 'medium', weight: 0.3 },
        { size: 'large', weight: screenSize === 'desktop' ? 0.2 : 0.1 },
        { size: 'small', weight: 0.15 },
      ];
      return weightedRandomSelect(landscapeOptions);

    case '1:1': // Square
      // Square images work well in any size
      const squareOptions: Array<{
        size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
        weight: number;
      }> = [
        { size: 'medium', weight: 0.35 },
        { size: 'small', weight: 0.3 },
        { size: 'large', weight: screenSize === 'desktop' ? 0.15 : 0.1 },
        { size: 'wide', weight: 0.1 },
        { size: 'tall', weight: 0.1 },
      ];
      return weightedRandomSelect(squareOptions);

    default:
      // Default distribution for unknown aspect ratios
      const defaultOptions: Array<{
        size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
        weight: number;
      }> = [
        { size: 'medium', weight: probs.medium },
        { size: 'small', weight: probs.small },
        { size: 'wide', weight: probs.wide },
        { size: 'tall', weight: probs.tall },
        { size: 'large', weight: probs.large },
      ];
      return weightedRandomSelect(defaultOptions);
  }
};

// Helper function for weighted random selection
const weightedRandomSelect = (
  options: Array<{
    size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
    weight: number;
  }>
): 'small' | 'medium' | 'large' | 'wide' | 'tall' => {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      return option.size;
    }
  }

  // Fallback to first option
  return options[0].size;
};

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-2',
  large: 'col-span-2 row-span-3',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-3',
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

  // Optimize grid spanning based on size
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

// Animation variants removed - using BlurFade component instead

const BentoItem: React.FC<BentoItemProps> = ({
  children,
  className,
  size = 'small',
  aspectRatio,
  onClick,
  index = 0,
}) => {
  // Use aspect ratio styling if provided, otherwise fall back to size classes
  const dynamicStyle = aspectRatio
    ? getAspectRatioStyle(aspectRatio, size)
    : {};
  const useAspectRatio = !!aspectRatio;

  return (
    <BlurFade
      delay={index * 0.02} // Stagger animation based on index
      duration={0.15}
      direction="up"
      inViewMargin="0px" // Trigger exactly when entering viewport
      threshold={0.05} // Require 5% of element to be visible
      className={cn(
        // Only use size classes if we're not using aspect ratio
        !useAspectRatio && sizeClasses[size],
        'w-full',
        className
      )}
      style={dynamicStyle}
    >
      <motion.div
        className={cn(
          'relative w-full h-full group cursor-pointer overflow-hidden rounded-xl bg-card',
          'hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300',
          'hover:scale-[1.02] hover:-translate-y-1',
          'border border-border/50 hover:border-primary/20'
        )}
        onClick={onClick}
        whileHover={{
          scale: 1.02,
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
        {/* Subtle overlay for better hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </BlurFade>
  );
};

const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className,
  items,
  enableRandomLayout = false,
}) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Prevent hydration mismatch by only enabling random layout after hydration
  useEffect(() => {
    setIsHydrated(true);

    const updateScreenSize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          setScreenSize('mobile');
        } else if (window.innerWidth < 1024) {
          setScreenSize('tablet');
        } else {
          setScreenSize('desktop');
        }
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

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

  // Create randomized and optimized layout - only after hydration to prevent mismatch
  const optimizedItems = useMemo(() => {
    if (!items || !enableRandomLayout || !isHydrated) return null;

    // Shuffle items for random order
    const shuffledItems = shuffleArray(items);

    // Assign optimal sizes based on aspect ratio and position
    return shuffledItems.map((item, index) => ({
      ...item,
      originalIndex: items.indexOf(item), // Keep track of original index for children mapping
      size: getOptimalSize(
        item.aspectRatio || '16:9',
        index,
        shuffledItems.length,
        screenSize
      ),
    }));
  }, [items, enableRandomLayout, screenSize, isHydrated]);

  return (
    <div
      className={cn(
        'grid gap-3 p-4', // Smaller gap for better space utilization
        useAspectRatioMode
          ? `${getGridCols()} auto-rows-[minmax(120px,auto)]` // Smaller minimum height
          : `auto-rows-[120px] ${getGridCols()}`, // Smaller row height
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null;

          let size: BentoItemProps['size'] = 'small';
          let aspectRatio: string | undefined;

          if (optimizedItems && enableRandomLayout && isHydrated) {
            // Use optimized random layout only after hydration
            const optimizedItem = optimizedItems.find(
              item => item.originalIndex === index
            );
            if (optimizedItem) {
              size = optimizedItem.size;
              aspectRatio = optimizedItem.aspectRatio;
            }
          } else if (items && items[index]) {
            // Use provided items array
            size = items[index].size;
            aspectRatio = items[index].aspectRatio as string;
          }

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
    </div>
  );
};

export { BentoGrid, BentoItem };
