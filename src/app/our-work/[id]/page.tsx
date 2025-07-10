import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import ProjectDetailClient from '@/components/our-work/ProjectDetailClient';

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

  return <ProjectDetailClient project={project} />;
}
