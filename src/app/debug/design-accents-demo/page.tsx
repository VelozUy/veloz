import React from 'react';
import { getDesignElements } from '@/lib/design-elements';

export const dynamic = 'error';

export default function DesignAccentsDemoPage() {
  const elements = getDesignElements();
  const first = elements[0];
  const second = elements[1];
  const third = elements[2];

  return (
    <div className="px-4 md:px-16 py-12 space-y-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Design Accents Demo
        </h1>
        <p className="text-sm text-muted-foreground">
          Decorative usage of design manual SVGs
        </p>
      </div>

      {/* Corner accents */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">Corner Accents</h2>
        <p className="text-muted-foreground mb-6">
          Using SVGs absolutely positioned in corners.
        </p>

        <div className="relative z-10 space-y-2">
          <p>
            This card demonstrates using design elements positioned in corners.
            Content remains readable while the elements add visual interest.
          </p>
          <p>
            Ensure sufficient contrast and avoid obstructing interactive
            elements.
          </p>
        </div>

        {first && (
          <div className="pointer-events-none absolute -top-6 -left-6 opacity-50 rotate-[-6deg]">
            <div dangerouslySetInnerHTML={{ __html: first.svgContent }} />
          </div>
        )}
        {second && (
          <div className="pointer-events-none absolute -bottom-8 -right-8 opacity-40 rotate-[12deg]">
            <div dangerouslySetInnerHTML={{ __html: second.svgContent }} />
          </div>
        )}
      </section>

      {/* Background watermark */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">Background Watermark</h2>
        <p className="text-muted-foreground mb-6">
          Large, low-opacity element behind content.
        </p>

        <div className="relative z-10 space-y-2">
          <p>
            Place large SVG elements behind content with reduced opacity to
            create a subtle watermark effect.
          </p>
          <p>
            Consider responsive visibility and performance when using complex
            SVGs.
          </p>
        </div>

        {third && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 scale-[2]">
            <div dangerouslySetInnerHTML={{ __html: third.svgContent }} />
          </div>
        )}
      </section>

      {/* Section edge strip */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">Edge Strip Accent</h2>
        <p className="text-muted-foreground mb-6">
          Thin strip at the top or side using an SVG.
        </p>

        <div className="relative z-10 space-y-2">
          <p>
            Use narrow, repeating-friendly SVGs as decorative strips on section
            edges. Keep accessibility in mind.
          </p>
        </div>

        {second && (
          <div className="pointer-events-none absolute inset-x-0 -top-2 opacity-70">
            <div
              className="mx-auto w-1/2"
              dangerouslySetInnerHTML={{ __html: second.svgContent }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
