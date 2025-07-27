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
import { getStaticContent, t } from '@/lib/utils';

// Import build-time data
let BUILD_TIME_FAQS: FAQ[] = [];
try {
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

// Helper function to get FAQ text in the appropriate language
function getFAQText(
  faq: FAQ,
  field: 'question' | 'answer',
  locale: string = 'pt'
): string {
  const content = faq[field];

  // Try the requested locale first
  const localeKey = locale as keyof typeof content;
  if (content[localeKey] && content[localeKey].trim()) {
    return content[localeKey];
  }

  // Fallback order: pt -> es -> en
  const fallbackOrder = ['pt', 'es', 'en'] as const;

  for (const fallbackLocale of fallbackOrder) {
    if (content[fallbackLocale] && content[fallbackLocale].trim()) {
      return content[fallbackLocale];
    }
  }

  return '';
}

// Generate structured data for FAQs
function generateFAQStructuredData(faqs: FAQ[], locale: string = 'pt') {
  if (faqs.length === 0) {
    return null;
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => {
      return {
        '@type': 'Question',
        name: getFAQText(faq, 'question', locale),
        acceptedAnswer: {
          '@type': 'Answer',
          text: getFAQText(faq, 'answer', locale),
        },
      };
    }),
  };

  return faqStructuredData;
}

export const metadata: Metadata = {
  title: 'Sobre Nós | Veloz - Fotografia e Vídeo Profissional',
  description:
    'Conheça nossa filosofia, metodologia e valores. Perguntas frequentes sobre nossos serviços de fotografia e vídeo para eventos.',
  keywords:
    'fotografia eventos, vídeo casamentos, equipe profissional, Uruguai, perguntas frequentes',
  openGraph: {
    title: 'Sobre Nós | Veloz',
    description:
      'Conheça nossa filosofia, metodologia e valores em fotografia e vídeo profissional.',
    type: 'website',
  },
};

// Enable static generation at build time with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour in production

export default async function AboutPagePT() {
  // Get static content for Brazilian Portuguese locale
  const content = getStaticContent('pt');

  // Fetch FAQs using build-time data or runtime fetching
  const faqs = await getFAQs();
  const faqStructuredData = generateFAQStructuredData(faqs, 'pt');

  // Core values with translations
  const coreValues = [
    {
      icon: Heart,
      title: t(content, 'about.values.passion.title', 'Paixão'),
      description: t(
        content,
        'about.values.passion.description',
        'Amamos o que fazemos e isso se reflete em cada imagem que capturamos.'
      ),
    },
    {
      icon: Users,
      title: t(content, 'about.values.teamwork.title', 'Trabalho em Equipe'),
      description: t(
        content,
        'about.values.teamwork.description',
        'Nosso modelo colaborativo nos permite cobrir cada momento importante.'
      ),
    },
    {
      icon: Camera,
      title: t(content, 'about.values.quality.title', 'Qualidade Técnica'),
      description: t(
        content,
        'about.values.quality.description',
        'Utilizamos equipamentos profissionais e técnicas avançadas para resultados excepcionais.'
      ),
    },
    {
      icon: Zap,
      title: t(content, 'about.values.agility.title', 'Agilidade'),
      description: t(
        content,
        'about.values.agility.description',
        'Nos adaptamos rapidamente a qualquer situação para não perder nenhum momento.'
      ),
    },
    {
      icon: Trophy,
      title: t(content, 'about.values.excellence.title', 'Excelência'),
      description: t(
        content,
        'about.values.excellence.description',
        'Buscamos a perfeição em cada projeto, superando expectativas.'
      ),
    },
    {
      icon: Shield,
      title: t(content, 'about.values.trust.title', 'Confiança'),
      description: t(
        content,
        'about.values.trust.description',
        'Construímos relacionamentos duradouros baseados na transparência e profissionalismo.'
      ),
    },
  ];

  // Methodology steps with translations
  const methodologySteps = [
    {
      step: '01',
      title: t(content, 'about.methodology.planning.title', 'Planejamento'),
      description: t(
        content,
        'about.methodology.planning.description',
        'Estudamos cada detalhe do evento para antecipar os momentos-chave.'
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
        'Nossa equipe se distribui estrategicamente para não perder nenhum momento.'
      ),
    },
    {
      step: '03',
      title: t(
        content,
        'about.methodology.capture.title',
        'Captura Profissional'
      ),
      description: t(
        content,
        'about.methodology.capture.description',
        'Utilizamos técnicas avançadas e equipamentos de última geração.'
      ),
    },
    {
      step: '04',
      title: t(
        content,
        'about.methodology.postproduction.title',
        'Pós-Produção'
      ),
      description: t(
        content,
        'about.methodology.postproduction.description',
        'Editamos cuidadosamente cada imagem e vídeo para alcançar resultados excepcionais.'
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

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-section-title-lg font-body font-semibold text-primary">
              {t(content, 'about.title', 'Sobre Nós')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t(
                content,
                'about.subtitle',
                'Somos uma equipe apaixonada dedicada a capturar os momentos mais importantes da sua vida com excelência, carinho e agilidade.'
              )}
            </p>
          </div>

          {/* Philosophy Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-section-title-md font-body font-semibold text-foreground mb-4">
                {t(content, 'about.philosophy.title', 'Nossa Filosofia')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
                  {t(
                    content,
                    'about.philosophy.description',
                    'Acreditamos que cada evento é único e merece ser documentado com máxima dedicação. Nossa abordagem não é apenas capturar imagens, mas contar histórias que perduram no tempo. Combinamos técnica profissional com sensibilidade artística para criar memórias que emocionam e transcendem gerações.'
                  )}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Methodology Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-section-title-md font-body font-semibold text-foreground mb-4">
                {t(content, 'about.methodology.title', 'Nossa Metodologia')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {methodologySteps.map((item, index) => (
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
              <h2 className="text-section-title-md font-body font-semibold text-foreground mb-4">
                {t(content, 'about.values.title', 'Nossos Valores')}
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
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-none flex items-center justify-center group-hover:scale-110 transition-transform">
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
          {faqs.length > 0 && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-section-title-md font-body font-semibold text-foreground mb-4">
                  {t(content, 'about.faq.title', 'Perguntas Frequentes')}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
              </div>

              <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6 md:p-8">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-4"
                  >
                    {faqs.map(faq => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="border-0 bg-muted/30 rounded-none px-4"
                      >
                        <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors py-4">
                          {getFAQText(faq, 'question', 'pt')}
                          {faq.category && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {faq.category}
                            </Badge>
                          )}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pt-2">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: getFAQText(faq, 'answer', 'pt'),
                            }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
