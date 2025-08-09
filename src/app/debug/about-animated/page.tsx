import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import AboutContentAnimated from '@/components/about/AboutContentAnimated';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About (Animated Demo) | Veloz',
  description:
    'Versión de prueba con animaciones sutiles para la página Sobre Nosotros.',
};

export default async function AboutAnimatedPage() {
  const content = getStaticContent('es');
  return <AboutContentAnimated content={content} />;
}
