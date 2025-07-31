'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Camera, Zap, Trophy, Shield } from 'lucide-react';
import type {
  AboutContentData,
  AboutMethodologyStepData,
  AboutValueData,
} from '@/lib/validation-schemas';

interface AboutContentPreviewProps {
  content: AboutContentData;
  currentLanguage: string;
}

// Core values with icons
const coreValueIcons = [Heart, Users, Camera, Zap, Trophy, Shield];

export default function AboutContentPreview({
  content,
  currentLanguage,
}: AboutContentPreviewProps) {
  // Helper function to get text in current language
  const getText = (
    textObj: { es?: string; en?: string; pt?: string } | undefined
  ): string => {
    if (!textObj) return '';
    return textObj[currentLanguage as keyof typeof textObj] || textObj.es || '';
  };

  // Get current language name for display
  const getLanguageName = () => {
    switch (currentLanguage) {
      case 'es':
        return 'Español';
      case 'en':
        return 'English';
      case 'pt':
        return 'Português';
      default:
        return 'Español';
    }
  };

  return (
    <div className="bg-background border rounded-none overflow-hidden">
      {/* Preview Header */}
      <div className="bg-muted/50 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            Vista Previa - {getLanguageName()}
          </h3>
          <Badge variant="secondary" className="text-xs">
            Vista Previa
          </Badge>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6 space-y-8 max-h-[600px] overflow-y-auto">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {getText(content.heroTitle) || 'Sobre Nosotros'}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {getText(content.heroSubtitle) ||
              'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.'}
          </p>
        </div>

        {/* Philosophy Section */}
        {getText(content.philosophyContent) && (
          <section className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {getText(content.philosophyTitle) || 'Nuestra Filosofía'}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-6">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: getText(content.philosophyContent)
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
        )}

        {/* Methodology Section */}
        {content.methodologySteps && content.methodologySteps.length > 0 && (
          <section className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {getText(content.methodologyTitle) || 'Nuestra Metodología'}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.methodologySteps.map(
                (step: AboutMethodologyStepData, index: number) => (
                  <Card
                    key={step.id || `methodology-${index}`}
                    className="group hover:shadow-md transition-all duration-300 bg-card/80 backdrop-blur-sm border-0"
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {getText(step.title) || `Paso ${index + 1}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getText(step.description) ||
                          'Descripción del paso metodológico...'}
                      </p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </section>
        )}

        {/* Values Section */}
        {content.values && content.values.length > 0 && (
          <section className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {getText(content.valuesTitle) || 'Nuestros Valores'}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {content.values.map((value: AboutValueData, index: number) => {
                const IconComponent =
                  coreValueIcons[index % coreValueIcons.length];
                return (
                  <Card
                    key={value.id || `value-${index}`}
                    className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-card/80 backdrop-blur-sm border-0"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-none flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {getText(value.title) || `Valor ${index + 1}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getText(value.description) ||
                          'Descripción del valor...'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Preguntas Frecuentes
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                Las preguntas frecuentes se gestionan desde la sección de FAQs
                en el panel de administración.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Empty State */}
        {!getText(content.philosophyContent) &&
          (!content.methodologySteps ||
            content.methodologySteps.length === 0) &&
          (!content.values || content.values.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No hay contenido para mostrar en la vista previa.
              </p>
              <p className="text-xs mt-2 text-muted-foreground">
                Agrega contenido en las secciones de arriba para ver la vista
                previa.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
