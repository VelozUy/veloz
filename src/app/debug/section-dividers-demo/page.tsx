import React from 'react';
import { getDesignElements, type DesignElement } from '@/lib/design-elements';

export const dynamic = 'error';

export default function SectionDividersDemoPage() {
  const elements = getDesignElements();
  const topDivider =
    elements.find((e: DesignElement) =>
      /circle|target|ruller|check|board/i.test(e.name)
    ) || elements[0];
  const bottomDivider =
    elements.find((e: DesignElement) =>
      /world|circles|horizontal/i.test(e.name)
    ) || elements[1];

  return (
    <div className="px-4 md:px-16 py-12 space-y-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Section Dividers Demo
        </h1>
        <p className="text-sm text-muted-foreground">
          Using SVGs as ornamental dividers between sections
        </p>
      </header>

      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">Top Divider</h2>
        <p className="text-muted-foreground mb-6">
          An SVG as a decorative top divider.
        </p>

        <div className="relative z-10 space-y-2">
          <p>
            This section uses an SVG at the top edge to separate content areas
            while maintaining brand flair.
          </p>
        </div>

        {topDivider && (
          <div className="pointer-events-none absolute inset-x-0 -top-6 opacity-60">
            <div
              className="mx-auto w-2/3"
              dangerouslySetInnerHTML={{ __html: topDivider.svgContent }}
            />
          </div>
        )}
      </section>

      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">Bottom Divider</h2>
        <p className="text-muted-foreground mb-6">
          An SVG as a decorative bottom divider.
        </p>

        <div className="relative z-10 space-y-2">
          <p>
            You can mirror or rotate elements as needed, ensuring they do not
            hinder readability or interaction.
          </p>
        </div>

        {bottomDivider && (
          <div className="pointer-events-none absolute inset-x-0 -bottom-6 opacity-60 rotate-180">
            <div
              className="mx-auto w-2/3"
              dangerouslySetInnerHTML={{ __html: bottomDivider.svgContent }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
