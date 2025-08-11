'use client';

import {
  FastForwardUnderline,
  CenterExpandUnderline,
  AnimatedUnderline,
} from '@/components/ui/animated-underline';
import { cn } from '@/lib/utils';

export default function HoverAnimationsDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Hover Animation Showcase
          </h1>
          <p className="text-lg text-muted-foreground">
            Demonstrating the new left-to-right underline animations that create
            a fast, forward-moving feel
          </p>
        </div>

        {/* Fast Forward Underline Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b pb-2">
            Fast Forward Underline (Left → Right)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Home',
              'About',
              'Gallery',
              'Contact',
              'Our Work',
              'Services',
            ].map(item => (
              <div
                key={item}
                className="group relative p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
              >
                <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                  {item}
                </span>
                <FastForwardUnderline isActive={false} />
              </div>
            ))}
          </div>
        </section>

        {/* Center Expand Underline Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b pb-2">
            Center Expand Underline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Projects', 'Portfolio', 'Team', 'Blog', 'News', 'Events'].map(
              item => (
                <div
                  key={item}
                  className="group relative p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {item}
                  </span>
                  <CenterExpandUnderline isActive={false} />
                </div>
              )
            )}
          </div>
        </section>

        {/* Custom Animations Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b pb-2">
            Custom Animation Variations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right to Left */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Right to Left
              </h3>
              <div className="space-y-2">
                {['Feature 1', 'Feature 2', 'Feature 3'].map(item => (
                  <div
                    key={item}
                    className="group relative p-3 border border-border rounded cursor-pointer"
                  >
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {item}
                    </span>
                    <AnimatedUnderline
                      direction="right-to-left"
                      duration="fast"
                      className="absolute bottom-0 right-0 h-0.5 bg-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Slow Animation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Slow Animation
              </h3>
              <div className="space-y-2">
                {['Option A', 'Option B', 'Option C'].map(item => (
                  <div
                    key={item}
                    className="group relative p-3 border border-border rounded cursor-pointer"
                  >
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {item}
                    </span>
                    <AnimatedUnderline
                      direction="left-to-right"
                      duration="slow"
                      className="absolute bottom-0 left-0 h-0.5 bg-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Active States Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b pb-2">
            Active States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative p-4 border border-primary rounded-lg cursor-pointer">
              <span className="text-lg font-medium text-primary">
                Active Item
              </span>
              <FastForwardUnderline isActive={true} />
            </div>
            <div className="group relative p-4 border border-border rounded-lg cursor-pointer">
              <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                Hover Item
              </span>
              <FastForwardUnderline isActive={false} />
            </div>
            <div className="group relative p-4 border border-border rounded-lg cursor-pointer">
              <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                Normal Item
              </span>
              <FastForwardUnderline isActive={false} />
            </div>
          </div>
        </section>

        {/* Color Variations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b pb-2">
            Color Variations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative p-3 border border-border rounded cursor-pointer">
              <span className="text-foreground group-hover:text-primary transition-colors">
                Primary
              </span>
              <FastForwardUnderline color="primary" />
            </div>
            <div className="group relative p-3 border border-border rounded cursor-pointer">
              <span className="text-secondary-foreground group-hover:text-secondary transition-colors">
                Secondary
              </span>
              <FastForwardUnderline />
            </div>
            <div className="group relative p-3 border border-border rounded cursor-pointer">
              <span className="text-accent-foreground group-hover:text-accent transition-colors">
                Accent
              </span>
              <FastForwardUnderline />
            </div>
            <div className="group relative p-3 border border-border rounded cursor-pointer">
              <span className="text-muted-foreground group-hover:text-muted transition-colors">
                Muted
              </span>
              <FastForwardUnderline />
            </div>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="space-y-6 bg-muted/50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-foreground">
            Usage Instructions
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-foreground mb-2">
                Fast Forward Underline (Recommended)
              </h3>
              <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                {`<div className="group relative">
  <span>Your Link Text</span>
  <FastForwardUnderline isActive={isActive} />
</div>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">
                Custom Animation
              </h3>
              <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                {`<div className="group relative">
  <span>Your Link Text</span>
  <AnimatedUnderline
    direction="left-to-right"
    duration="fast"
    color="primary"
  />
</div>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Left-to-right animation creates forward momentum</li>
                <li>Fast duration (200ms) for responsive feel</li>
                <li>Active states show permanent underline</li>
                <li>Customizable colors and directions</li>
                <li>Accessible with proper ARIA support</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
