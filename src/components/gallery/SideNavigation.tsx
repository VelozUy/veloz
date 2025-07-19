'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './SideNavigation.css';

interface Project {
  id: string;
  title: string;
}

interface SideNavigationProps {
  projects: Project[];
}

export default function SideNavigation({ projects }: SideNavigationProps) {
  const [activeProject, setActiveProject] = useState<string>('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Smart positioning based on content density
  const getSmartPosition = useCallback(() => {
    if (typeof window === 'undefined') return { left: '2rem', top: '50%' };

    const viewportHeight = window.innerHeight;
    const projectCount = projects.length;
    const navHeight = projectCount * 48; // Approximate height per project

    // Adjust position if navigation would overflow
    if (navHeight > viewportHeight * 0.8) {
      return { left: '1rem', top: '2rem', transform: 'none' };
    }

    return { left: '2rem', top: '50%', transform: 'translateY(-50%)' };
  }, [projects.length]);

  // Scroll tracking with improved performance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let newActiveProject = '';

      for (let i = projects.length - 1; i >= 0; i--) {
        const project = projects[i];
        const element = document.getElementById(`project-${project.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            newActiveProject = project.id;
            break;
          }
        }
      }

      if (newActiveProject !== activeProject) {
        setActiveProject(newActiveProject);
      }
    };

    // Throttled scroll handler for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [projects, activeProject]);

  const scrollToProject = useCallback(
    (projectId: string) => {
      const element = document.getElementById(`project-${projectId}`);
      if (element) {
        element.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    },
    [reducedMotion]
  );

  // Calculate progress for line animation
  const getProgress = () => {
    if (!activeProject) return 0;
    const activeIndex = projects.findIndex(p => p.id === activeProject);
    return activeIndex >= 0 ? (activeIndex + 1) / projects.length : 0;
  };

  const progress = getProgress();
  const smartPosition = getSmartPosition();

  return (
    <nav
      ref={navRef}
      className="fixed z-50 hidden md:block"
      style={{
        left: smartPosition.left,
        top: smartPosition.top,
        transform: smartPosition.transform,
      }}
      role="navigation"
      aria-label="Gallery navigation"
    >
      <div className="flex items-start space-x-3">
        {/* Progressive Line with Animation */}
        <div className="relative">
          <div
            className="w-0.5 bg-muted-foreground/30 rounded-full"
            style={{ height: `${(projects.length - 1) * 45}px` }}
          />
          <motion.div
            className="absolute top-0 left-0 w-0.5 bg-primary rounded-full origin-top"
            style={{ height: `${(projects.length - 1) * 45}px` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: progress }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: 'easeOut',
            }}
          />
        </div>

        {/* Project Navigation Dots */}
        <div
          className="flex flex-col items-start space-y-6"
          style={{ paddingTop: '12px', paddingBottom: '12px' }}
        >
          {projects.map((project, index) => (
            <motion.button
              key={project.id}
              onClick={() => scrollToProject(project.id)}
              className="group relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-full nav-dot"
              whileHover={{ scale: reducedMotion ? 1 : 1.1 }}
              whileTap={{ scale: reducedMotion ? 1 : 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.3,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              aria-label={`Navigate to ${project.title}`}
              aria-current={activeProject === project.id ? 'true' : 'false'}
            >
              {/* Enhanced Dot with Micro-interactions */}
              <motion.div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeProject === project.id
                    ? 'bg-primary shadow-lg shadow-primary/50 pulse-active'
                    : 'bg-muted-foreground/50 group-hover:bg-muted-foreground'
                }`}
                animate={{
                  scale: activeProject === project.id ? [1, 1.2, 1] : 1,
                  boxShadow:
                    activeProject === project.id
                      ? '0 0 20px rgba(var(--primary), 0.5)'
                      : '0 0 0px rgba(var(--primary), 0)',
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.6,
                  ease: 'easeInOut',
                }}
              />

              {/* Ripple Effect on Click */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20 ripple-effect"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 2, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.4 }}
              />

              {/* Enhanced Project Name Tooltip */}
              <motion.div
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10"
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <div className="bg-background/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-border nav-tooltip">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {project.title}
                  </span>
                  {/* Progress indicator */}
                  <div className="mt-1 w-full bg-muted rounded-full h-1">
                    <motion.div
                      className="bg-primary h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((index + 1) / projects.length) * 100}%`,
                      }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.8,
                        delay: 0.2,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accessibility: Keyboard Navigation Instructions */}
      <div className="sr-only">
        <p>
          Use Tab to navigate between projects, Enter to select, and arrow keys
          to move.
        </p>
      </div>
    </nav>
  );
}
