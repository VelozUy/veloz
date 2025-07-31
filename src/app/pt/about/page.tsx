import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Camera, Zap, Trophy, Shield } from 'lucide-react';
import { Metadata } from 'next';
import { getStaticContent, t } from '@/lib/utils';
import FAQSection from '@/components/about/FAQSection';
import { faqService, FAQ } from '@/services/faq';

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
              <div
                className="prose prose-lg max-w-4xl mx-auto text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-em:text-foreground"
                dangerouslySetInnerHTML={{
                  __html: t(
                    content,
                    'about.philosophy.content',
                    'Acreditamos que cada evento é único e merece ser documentado com máxima dedicação. Nossa abordagem não é apenas capturar imagens, mas contar histórias que perduram no tempo. Combinamos técnica profissional com sensibilidade artística para criar memórias que emocionam e transcendem gerações.'
                  )
                    .replace(
                      /^### (.*$)/gim,
                      '<h3 class="text-lg font-semibold mb-2">$1</h3>'
                    )
                    .replace(
                      /^## (.*$)/gim,
                      '<h2 class="text-xl font-semibold mb-3">$1</h2>'
                    )
                    .replace(
                      /^# (.*$)/gim,
                      '<h1 class="text-2xl font-bold mb-4">$1</h1>'
                    )
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(
                      /`(.*?)`/gim,
                      '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
                    )
                    .replace(
                      /\[([^\]]+)\]\(([^)]+)\)/gim,
                      '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
                    )
                    .replace(/\n\n/gim, '</p><p class="mb-3">')
                    .replace(/^(.+)$/gim, '<p class="mb-3">$1</p>'),
                }}
              />
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

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <FAQSection 
            faqs={faqs}
            title={t(content, 'about.faq.title', 'Perguntas Frequentes')}
            locale="pt"
          />
        )}
      </div>
    </div>
    </>
  );
}
