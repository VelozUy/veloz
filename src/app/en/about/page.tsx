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
function generateFAQStructuredData(faqs: FAQ[], locale: string = 'en') {
  if (faqs.length === 0) {
    return null;
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => {
      const localeKey = locale as keyof typeof faq.question;
      return {
        '@type': 'Question',
        name:
          faq.question[localeKey] ||
          faq.question.en ||
          faq.question.es ||
          faq.question.he,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            faq.answer[localeKey] ||
            faq.answer.en ||
            faq.answer.es ||
            faq.answer.he,
        },
      };
    }),
  };

  return faqStructuredData;
}

export const metadata: Metadata = {
  title: 'About Us | Veloz - Professional Photography & Videography',
  description:
    'Learn about our philosophy, methodology and values. Frequently asked questions about our photography and video services for events.',
  keywords:
    'event photography, wedding video, professional team, Uruguay, frequently asked questions',
  openGraph: {
    title: 'About Us | Veloz',
    description:
      'Learn about our philosophy, methodology and values in professional photography and videography.',
    type: 'website',
  },
};

// Enable static generation at build time with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour in production

export default async function AboutPageEN() {
  // Get static content for English locale
  const content = getStaticContent('en');

  // Fetch FAQs using build-time data or runtime fetching
  const faqs = await getFAQs();
  const faqStructuredData = generateFAQStructuredData(faqs, 'en');

  // Core values with translations
  const coreValues = [
    {
      icon: Heart,
      title: t(content, 'about.values.passion.title', 'Passion'),
      description: t(
        content,
        'about.values.passion.description',
        'We love what we do and it shows in every image we capture.'
      ),
    },
    {
      icon: Users,
      title: t(content, 'about.values.teamwork.title', 'Teamwork'),
      description: t(
        content,
        'about.values.teamwork.description',
        'Our collaborative model allows us to cover every important moment.'
      ),
    },
    {
      icon: Camera,
      title: t(content, 'about.values.quality.title', 'Technical Quality'),
      description: t(
        content,
        'about.values.quality.description',
        'We use professional equipment and advanced techniques for exceptional results.'
      ),
    },
    {
      icon: Zap,
      title: t(content, 'about.values.agility.title', 'Agility'),
      description: t(
        content,
        'about.values.agility.description',
        'We adapt quickly to any situation to never miss a moment.'
      ),
    },
    {
      icon: Trophy,
      title: t(content, 'about.values.excellence.title', 'Excellence'),
      description: t(
        content,
        'about.values.excellence.description',
        'We strive for perfection in every project, exceeding expectations.'
      ),
    },
    {
      icon: Shield,
      title: t(content, 'about.values.trust.title', 'Trust'),
      description: t(
        content,
        'about.values.trust.description',
        'We build lasting relationships based on transparency and professionalism.'
      ),
    },
  ];

  // Methodology steps with translations
  const methodologySteps = [
    {
      step: '01',
      title: t(content, 'about.methodology.planning.title', 'Planning'),
      description: t(
        content,
        'about.methodology.planning.description',
        'We study every detail of the event to anticipate key moments.'
      ),
    },
    {
      step: '02',
      title: t(
        content,
        'about.methodology.coverage.title',
        'Comprehensive Coverage'
      ),
      description: t(
        content,
        'about.methodology.coverage.description',
        'Our team is strategically distributed to not miss any moment.'
      ),
    },
    {
      step: '03',
      title: t(
        content,
        'about.methodology.capture.title',
        'Professional Capture'
      ),
      description: t(
        content,
        'about.methodology.capture.description',
        'We use advanced techniques and state-of-the-art equipment.'
      ),
    },
    {
      step: '04',
      title: t(
        content,
        'about.methodology.postproduction.title',
        'Post-Production'
      ),
      description: t(
        content,
        'about.methodology.postproduction.description',
        'We carefully edit every image and video to achieve exceptional results.'
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
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              {t(content, 'about.title', 'About Us')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t(
                content,
                'about.subtitle',
                'We are a passionate team dedicated to capturing the most important moments of your life with excellence, warmth and agility.'
              )}
            </p>
          </div>

          {/* Philosophy Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t(content, 'about.philosophy.title', 'Our Philosophy')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
                  {t(
                    content,
                    'about.philosophy.description',
                    'We believe that every event is unique and deserves to be documented with maximum dedication. Our approach is not just to capture images, but to tell stories that endure over time. We combine professional technique with artistic sensitivity to create memories that move and transcend generations.'
                  )}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Methodology Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t(content, 'about.methodology.title', 'Our Methodology')}
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t(content, 'about.values.title', 'Our Values')}
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
          {faqs.length > 0 && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {t(content, 'about.faq.title', 'Frequently Asked Questions')}
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
                        className="border-0 bg-muted/30 rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors py-4">
                          {faq.question.en ||
                            faq.question.es ||
                            faq.question.he}
                          {faq.category && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {faq.category}
                            </Badge>
                          )}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pt-2">
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                faq.answer.en || faq.answer.es || faq.answer.he,
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
