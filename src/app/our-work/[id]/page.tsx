import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import ProjectVisualGrid from '@/components/our-work/ProjectVisualGrid';
import Image from 'next/image';

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

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const content = getStaticContent('es');
  const project = content.content.projects?.find(
    p => p.id === resolvedParams.id
  );

  if (!project) {
    return {
      title: 'Proyecto no encontrado | Veloz Fotografía y Videografía',
      description: 'El proyecto que buscas no existe.',
    };
  }

  return {
    title: `${project.title} | Veloz Fotografía y Videografía`,
    description:
      project.description ||
      `Explora el proyecto ${project.title} de Veloz Fotografía y Videografía.`,
    openGraph: {
      title: `${project.title} | Veloz Fotografía y Videografía`,
      description:
        project.description ||
        `Explora el proyecto ${project.title} de Veloz Fotografía y Videografía.`,
      images:
        project.media && project.media.length > 0
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
      canonical: `/our-work/${resolvedParams.id}`,
      languages: {
        es: `/our-work/${resolvedParams.id}`,
        en: `/en/our-work/${resolvedParams.id}`,
        pt: `/pt/our-work/${resolvedParams.id}`,
      },
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const resolvedParams = await params;
  const content = getStaticContent('es');
  const project = content.content.projects?.find(
    p => p.id === resolvedParams.id
  );

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
        {project.media && project.media.length > 0 ? (
          <Image
            src={project.media[0].url}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-lg">Sin imagen</div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Project Info */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Project Details */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            {project.eventType && (
              <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                {project.eventType}
              </span>
            )}
            {project.location && (
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm">
                📍 {project.location}
              </span>
            )}
            {project.eventDate && (
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm">
                📅{' '}
                {new Date(project.eventDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Visual Grid */}
        <div className="mb-12">
          <ProjectVisualGrid
            mediaBlocks={project.detailPageBlocks || []}
            projectMedia={project.media || []}
            projectTitle={project.title}
            gridHeight={project.detailPageGridHeight}
          />
        </div>

        {/* Project Description */}
        {project.description && (
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Sobre este proyecto
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
