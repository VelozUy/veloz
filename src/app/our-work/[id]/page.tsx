import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import ExpandableProjectGrid from '@/components/our-work/ExpandableProjectGrid';
import Image from 'next/image';

interface ProjectDetailPageProps {
  params: { id: string };
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

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const content = getStaticContent('es');

  const project = content.content.projects?.find(p => p.id === params.id);

  if (!project) {
    return {
      title: 'Proyecto no encontrado | Veloz Fotografía y Videografía',
    };
  }

  return {
    title: `${project.title} | Veloz Fotografía y Videografía`,
    description:
      project.description ||
      'Explora este proyecto de Veloz Fotografía y Videografía.',
    openGraph: {
      title: `${project.title} | Veloz Fotografía y Videografía`,
      description:
        project.description ||
        'Explora este proyecto de Veloz Fotografía y Videografía.',
      images: project.media?.[0]
        ? [
            {
              url: project.media[0].url,
              width: 1200,
              height: 630,
              alt: project.title,
            },
          ]
        : [],
    },
    alternates: {
      canonical: `/our-work/${params.id}`,
      languages: {
        es: `/our-work/${params.id}`,
        en: `/en/our-work/${params.id}`,
        pt: `/pt/our-work/${params.id}`,
      },
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const content = getStaticContent('es');

  const project = content.content.projects?.find(p => p.id === params.id);

  if (!project) {
    notFound();
  }

  // Get the first media item for hero
  const heroMedia = project.media?.[0];

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Hero Section */}
      {heroMedia && (
        <div className="w-full">
          <div className="relative w-full aspect-video overflow-hidden">
            {heroMedia.type === 'video' ? (
              <video
                src={heroMedia.url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <Image
                src={heroMedia.url}
                alt={project.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            )}

            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Project Title Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                  {project.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Content */}
      <div className="min-h-screen pt-20 pb-16">
        <div className="w-full px-4 md:px-8 lg:px-12">
          {/* Project Title (if no hero) */}
          {!heroMedia && (
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
                  {project.description}
                </p>
              )}
            </div>
          )}

          {/* Project Description (if hero exists) */}
          {heroMedia && project.description && (
            <div className="text-center mb-12">
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
                {project.description}
              </p>
            </div>
          )}

          {/* Project Media in Expandable Grid */}
          {project.media && project.media.length > 0 && (
            <div className="mb-12">
              <ExpandableProjectGrid
                media={project.media}
                projectTitle={project.title}
              />
            </div>
          )}

          {/* Project Details */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 text-muted-foreground">
              {project.eventType && (
                <span className="text-sm">{project.eventType}</span>
              )}
              {project.location && (
                <span className="text-sm">{project.location}</span>
              )}
              {project.eventDate && (
                <span className="text-sm">
                  {new Date(project.eventDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
