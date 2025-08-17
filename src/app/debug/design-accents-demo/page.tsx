import React from 'react';
import { getDesignElements } from '@/lib/design-elements';

export const dynamic = 'error';

function pickByNameLike(
  name: string,
  elements: { name: string; svgContent: string }[]
) {
  const re = new RegExp(name, 'i');
  return elements.find(e => re.test(e.name));
}

export default function DesignAccentsDemoPage() {
  const elements = getDesignElements();
  const first = elements[0];
  const second = elements[1];
  const third = elements[2];
  const fourth = elements[3];
  const fifth = elements[4];
  const targetCircle =
    pickByNameLike('target-circle', elements) ||
    pickByNameLike('target', elements) ||
    first;

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

      {/* 01 Corner accents */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">01 — Corner Accents</h2>
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

      {/* 02 Background watermark */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">02 — Background Watermark</h2>
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

      {/* 03 Section edge strip */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">03 — Edge Strip Accent</h2>
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

      {/* 04 Side ornament */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">04 — Side Ornament</h2>
        <p className="text-muted-foreground mb-6">
          Vertical-center ornament on the left side.
        </p>

        <div className="relative z-10 space-y-2">
          <p>
            A subtle side ornament can frame content without clutter. Keep it
            partially off-canvas and low opacity.
          </p>
        </div>

        {fourth && (
          <div className="pointer-events-none absolute top-1/2 -left-8 -translate-y-1/2 opacity-40">
            <div
              className="scale-90"
              dangerouslySetInnerHTML={{ __html: fourth.svgContent }}
            />
          </div>
        )}
      </section>

      {/* 05 Heading underline ornament */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-6">
          05 — Heading Underline Ornament
        </h2>

        <div className="relative z-10">
          <h3 className="text-lg font-medium">Section Title</h3>
          {first && (
            <div className="pointer-events-none relative h-6 mt-1">
              <div
                className="absolute left-0 top-0 opacity-60 w-28"
                dangerouslySetInnerHTML={{ __html: first.svgContent }}
              />
            </div>
          )}
          <p className="mt-6 text-muted-foreground">
            Place a small SVG under a heading as a decorative underline. Size
            and opacity should not compete with the heading legibility.
          </p>
        </div>
      </section>

      {/* 06 Inline list bullets */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-4">06 — Inline List Bullets</h2>
        <ul className="space-y-3">
          {['First point', 'Second point', 'Third point'].map((text, idx) => (
            <li key={idx} className="flex items-start gap-3">
              {second && (
                <span
                  className="mt-1 inline-block w-4 h-4 opacity-70"
                  dangerouslySetInnerHTML={{ __html: second.svgContent }}
                />
              )}
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 07 Content divider */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden space-y-6">
        <h2 className="text-xl font-medium">07 — Content Divider</h2>
        <p>
          Use an SVG between content blocks as a decorative divider. Adjust
          width and opacity to keep the rhythm.
        </p>
        {third && (
          <div
            className="pointer-events-none mx-auto w-1/3 opacity-60"
            dangerouslySetInnerHTML={{ __html: third.svgContent }}
          />
        )}
        <p className="text-muted-foreground">
          Dividers help group content while keeping brand presence consistent
          across sections and pages.
        </p>
      </section>

      {/* 08 Button / CTA accent */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-4">08 — Button / CTA Accent</h2>
        <div className="relative inline-block">
          <button className="relative z-10 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
            Primary action
          </button>
          {fifth && (
            <div className="pointer-events-none absolute -bottom-3 -right-4 opacity-50 rotate-[8deg]">
              <div
                className="w-16"
                dangerouslySetInnerHTML={{ __html: fifth.svgContent }}
              />
            </div>
          )}
        </div>
        <p className="mt-6 text-muted-foreground text-sm">
          A small ornament near CTAs can draw attention subtly. Ensure focus
          states remain visible and unobstructed.
        </p>
      </section>

      {/* 09 Page Corner Targets (contained page demo) */}
      <section className="rounded-xl border bg-card p-0 overflow-visible">
        <div className="relative p-8">
          <h2 className="text-xl font-medium mb-2">09 — Page Corner Targets</h2>
          <p className="text-muted-foreground mb-6">
            A contained page-like area with target-circle elements in the
            top-left and bottom-right corners.
          </p>
          <div className="space-y-2 relative z-10">
            <p>
              This simulates placing brand targets at page corners without
              affecting interaction.
            </p>
          </div>

          {targetCircle && (
            <>
              <div className="pointer-events-none absolute -top-6 -left-6 opacity-30">
                <div
                  className="w-24 h-24 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: targetCircle.svgContent }}
                />
              </div>
              <div className="pointer-events-none absolute -bottom-8 -right-8 opacity-30">
                <div
                  className="w-28 h-28 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: targetCircle.svgContent }}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 10 Section Corner Targets (specific asset) */}
      <section className="relative rounded-xl border bg-card p-8 overflow-hidden">
        <h2 className="text-xl font-medium mb-2">
          10 — Section Corner Targets
        </h2>
        <p className="text-muted-foreground mb-6">
          Uses the target-circle asset explicitly in opposite corners of a
          section.
        </p>

        <div className="relative z-10 space-y-2">
          <p>Sized to avoid overlap with content and interactive controls.</p>
        </div>

        {targetCircle && (
          <>
            <div className="pointer-events-none absolute -top-5 -left-5 opacity-40">
              <div
                className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: targetCircle.svgContent }}
              />
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-40">
              <div
                className="w-20 h-20 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: targetCircle.svgContent }}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
