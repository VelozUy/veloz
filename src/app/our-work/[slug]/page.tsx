import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import ProjectDetailClient from '@/components/our-work/ProjectDetailClient';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params at build time
export async function generateStaticParams() {
  const content = getStaticContent('es');

  if (!content.content.projects) {
    return [];
  }

  return content.content.projects.map(project => ({
    slug: project.slug || project.id, // Use slug if available, fallback to ID
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getStaticContent('es');

  // Try to find project by slug first, then by ID
  const project = content.content.projects?.find(
    p => p.slug === slug || p.id === slug
  );

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
  const { slug } = await params;
  const content = getStaticContent('es');

  // Try to find project by slug first, then by ID
  const project = content.content.projects?.find(
    p => p.slug === slug || p.id === slug
  );

  if (!project) {
    notFound();
  }

  // If we found the project by ID but it has a slug, redirect to the slug URL
  if (project.slug && project.slug !== slug) {
    redirect(`/our-work/${project.slug}`);
  }

  return <ProjectDetailClient project={project} />;
}
