'use client';

import { VelozLogo, VelozIcon } from '@/components/shared';

export default function BrandAssetsDebug() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Brand Assets Debug</h1>

        {/* Logo Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Logo Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dark Logo</h3>
              <div className="space-y-2">
                <VelozLogo variant="dark" size="sm" />
                <VelozLogo variant="dark" size="md" />
                <VelozLogo variant="dark" size="lg" />
                <VelozLogo variant="dark" size="xl" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Blue Logo</h3>
              <div className="space-y-2">
                <VelozLogo variant="blue" size="sm" />
                <VelozLogo variant="blue" size="md" />
                <VelozLogo variant="blue" size="lg" />
                <VelozLogo variant="blue" size="xl" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">White Logo</h3>
              <div className="space-y-2">
                <VelozLogo variant="white" size="sm" />
                <VelozLogo variant="white" size="md" />
                <VelozLogo variant="white" size="lg" />
                <VelozLogo variant="white" size="xl" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Light Logo</h3>
              <div className="space-y-2">
                <VelozLogo variant="full" size="sm" logoVariant="light" />
                <VelozLogo variant="full" size="md" logoVariant="light" />
                <VelozLogo variant="full" size="lg" logoVariant="light" />
                <VelozLogo variant="full" size="xl" logoVariant="light" />
              </div>
            </div>
          </div>
        </section>

        {/* Icon Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Icon Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dark Icon</h3>
              <div className="space-y-2">
                <VelozIcon variant="dark" size="sm" />
                <VelozIcon variant="dark" size="md" />
                <VelozIcon variant="dark" size="lg" />
                <VelozIcon variant="dark" size="xl" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Light Icon</h3>
              <div className="space-y-2">
                <VelozIcon variant="light" size="sm" />
                <VelozIcon variant="light" size="md" />
                <VelozIcon variant="light" size="lg" />
                <VelozIcon variant="light" size="xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Compact Logo Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Compact Logo Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dark Compact</h3>
              <div className="space-y-2">
                <VelozLogo variant="compact" size="sm" logoVariant="dark" />
                <VelozLogo variant="compact" size="md" logoVariant="dark" />
                <VelozLogo variant="compact" size="lg" logoVariant="dark" />
                <VelozLogo variant="compact" size="xl" logoVariant="dark" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Blue Compact</h3>
              <div className="space-y-2">
                <VelozLogo variant="compact" size="sm" logoVariant="blue" />
                <VelozLogo variant="compact" size="md" logoVariant="blue" />
                <VelozLogo variant="compact" size="lg" logoVariant="blue" />
                <VelozLogo variant="compact" size="xl" logoVariant="blue" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">White Compact</h3>
              <div className="space-y-2">
                <VelozLogo variant="compact" size="sm" logoVariant="white" />
                <VelozLogo variant="compact" size="md" logoVariant="white" />
                <VelozLogo variant="compact" size="lg" logoVariant="white" />
                <VelozLogo variant="compact" size="xl" logoVariant="white" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Light Compact</h3>
              <div className="space-y-2">
                <VelozLogo variant="compact" size="sm" logoVariant="light" />
                <VelozLogo variant="compact" size="md" logoVariant="light" />
                <VelozLogo variant="compact" size="lg" logoVariant="light" />
                <VelozLogo variant="compact" size="xl" logoVariant="light" />
              </div>
            </div>
          </div>
        </section>

        {/* Background Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Background Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-foreground p-8 rounded-lg">
              <h3 className="text-lg font-medium text-background mb-4">
                Dark Background
              </h3>
              <div className="space-y-4">
                <VelozLogo
                  variant="full"
                  size="md"
                  logoVariant="white"
                  className="text-background"
                />
                <VelozIcon variant="light" size="md" />
              </div>
            </div>
            <div className="bg-muted p-8 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Light Background</h3>
              <div className="space-y-4">
                <VelozLogo variant="full" size="md" logoVariant="dark" />
                <VelozIcon variant="dark" size="md" />
              </div>
            </div>
            <div className="bg-primary p-8 rounded-lg">
              <h3 className="text-lg font-medium text-primary-foreground mb-4">
                Blue Background
              </h3>
              <div className="space-y-4">
                <VelozLogo
                  variant="full"
                  size="md"
                  logoVariant="white"
                  className="text-primary-foreground"
                />
                <VelozIcon variant="light" size="md" />
              </div>
            </div>
            <div className="bg-accent p-8 rounded-lg">
              <h3 className="text-lg font-medium text-accent-foreground mb-4">
                Accent Background
              </h3>
              <div className="space-y-4">
                <VelozLogo variant="full" size="md" logoVariant="dark" />
                <VelozIcon variant="dark" size="md" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
