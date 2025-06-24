import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Camera, Zap, Trophy, Shield } from 'lucide-react';
import { faqService, FAQ } from '@/services/faq';
import { Metadata } from 'next';

// Import build-time data
let BUILD_TIME_FAQS: FAQ[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const buildTimeData = require('@/lib/build-time-data.generated');
  BUILD_TIME_FAQS = buildTimeData.BUILD_TIME_FAQS || [];
} catch {
  // Build-time data not available, will use runtime fetching
  console.log('Build-time FAQ data not available, using runtime fetching');
}

// Server-side function to get FAQs with build-time and runtime fallback
async function getFAQs(): Promise<FAQ[]> {
  // First, try build-time data if available
  if (BUILD_TIME_FAQS.length > 0) {
    console.log(`Using build-time FAQ data: ${BUILD_TIME_FAQS.length} FAQs`);
    return BUILD_TIME_FAQS;
  }

  // Fall back to runtime fetching
  try {
    console.log('Fetching FAQs at runtime...');
    const runtimeFaqs = await faqService.getPublishedFAQs();
    console.log(`Runtime fetch returned ${runtimeFaqs.length} FAQs`);
    return runtimeFaqs;
  } catch (error) {
    console.error('Error fetching FAQs at runtime:', error);
    return [];
  }
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
      name: faq.question.es || faq.question.en || faq.question.he,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.es || faq.answer.en || faq.answer.he,
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
  // Fetch FAQs using build-time data or runtime fetching
  const faqs = await getFAQs();
  const faqStructuredData = generateFAQStructuredData(faqs);

  const coreValues = [
    {
      icon: Heart,
      title: 'Pasión',
      description:
        'Amamos lo que hacemos y se refleja en cada imagen que capturamos.',
    },
    {
      icon: Users,
      title: 'Trabajo en Equipo',
      description:
        'Nuestro modelo colaborativo nos permite cubrir cada momento importante.',
    },
    {
      icon: Camera,
      title: 'Calidad Técnica',
      description:
        'Utilizamos equipos profesionales y técnicas avanzadas para resultados excepcionales.',
    },
    {
      icon: Zap,
      title: 'Agilidad',
      description:
        'Nos adaptamos rápidamente a cualquier situación para no perder ningún momento.',
    },
    {
      icon: Trophy,
      title: 'Excelencia',
      description:
        'Buscamos la perfección en cada proyecto, superando las expectativas.',
    },
    {
      icon: Shield,
      title: 'Confianza',
      description:
        'Construimos relaciones duraderas basadas en la transparencia y profesionalismo.',
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

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              Sobre Nosotros
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Somos un equipo apasionado dedicado a capturar los momentos más
              importantes de tu vida con excelencia, calidez y agilidad.
            </p>
          </div>

          {/* Philosophy Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nuestra Filosofía
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
                  Creemos que cada evento es único y merece ser documentado con
                  la máxima dedicación. Nuestro enfoque no es solo capturar
                  imágenes, sino contar historias que perduren en el tiempo.
                  Combinamos técnica profesional con sensibilidad artística para
                  crear recuerdos que emocionan y trascienden generaciones.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Methodology Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nuestra Metodología
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Planificación',
                  description:
                    'Estudiamos cada detalle del evento para anticipar los momentos clave.',
                },
                {
                  step: '02',
                  title: 'Cobertura Integral',
                  description:
                    'Nuestro equipo se distribuye estratégicamente para no perder ningún momento.',
                },
                {
                  step: '03',
                  title: 'Captura Profesional',
                  description:
                    'Utilizamos técnicas avanzadas y equipos de última generación.',
                },
                {
                  step: '04',
                  title: 'Post-Producción',
                  description:
                    'Editamos cuidadosamente cada imagen y video para lograr resultados excepcionales.',
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm border-0"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="text-3xl font-bold text-primary group-hover:text-accent transition-colors">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Core Values Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nuestros Valores
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/80 backdrop-blur-sm border-0"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Preguntas Frecuentes
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            {faqs.length > 0 ? (
              <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6 md:p-8">
                  <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={faq.id}
                        value={`item-${index}`}
                        className="border border-border rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <div className="flex items-start gap-3 text-left">
                            {faq.category && (
                              <Badge
                                variant="secondary"
                                className="mt-1 text-xs"
                              >
                                {faq.category}
                              </Badge>
                            )}
                            <span className="font-medium text-foreground">
                              {faq.question.es ||
                                faq.question.en ||
                                faq.question.he}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-2">
                          <div className="text-muted-foreground leading-relaxed pl-3">
                            {faq.answer.es || faq.answer.en || faq.answer.he}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">❓</div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Preguntas Frecuentes
                    </h3>
                    <p className="text-muted-foreground">
                      Nuestras preguntas frecuentes aparecerán aquí pronto.
                      Mientras tanto, no dudes en contactarnos directamente para
                      cualquier consulta.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Call to Action */}
          <section className="text-center space-y-6">
            <Card className="bg-gradient-to-r from-primary to-accent border-0 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  ¿Listo para crear recuerdos inolvidables?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-6 max-w-2xl mx-auto">
                  Contáctanos hoy mismo y descubre cómo podemos hacer que tu
                  evento sea extraordinario.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-3 rounded-lg font-semibold transition-colors">
                    Ver Nuestro Trabajo
                  </button>
                  <button className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3 rounded-lg font-semibold transition-colors">
                    Trabajar con Nosotros
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
