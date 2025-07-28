import { Metadata } from 'next';
import ProjectsProcessClient from '@/components/projects/ProjectsProcessClient';

export const metadata: Metadata = {
  title: 'Nuestro Proceso - Veloz',
  description:
    'Descubre nuestro proceso único de producción basado en equipos para fotografía y videografía profesional de eventos.',
  openGraph: {
    title: 'Nuestro Proceso - Veloz',
    description:
      'Descubre nuestro proceso único de producción basado en equipos para fotografía y videografía profesional de eventos.',
    type: 'website',
    locale: 'es_UY',
  },
};

export default function ProjectsPage() {
  return <ProjectsProcessClient />;
}
