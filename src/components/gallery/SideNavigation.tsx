'use client';

import { useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
}

interface SideNavigationProps {
  projects: Project[];
}

export default function SideNavigation({ projects }: SideNavigationProps) {
  const [activeProject, setActiveProject] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = projects.length - 1; i >= 0; i--) {
        const project = projects[i];
        const element = document.getElementById(`project-${project.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveProject(project.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [projects]);

  const scrollToProject = (projectId: string) => {
    const element = document.getElementById(`project-${projectId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate line height based on number of projects
  // Each project takes space-y-6 (1.5rem = 24px) + dot size (~8px) = ~32px per project
  const lineHeight = projects.length * 32; // 32px per project

  return (
    <nav className="fixed top-1/2 left-8 transform -translate-y-1/2 z-50 hidden md:block">
      <div className="flex items-start space-x-3">
        {/* Vertical line */}
        <div
          className="w-0.5 bg-muted-foreground/30 rounded-full"
          style={{ height: `${lineHeight}px` }}
        />

        {/* Project dots */}
        <div className="flex flex-col items-start space-y-6">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => scrollToProject(project.id)}
              className="group relative"
            >
              {/* Dot */}
              <div
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  activeProject === project.id
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/50 group-hover:bg-muted-foreground'
                }`}
              />

              {/* Project name on hover */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <span className="text-sm whitespace-nowrap bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-foreground shadow-sm">
                  {project.title}
                </span>
              </div>

              {/* Active indicator */}
              {activeProject === project.id && (
                <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
