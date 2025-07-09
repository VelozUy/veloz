import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import ProjectVisualGrid from '@/components/our-work/ProjectVisualGrid';
import MeetTheTeam from '@/components/our-work/MeetTheTeam';
import Image from 'next/image';
import {
  CategoryBadge,
  CategoryTypography,
} from '@/components/ui/category-typography';
import { EventCategory, getCategoryStyle } from '@/constants/categories';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate static params at build time
export async function generateStaticParams() {
  const content = getStaticContent('es');

  if (!content.content.projects) {
    return [];
  }

  return content.content.projects.map(project => ({
    id: project.id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const content = getStaticContent('es');

  const project = content.content.projects?.find(p => p.id === id);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} - Veloz`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.media?.slice(0, 3).map(m => m.url) || [],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const content = getStaticContent('es');

  const project = content.content.projects?.find(p => p.id === id);

  if (!project) {
    notFound();
  }

  // Get category from event type
  const getCategoryFromEventType = (eventType: string): EventCategory => {
    const eventTypeMap: Record<string, EventCategory> = {
      casamiento: 'Casamiento',
      corporativos: 'Corporativos',
      'culturales-artisticos': 'Culturales y artísticos',
      photoshoot: 'Photoshoot',
      prensa: 'Prensa',
      otros: 'Otros',
    };
    return eventTypeMap[eventType] || 'Otros';
  };

  const category = project.eventType
    ? getCategoryFromEventType(project.eventType)
    : 'Otros';
  const categoryStyle = getCategoryStyle(category);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section with Category Styling */}
      <section className="relative bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
          {/* Project Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <CategoryBadge category={category} />
            </div>

            <CategoryTypography
              category={category}
              variant="title"
              size="xl"
              language="es"
              className="mb-4"
            >
              {project.title}
            </CategoryTypography>

            {project.description && (
              <CategoryTypography
                category={category}
                variant="body"
                size="lg"
                language="es"
                className="max-w-3xl mx-auto text-muted-foreground"
              >
                {project.description}
              </CategoryTypography>
            )}
          </div>

          {/* Project Details */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {project.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {project.location}
              </div>
            )}
            {project.eventDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {new Date(project.eventDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Media Grid */}
      {project.detailPageBlocks && project.detailPageBlocks.length > 0 ? (
        <ProjectVisualGrid
          mediaBlocks={project.detailPageBlocks}
          projectMedia={project.media}
          projectTitle={project.title}
          className="py-12"
          gridHeight={project.detailPageGridHeight}
        />
      ) : (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.media?.map((media, index) => (
                <div
                  key={media.id || index}
                  className="aspect-square relative overflow-hidden rounded-lg"
                >
                  {media.type === 'video' ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  ) : (
                    <Image
                      src={media.url}
                      alt={media.description?.es || project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Meet the Team Section - TODO: Add crewMembers to static content type */}
      {/* {project.crewMembers && project.crewMembers.length > 0 && (
        <MeetTheTeam
          crewMemberIds={project.crewMembers}
          language="es"
        />
      )} */}
    </div>
  );
}
