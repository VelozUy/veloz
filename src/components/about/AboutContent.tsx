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
        faq: {
          title: string;
        };
      };
    };
    translations: Record<string, unknown>;
  };
  faqs: FAQ[];
  methodologySteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
}

export default function AboutContent({
  content,
  faqs,
  methodologySteps,
}: AboutContentProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-16">
        <div className="max-w-border-64 mx-auto">
          <div className="text-left space-y-6 text-foreground">
            <h1 className="text-section-title-lg font-body font-bold uppercase">
              {content.content.about.title || 'Sobre Nosotros'}
            </h1>
            <p className="text-body-lg max-w-3xl">
              {content.content.about.subtitle ||
                'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.'}
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 px-16 bg-muted/30">
        <div className="max-w-border-64 mx-auto space-y-8">
          <div className="text-left">
            <h2 className="text-section-title-md font-body font-bold mb-4 text-foreground uppercase">
              {content.content.about.philosophy.title || 'Nuestra Filosofía'}
            </h2>
            <div className="w-24 h-1 bg-primary rounded-full"></div>
          </div>

          <div
            className="prose prose-lg max-w-4xl text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground"
            dangerouslySetInnerHTML={{
              __html: (
                content.content.about.philosophy.description ||
                'Creemos que cada evento es único y merece ser documentado con la máxima dedicación. Nuestro enfoque no es solo capturar imágenes, sino contar historias que perduren en el tiempo. Combinamos técnica profesional con sensibilidad artística para crear recuerdos que emocionan y trascienden generaciones.'
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
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 px-16">
        <div className="max-w-border-64 mx-auto space-y-8">
          <div className="text-left">
            <h2 className="text-section-title-md font-body font-bold mb-4 text-foreground uppercase">
              {content.content.about.methodology.title || 'Nuestra Metodología'}
            </h2>
            <div className="w-24 h-1 bg-primary rounded-full"></div>
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
                  <h3 className="text-body-lg font-body font-bold text-foreground uppercase">
                    {item.title}
                  </h3>
                  <p className="text-body-md text-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-16 px-16">
          <div className="max-w-border-64 mx-auto space-y-8">
            <div className="text-left">
              <h2 className="text-section-title-md font-body font-bold mb-4 text-foreground uppercase">
                {content.content.about.faq.title || 'Preguntas Frecuentes'}
              </h2>
              <div className="w-24 h-1 bg-primary rounded-full"></div>
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
          </div>
        </section>
      )}
    </div>
  );
}
