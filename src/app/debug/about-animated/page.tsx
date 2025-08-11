import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import AboutContent from '@/components/about/AboutContent';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About (Animated Demo) | Veloz',
  description:
    'Versión de prueba con animaciones sutiles para la página Sobre Nosotros.',
};

export default async function AboutAnimatedPage() {
  const content = getStaticContent('es');
  return <AboutContent content={content} />;
}
