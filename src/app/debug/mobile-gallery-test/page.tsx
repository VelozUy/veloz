import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';

export const metadata: Metadata = {
  title: 'Mobile Gallery Test | Veloz',
  description: 'Debug page for testing mobile gallery layout',
};

export default function MobileGalleryTestPage() {
  // Get static content for Spanish (default)
  const content = getStaticContent('es');
  const projects = content.content.projects || [];

  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mobile Gallery Test</h1>
        <p className="mb-4">Testing mobile layout for gallery</p>

        {/* Debug info */}
        <div className="mb-8 p-4 bg-muted rounded">
          <h2 className="font-semibold mb-2">Debug Info:</h2>
          <p>Projects count: {projects.length}</p>
          <p>
            Published projects:{' '}
            {projects.filter(p => p.status === 'published').length}
          </p>
          <p>
            Total media items: {projects.flatMap(p => p.media || []).length}
          </p>
        </div>

        {/* Test the gallery */}
        <OurWorkClient projects={projects} locale={content.locale} />
      </div>
    </div>
  );
}
