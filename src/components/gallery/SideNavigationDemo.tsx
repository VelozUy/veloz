'use client';

import { useState } from 'react';
import SideNavigation from './SideNavigation';

interface DemoProject {
  id: string;
  title: string;
}

const demoProjects: DemoProject[] = [
  { id: '1', title: 'Wedding Photography' },
  { id: '2', title: 'Corporate Events' },
  { id: '3', title: 'Portrait Sessions' },
  { id: '4', title: 'Product Photography' },
  { id: '5', title: 'Event Coverage' },
];

export default function SideNavigationDemo() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Demo Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border p-4">
        <h1 className="text-2xl font-bold text-foreground">
          Enhanced Side Navigation Demo
        </h1>
        <p className="text-muted-foreground mt-2">
          Features: Progressive Line Animation, Magnetic Effects, Parallax
          Movement, Smart Positioning, Micro-interactions, and Accessibility
        </p>
      </div>

      {/* Enhanced Side Navigation */}
      <SideNavigation projects={demoProjects} />

      {/* Demo Content Sections */}
      <div className="pt-20">
        {demoProjects.map(project => (
          <section
            key={project.id}
            id={`project-${project.id}`}
            className="min-h-screen flex items-center justify-center p-8"
            style={{
              background: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)`,
            }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-6xl font-bold text-foreground mb-8">
                {project.title}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                This is a demo section for {project.title.toLowerCase()}. Scroll
                through the sections to see the enhanced navigation in action.
              </p>

              {/* Demo Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Progressive Line
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    The line fills as you scroll through projects
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Magnetic Effect
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Navigation subtly moves toward your cursor
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Parallax Movement
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Active indicators move with mouse movement
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Smart Positioning
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Automatically adjusts based on content density
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Micro-interactions
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Smooth hover effects and ripple animations
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Accessibility
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Full keyboard navigation and screen reader support
                  </p>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="mt-12 text-center">
                <div className="inline-flex items-center space-x-2 text-muted-foreground">
                  <span className="text-sm">Scroll to continue</span>
                  <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="bg-card/90 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
          <h4 className="font-semibold text-foreground mb-2">
            Enhanced Features:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Progressive line animation</li>
            <li>• Magnetic attraction effects</li>
            <li>• Parallax movement</li>
            <li>• Smart positioning</li>
            <li>• Micro-interactions</li>
            <li>• Accessibility support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
