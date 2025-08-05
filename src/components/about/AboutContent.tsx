'use client';

import { Card, CardContent } from '@/components/ui/card';
import FAQSection from './FAQSection';
import CTASection from '@/components/shared/CTASection';
import { getStaticContent } from '@/lib/utils';
import type { LocalizedContent } from '@/lib/static-content.generated';

import { Heart, Users, Camera, Zap, Trophy, Shield } from 'lucide-react';

interface AboutContentProps {
  content: LocalizedContent;
}

export default function AboutContent({ content }: AboutContentProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Enhanced hierarchy */}
      <section className="py-16 md:py-24 px-4 sm:px-8 lg:px-16">
        {' '}
        {/* Enhanced spacing */}
        <div className="max-w-border-64 mx-auto">
          <div className="text-left space-y-8 text-foreground">
            {' '}
            {/* Enhanced spacing */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-body font-bold uppercase tracking-wide leading-tight">
              {content.content.about.title || 'Sobre Nosotros'}
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl leading-relaxed">
              {content.content.about.subtitle ||
                'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.'}
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Enhanced hierarchy */}
      <section className="py-16 md:py-24 px-4 sm:px-8 lg:px-16 bg-muted/30">
        {' '}
        {/* Enhanced spacing */}
        <div className="max-w-border-64 mx-auto space-y-12">
          {' '}
          {/* Enhanced spacing */}
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-body font-bold mb-6 text-foreground uppercase tracking-wide">
              {content.content.about.philosophy.title || 'Nuestra Filosofía'}
            </h2>
            <div className="w-32 h-1 bg-primary rounded-full"></div>{' '}
            {/* Enhanced accent */}
          </div>
          <div
            className="prose prose-xl max-w-5xl text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground leading-relaxed" // Enhanced typography
            dangerouslySetInnerHTML={{
              __html: (
                content.content.about.philosophy.description ||
                'Creemos que cada evento es único y merece ser documentado con la máxima dedicación. Nuestro enfoque no es solo capturar imágenes, sino contar historias que perduren en el tiempo. Combinamos técnica profesional con sensibilidad artística para crear recuerdos que emocionan y trascienden generaciones.'
              )
                .replace(
                  /^### (.*$)/gim,
                  '<h3 class="text-xl font-semibold mb-4">$1</h3>'
                )
                .replace(
                  /^## (.*$)/gim,
                  '<h2 class="text-2xl font-semibold mb-6">$1</h2>'
                )
                .replace(
                  /^# (.*$)/gim,
                  '<h1 class="text-3xl font-bold mb-8">$1</h1>'
                )
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                .replace(
                  /`(.*?)`/gim,
                  '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>'
                )
                .replace(
                  /\[([^\]]+)\]\(([^)]+)\)/gim,
                  '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
                )
                .replace(/\n\n/gim, '</p><p class="mb-6">')
                .replace(/^(.+)$/gim, '<p class="mb-6">$1</p>'),
            }}
          />
        </div>
      </section>

      {/* Methodology Section - Enhanced hierarchy */}
      <section className="py-16 md:py-24 px-4 sm:px-8 lg:px-16">
        {' '}
        {/* Enhanced spacing */}
        <div className="max-w-border-64 mx-auto space-y-12">
          {' '}
          {/* Enhanced spacing */}
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-body font-bold mb-6 text-foreground uppercase tracking-wide">
              {content.content.about.methodology.title || 'Nuestra Metodología'}
            </h2>
            <div className="w-32 h-1 bg-primary rounded-full"></div>{' '}
            {/* Enhanced accent */}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {' '}
            {/* Enhanced spacing */}
            {content.content.about.methodology.steps.map((item, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 bg-card border-border transform hover:-translate-y-2" // Enhanced dynamism
              >
                <CardContent className="p-8 text-center space-y-6">
                  {' '}
                  {/* Enhanced spacing */}
                  <div className="text-4xl font-body text-primary group-hover:text-primary/80 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-body font-bold text-foreground uppercase tracking-wide">
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
      {content.content.faqs.length > 0 && (
        <FAQSection
          faqs={content.content.faqs}
          title={content.content.about.faq.title || 'Preguntas Frecuentes'}
          locale={content.locale}
        />
      )}

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
