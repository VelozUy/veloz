'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Camera, Zap, Trophy, Shield } from 'lucide-react';
import { AboutContentData } from '@/lib/validation-schemas';

interface AboutContentPreviewProps {
  content: AboutContentData;
  currentLanguage: string;
}

// Helper interfaces for the items
interface PhilosophyPoint {
  id: string;
  title: { es?: string; en?: string; pt?: string };
  description: { es?: string; en?: string; pt?: string };
  order: number;
}

interface MethodologyStep {
  id: string;
  title: { es?: string; en?: string; pt?: string };
  description: { es?: string; en?: string; pt?: string };
  order: number;
}

interface Value {
  id: string;
  title: { es?: string; en?: string; pt?: string };
  description: { es?: string; en?: string; pt?: string };
  order: number;
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
    <div className="bg-background border rounded-lg overflow-hidden">
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
            {getText(content.title) || 'Sobre Nosotros'}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {getText(content.subtitle) ||
              'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.'}
          </p>
        </div>

        {/* Philosophy Section */}
        {content.philosophy &&
          content.philosophy.items &&
          content.philosophy.items.length > 0 && (
            <section className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  {getText(content.philosophy.title) || 'Nuestra Filosofía'}
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
              </div>

              <div className="space-y-3">
                {content.philosophy.items.map(
                  (point: PhilosophyPoint, index: number) => (
                    <Card
                      key={point.id}
                      className="bg-card/80 backdrop-blur-sm border-0 shadow-sm"
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">
                          {getText(point.title) || `Punto ${index + 1}`}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {getText(point.description) ||
                            'Descripción del punto filosófico...'}
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </section>
          )}

        {/* Methodology Section */}
        {content.methodology &&
          content.methodology.items &&
          content.methodology.items.length > 0 && (
            <section className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  {getText(content.methodology.title) || 'Nuestra Metodología'}
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {content.methodology.items.map(
                  (step: MethodologyStep, index: number) => (
                    <Card
                      key={step.id}
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
        {content.values &&
          content.values.items &&
          content.values.items.length > 0 && (
            <section className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  {getText(content.values.title) || 'Nuestros Valores'}
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {content.values.items.map((value: Value, index: number) => {
                  const IconComponent =
                    coreValueIcons[index % coreValueIcons.length];
                  return (
                    <Card
                      key={value.id}
                      className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-card/80 backdrop-blur-sm border-0"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
        {content.faq && (
          <section className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {getText(content.faq.title) || 'Preguntas Frecuentes'}
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
        )}

        {/* Empty State */}
        {(!content.philosophy ||
          !content.philosophy.items ||
          content.philosophy.items.length === 0) &&
          (!content.methodology ||
            !content.methodology.items ||
            content.methodology.items.length === 0) &&
          (!content.values ||
            !content.values.items ||
            content.values.items.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No hay contenido para mostrar en la vista previa.
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Agrega contenido en las secciones de arriba para ver la vista
                previa.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
