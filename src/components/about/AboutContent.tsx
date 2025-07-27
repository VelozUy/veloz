'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { Heart, Users, Camera, Zap, Trophy, Shield } from 'lucide-react';

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

interface AboutContentProps {
  content: {
    content: {
      about: {
        title: string;
        subtitle: string;
        philosophy: {
          title: string;
          description: string;
        };
        methodology: {
          title: string;
        };
        values: {
          title: string;
        };
        faq: {
          title: string;
        };
      };
    };
  };
  faqs: FAQ[];
  coreValues: Array<{
    iconName: string;
    title: string;
    description: string;
  }>;
  methodologySteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
}

export default function AboutContent({
  content,
  faqs,
  coreValues,
  methodologySteps,
}: AboutContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 text-foreground">
          <h1 className="text-section-title-lg font-body font-semibold">
            {content.content.about.title || 'Sobre Nosotros'}
          </h1>
          <p className="text-body-lg max-w-3xl mx-auto">
            {content.content.about.subtitle ||
              'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.'}
          </p>
        </div>

        {/* Philosophy Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-section-title-md font-body font-semibold mb-4 text-foreground">
              {content.content.about.philosophy.title || 'Nuestra Filosofía'}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <Card className="bg-card shadow-xl border-border">
            <CardContent className="p-8 md:p-12">
              <p className="text-body-lg leading-relaxed text-center max-w-4xl mx-auto text-foreground">
                {content.content.about.philosophy.description ||
                  'Creemos que cada evento es único y merece ser documentado con la máxima dedicación. Nuestro enfoque no es solo capturar imágenes, sino contar historias que perduren en el tiempo. Combinamos técnica profesional con sensibilidad artística para crear recuerdos que emocionan y trascienden generaciones.'}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Methodology Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-section-title-md font-body font-semibold mb-4 text-foreground">
              {content.content.about.methodology.title || 'Nuestra Metodología'}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodologySteps.map((item, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 bg-card border-border"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-3xl font-body text-primary group-hover:text-primary/80 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-body-lg font-body text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-body-md text-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Core Values Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-section-title-md font-body font-semibold mb-4 text-foreground">
              {content.content.about.values.title || 'Nuestros Valores'}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => {
              const iconMap: Record<
                string,
                React.ComponentType<{ className?: string }>
              > = {
                Heart,
                Users,
                Camera,
                Zap,
                Trophy,
                Shield,
              };
              const IconComponent = iconMap[value.iconName];
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card border-border"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-body-lg font-body text-foreground">
                      {value.title}
                    </h3>
                    <p className="text-body-md text-foreground">
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
              <h2 className="text-section-title-md font-body font-semibold mb-4 text-foreground">
                {content.content.about.faq.title || 'Preguntas Frecuentes'}
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            </div>

            <Card className="bg-card shadow-xl border-border">
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
                      className="border bg-muted/50 rounded-none px-4 border-border"
                    >
                      <AccordionTrigger className="text-left font-body font-medium hover:text-primary transition-colors py-4 text-foreground">
                        {getFAQText(faq, 'question')}
                        {faq.category && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {faq.category}
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="text-body-md pb-4 pt-2 text-foreground">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getFAQText(faq, 'answer'),
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
  );
}
