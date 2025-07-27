'use client';

import React from 'react';
import {
  VelozSignature,
  PerimeterBox,
  TargetLoader,
  VelozLoader,
  StripedDivider,
  VelozStamp,
  GridDotOverlay,
  VelozTarget,
  VelozCircles,
  VelozWorld,
  VelozBarcode,
  VelozCheckboard,
  VelozRuler,
} from '@/components/shared';

export default function DesignDebugPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Veloz Design Components
          </h1>
          <p className="text-muted-foreground text-lg">
            Experimental playground for Veloz brand components and design
            patterns
          </p>
        </header>

        {/* VelozSignature Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozSignature
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Horizontal Variant
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card">
                <VelozSignature variant="horizontal" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Compact Variant
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card">
                <VelozSignature variant="compact" />
              </div>
            </div>
          </div>
        </section>

        {/* VelozTarget Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozTarget
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Simple Target
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozTarget variant="simple" size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Circle Target
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozTarget variant="circle" size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Complex Target
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozTarget variant="complex" size="default" />
              </div>
            </div>
          </div>
        </section>

        {/* VelozCircles Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozCircles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Horizontal Circles
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozCircles orientation="horizontal" size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Vertical Circles
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozCircles orientation="vertical" size="default" />
              </div>
            </div>
          </div>
        </section>

        {/* VelozWorld Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozWorld
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">World 2</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozWorld variant="world-2" size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">World 3</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozWorld variant="world-3" size="default" />
              </div>
            </div>
          </div>
        </section>

        {/* VelozBarcode Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozBarcode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Small</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozBarcode size="small" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Default</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozBarcode size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Large</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozBarcode size="large" />
              </div>
            </div>
          </div>
        </section>

        {/* VelozCheckboard Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozCheckboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Small</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozCheckboard size="small" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Default</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozCheckboard size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Large</h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozCheckboard size="large" />
              </div>
            </div>
          </div>
        </section>

        {/* VelozRuler Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozRuler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Vertical Ruler
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozRuler orientation="vertical" size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Horizontal Ruler
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozRuler orientation="horizontal" size="default" />
              </div>
            </div>
          </div>
        </section>

        {/* Loader Components Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            Loader Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                TargetLoader (Single Circle)
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <TargetLoader />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                VelozLoader (Pulse)
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozLoader orientation="horizontal" size="default" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                VelozLoader (Bounce)
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card flex items-center justify-center">
                <VelozLoader orientation="vertical" size="default" />
              </div>
            </div>
          </div>
        </section>

        {/* PerimeterBox Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            PerimeterBox
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                With Content
              </h3>
              <PerimeterBox>
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Sample Content</h4>
                  <p className="text-muted-foreground">
                    This is a sample content inside the PerimeterBox component.
                    Notice the double border effect that creates a sophisticated
                    frame.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                      Action
                    </button>
                    <button className="px-4 py-2 border border-border rounded-md">
                      Secondary
                    </button>
                  </div>
                </div>
              </PerimeterBox>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Empty State
              </h3>
              <PerimeterBox>
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Empty perimeter box
                </div>
              </PerimeterBox>
            </div>
          </div>
        </section>

        {/* StripedDivider Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            StripedDivider
          </h2>
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Horizontal Divider
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card">
                <div className="space-y-4">
                  <p className="text-foreground">Content above the divider</p>
                  <StripedDivider />
                  <p className="text-foreground">Content below the divider</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Multiple Dividers
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card">
                <div className="space-y-6">
                  <p className="text-foreground">Section 1</p>
                  <StripedDivider />
                  <p className="text-foreground">Section 2</p>
                  <StripedDivider />
                  <p className="text-foreground">Section 3</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VelozStamp Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            VelozStamp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Default</h3>
              <div className="p-6 border border-border rounded-lg bg-card">
                <VelozStamp />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                In Context
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card">
                <div className="space-y-4">
                  <p className="text-foreground">Some content here...</p>
                  <div className="flex justify-end">
                    <VelozStamp />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GridDotOverlay Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            GridDotOverlay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Default Spacing
              </h3>
              <div className="relative h-48 border border-border rounded-lg bg-card overflow-hidden">
                <GridDotOverlay />
                <div className="relative z-10 p-4">
                  <p className="text-foreground">Content over grid</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Tight Spacing
              </h3>
              <div className="relative h-48 border border-border rounded-lg bg-card overflow-hidden">
                <GridDotOverlay spacing={5} />
                <div className="relative z-10 p-4">
                  <p className="text-foreground">Content over tight grid</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Combinations */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            Component Combinations
          </h2>
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Target + World
              </h3>
              <PerimeterBox>
                <div className="flex items-center justify-between">
                  <VelozTarget variant="simple" size="small" />
                  <VelozWorld variant="world-2" size="small" />
                </div>
              </PerimeterBox>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Circles + Barcode
              </h3>
              <div className="relative h-32 border border-border rounded-lg bg-card overflow-hidden">
                <GridDotOverlay spacing={8} />
                <div className="relative z-10 h-full flex items-center justify-between px-8">
                  <VelozCircles orientation="horizontal" size="small" />
                  <VelozBarcode size="small" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Complex Layout
              </h3>
              <PerimeterBox>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <VelozSignature variant="horizontal" />
                    <VelozStamp />
                  </div>
                  <StripedDivider />
                  <div className="flex items-center justify-center gap-8">
                    <VelozTarget variant="circle" size="small" />
                    <VelozWorld variant="world-3" size="small" />
                    <VelozCircles orientation="vertical" size="small" />
                  </div>
                  <StripedDivider />
                  <div className="flex items-center justify-between">
                    <VelozBarcode size="small" />
                    <VelozCheckboard size="small" />
                    <VelozRuler orientation="vertical" size="small" />
                  </div>
                </div>
              </PerimeterBox>
            </div>
          </div>
        </section>

        {/* Theme Integration */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            Theme Integration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Primary Colors
              </h3>
              <div className="p-6 border border-border rounded-lg bg-card">
                <div className="space-y-4">
                  <VelozSignature variant="horizontal" />
                  <StripedDivider />
                  <div className="flex justify-center gap-4">
                    <VelozTarget variant="simple" size="small" />
                    <VelozWorld variant="world-2" size="small" />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Muted Colors
              </h3>
              <div className="p-6 border border-border rounded-lg bg-muted">
                <div className="space-y-4">
                  <VelozStamp />
                  <StripedDivider />
                  <div className="flex justify-center gap-4">
                    <VelozCircles orientation="horizontal" size="small" />
                    <VelozBarcode size="small" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
