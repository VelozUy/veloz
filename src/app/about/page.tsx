import { Metadata } from 'next';
import { getStaticContent, t } from '@/lib/utils';
import AboutContent from '@/components/about/AboutContent';

// FAQ interface matching the static content structure
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

// Helper function to get FAQ text (static content FAQs are already in the correct language)
function getFAQText(faq: FAQ, field: 'question' | 'answer'): string {
  return faq[field] || '';
}

// Generate structured data for FAQs
function generateFAQStructuredData(faqs: FAQ[]) {
  if (faqs.length === 0) {
    return null;
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: getFAQText(faq, 'question'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: getFAQText(faq, 'answer'),
      },
    })),
  };

  return faqStructuredData;
}

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Veloz - Fotografía y Video Profesional',
  description:
    'Conoce nuestra filosofía, metodología y valores. Preguntas frecuentes sobre nuestros servicios de fotografía y video para eventos.',
  keywords:
    'fotografía eventos, video bodas, equipo profesional, Uruguay, preguntas frecuentes',
  openGraph: {
    title: 'Sobre Nosotros | Veloz',
    description:
      'Conoce nuestra filosofía, metodología y valores en fotografía y video profesional.',
    type: 'website',
  },
};

// Enable static generation at build time with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour in production

export default async function AboutPage() {
  // Get static content for Spanish (default locale)
  const content = getStaticContent('es');

  // Get FAQs from static content
  const faqs: FAQ[] = content.content.faqs || [];
  const faqStructuredData = generateFAQStructuredData(faqs);

  // Core values with translations
  const coreValues = [
    {
      iconName: 'Heart',
      title: t(content, 'about.values.passion.title', 'Pasión'),
      description: t(
        content,
        'about.values.passion.description',
        'Amamos lo que hacemos y se refleja en cada imagen que capturamos.'
      ),
    },
    {
      iconName: 'Users',
      title: t(content, 'about.values.teamwork.title', 'Trabajo en Equipo'),
      description: t(
        content,
        'about.values.teamwork.description',
        'Nuestro modelo colaborativo nos permite cubrir cada momento importante.'
      ),
    },
    {
      iconName: 'Camera',
      title: t(content, 'about.values.quality.title', 'Calidad Técnica'),
      description: t(
        content,
        'about.values.quality.description',
        'Utilizamos equipos profesionales y técnicas avanzadas para resultados excepcionales.'
      ),
    },
    {
      iconName: 'Zap',
      title: t(content, 'about.values.agility.title', 'Agilidad'),
      description: t(
        content,
        'about.values.agility.description',
        'Nos adaptamos rápidamente a cualquier situación para no perder ningún momento.'
      ),
    },
    {
      iconName: 'Trophy',
      title: t(content, 'about.values.excellence.title', 'Excelencia'),
      description: t(
        content,
        'about.values.excellence.description',
        'Buscamos la perfección en cada proyecto, superando las expectativas.'
      ),
    },
    {
      iconName: 'Shield',
      title: t(content, 'about.values.trust.title', 'Confianza'),
      description: t(
        content,
        'about.values.trust.description',
        'Construimos relaciones duraderas basadas en la transparencia y profesionalismo.'
      ),
    },
  ];

  // Methodology steps with translations
  const methodologySteps = [
    {
      step: '01',
      title: t(content, 'about.methodology.planning.title', 'Planificación'),
      description: t(
        content,
        'about.methodology.planning.description',
        'Estudiamos cada detalle del evento para anticipar los momentos clave.'
      ),
    },
    {
      step: '02',
      title: t(
        content,
        'about.methodology.coverage.title',
        'Cobertura Integral'
      ),
      description: t(
        content,
        'about.methodology.coverage.description',
        'Nuestro equipo se distribuye estratégicamente para no perder ningún momento.'
      ),
    },
    {
      step: '03',
      title: t(
        content,
        'about.methodology.capture.title',
        'Captura Profesional'
      ),
      description: t(
        content,
        'about.methodology.capture.description',
        'Utilizamos técnicas avanzadas y equipos de última generación.'
      ),
    },
    {
      step: '04',
      title: t(
        content,
        'about.methodology.postproduction.title',
        'Post-Producción'
      ),
      description: t(
        content,
        'about.methodology.postproduction.description',
        'Editamos cuidadosamente cada imagen y video para lograr resultados excepcionales.'
      ),
    },
  ];

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      )}

      <AboutContent
        content={content}
        faqs={faqs}
        coreValues={coreValues}
        methodologySteps={methodologySteps}
      />
    </>
  );
}
