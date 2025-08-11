import React from 'react';
import { getDesignElements, type DesignElement } from '@/lib/design-elements';

export const dynamic = 'error';

function pick(
  elements: DesignElement[],
  regex: RegExp,
  fallbackIndex: number
): DesignElement | undefined {
  return elements.find(e => regex.test(e.name)) || elements[fallbackIndex];
}

export default function SectionDividersDemoPage() {
  const elements = getDesignElements();

  const circlesHorizontal = pick(elements, /circles-?horizontal/i, 0);
  const circlesVertical = pick(elements, /circles-?vertical/i, 1);
  const barcode = pick(elements, /barcode/i, 2);
  const checkBoard = pick(elements, /check-?board/i, 3);
  const target = pick(elements, /target|circle/i, 4);
  const world = pick(elements, /world/i, 5);
  const ruller = pick(elements, /ruller/i, 6);

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

      {/* 01 — Top Divider (full width) */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">
          01 — Top Divider (Full Width)
        </h2>
        <p className="text-muted-foreground mb-6">
          An SVG used as a decorative top divider.
        </p>
        <div className="relative z-10 space-y-2">
          <p>
            The divider spans the full width of the section and remains behind
            the content.
          </p>
        </div>
        {circlesHorizontal && (
          <div className="pointer-events-none absolute inset-x-0 top-0 opacity-70">
            <div
              className="mx-auto w-full h-16 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: circlesHorizontal.svgContent }}
            />
          </div>
        )}
      </section>

      {/* 02 — Bottom Divider (mirrored) */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">
          02 — Bottom Divider (Mirrored)
        </h2>
        <p className="text-muted-foreground mb-6">
          An SVG as a decorative bottom divider, mirrored.
        </p>
        <div className="relative z-10 space-y-2">
          <p>Mirroring allows reuse of the same asset for a bottom edge.</p>
        </div>
        {circlesHorizontal && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-70 rotate-180">
            <div
              className="mx-auto w-full h-16 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: circlesHorizontal.svgContent }}
            />
          </div>
        )}
      </section>

      {/* 03 — Center Divider */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden space-y-6">
        <h2 className="text-xl font-medium">03 — Center Divider</h2>
        <p>A centered divider between two blocks of content.</p>
        {barcode && (
          <div
            className="pointer-events-none mx-auto w-2/3 h-10 opacity-70 [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: barcode.svgContent }}
          />
        )}
        <p className="text-muted-foreground">
          This approach works well for separating paragraphs or lists.
        </p>
      </section>

      {/* 04 — Double Divider (Top & Bottom) */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">
          04 — Double Divider (Top & Bottom)
        </h2>
        <p className="text-muted-foreground mb-6">
          Top and bottom dividers framing the content.
        </p>
        <div className="relative z-10 space-y-2">
          <p>Use matching or contrasting elements to frame a section.</p>
        </div>
        {checkBoard && (
          <div className="pointer-events-none absolute inset-x-0 top-0 opacity-60">
            <div
              className="w-full h-12 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: checkBoard.svgContent }}
            />
          </div>
        )}
        {checkBoard && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-60 rotate-180">
            <div
              className="w-full h-12 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: checkBoard.svgContent }}
            />
          </div>
        )}
      </section>

      {/* 05 — Inset Divider (Inside content) */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden space-y-4">
        <h2 className="text-xl font-medium">
          05 — Inset Divider (Inside Content)
        </h2>
        <p>Place a small divider just below a heading.</p>
        {target && (
          <div className="relative h-8">
            <div
              className="absolute left-0 top-0 w-24 h-8 opacity-70 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: target.svgContent }}
            />
          </div>
        )}
        <p className="text-muted-foreground">
          Keep it subtle so the heading remains the focal point.
        </p>
      </section>

      {/* 06 — Full Bleed Divider (outside padding) */}
      <section className="relative rounded-xl border bg-card p-0 overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-medium mb-2">06 — Full Bleed Divider</h2>
          <p className="text-muted-foreground mb-6">
            Extends edge-to-edge without inner padding.
          </p>
          <p>Use for strong visual separation between large sections.</p>
        </div>
        {barcode && (
          <div className="pointer-events-none opacity-80">
            <div
              className="w-full h-14 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: barcode.svgContent }}
            />
          </div>
        )}
      </section>

      {/* 07 — Vertical Divider (Left) */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">
          07 — Vertical Divider (Left)
        </h2>
        <p className="text-muted-foreground mb-6">
          A vertical ornament that visually divides content.
        </p>
        <div className="relative z-10 space-y-2">
          <p>Useful for two-column layouts or sidebars.</p>
        </div>
        {circlesVertical && (
          <div className="pointer-events-none absolute left-0 top-6 bottom-6 opacity-60">
            <div
              className="w-8 h-full [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: circlesVertical.svgContent }}
            />
          </div>
        )}
      </section>

      {/* 08 — Vertical Divider (Right, Ruler) */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">
          08 — Vertical Divider (Right)
        </h2>
        <p className="text-muted-foreground mb-6">
          Right-aligned vertical ornament using a ruler-like asset.
        </p>
        <div className="relative z-10 space-y-2">
          <p>Pairs nicely with dense content blocks to add structure.</p>
        </div>
        {ruller && (
          <div className="pointer-events-none absolute right-0 top-6 bottom-6 opacity-60">
            <div
              className="w-8 h-full [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: ruller.svgContent }}
            />
          </div>
        )}
      </section>

      {/* 09 — World Motif Divider */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden space-y-6">
        <h2 className="text-xl font-medium">09 — World Motif Divider</h2>
        <p>Use a themed asset centered between content blocks.</p>
        {world && (
          <div
            className="pointer-events-none mx-auto w-1/2 h-16 opacity-70 [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: world.svgContent }}
          />
        )}
        <p className="text-muted-foreground">
          Great for section transitions in brand storytelling pages.
        </p>
      </section>

      {/* 10 — Layered Dividers */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">10 — Layered Dividers</h2>
        <p className="text-muted-foreground mb-6">
          Combine two elements for a richer separator.
        </p>
        {circlesHorizontal && (
          <div className="pointer-events-none absolute inset-x-0 top-0 opacity-60">
            <div
              className="w-full h-10 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: circlesHorizontal.svgContent }}
            />
          </div>
        )}
        {target && (
          <div className="pointer-events-none absolute inset-x-0 top-4 opacity-40">
            <div
              className="mx-auto w-40 h-10 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: target.svgContent }}
            />
          </div>
        )}
        <div className="relative z-10 pt-10">
          <p>
            Layering should be subtle to avoid clutter; adjust opacity and size.
          </p>
        </div>
      </section>

      {/* 11 — Checkboard Rule */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden space-y-6">
        <h2 className="text-xl font-medium">11 — Checkboard Rule</h2>
        {checkBoard && (
          <div
            className="pointer-events-none mx-auto w-full h-8 opacity-70 [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: checkBoard.svgContent }}
          />
        )}
        <p className="text-muted-foreground">
          Thin, understated rule between dense content blocks.
        </p>
      </section>

      {/* 12 — Compact Top Divider */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">12 — Compact Top Divider</h2>
        <p className="text-muted-foreground mb-6">
          Smaller top divider for tight sections.
        </p>
        {barcode && (
          <div className="pointer-events-none absolute inset-x-0 top-0 opacity-70">
            <div
              className="w-full h-8 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: barcode.svgContent }}
            />
          </div>
        )}
        <div className="relative z-10 pt-6">
          <p>Use compact dividers when vertical space is limited.</p>
        </div>
      </section>
    </div>
  );
}
