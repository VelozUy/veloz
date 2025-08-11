import React from 'react';
import { getDesignElements, type DesignElement } from '@/lib/design-elements';

export const dynamic = 'error';

export default function DesignElementsGalleryPage() {
  const elements = getDesignElements();

  return (
    <div className="px-4 md:px-16 py-12 space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Design Elements Gallery
      </h1>
      <p className="text-sm text-muted-foreground">
        SVGs from docs/Veloz Design Manual/Elements
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {elements.map((el: DesignElement) => (
          <div
            key={el.slug}
            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="text-sm font-medium">{el.name}</div>
              <div className="text-xs text-muted-foreground break-all">
                {el.filePath}
              </div>
            </div>
            <div className="p-6 bg-background flex items-center justify-center">
              <div className="w-full h-48 overflow-auto bg-card/40 rounded">
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: el.svgContent }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
