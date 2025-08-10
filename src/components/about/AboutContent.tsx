'use client';

import { Card, CardContent } from '@/components/ui/card';
import FAQSection from './FAQSection';
import { getStaticContent } from '@/lib/utils';
import type { LocalizedContent } from '@/lib/static-content.generated';

import { Heart, Users, Camera, Zap, Trophy, Shield } from 'lucide-react';
import { FastForwardUnderline } from '@/components/ui/animated-underline';

interface AboutContentProps {
  content: LocalizedContent;
}

// Philosophy items data
const philosophyItems = [
  {
    title: 'Calidad',
    description:
      'Porque cada persona que nos elige merece lo mejor, desde el primer clic hasta la entrega final.',
    icon: Trophy,
  },
  {
    title: 'Sensibilidad',
    description:
      'Porque en cada evento hay historias reales, personas que sienten, viven y confían en que sepamos capturar eso irrepetible.',
    icon: Heart,
  },
  {
    title: 'Velocidad',
    description:
      'Porque entendemos que el tiempo importa y las historias no esperan. Respondemos con agilidad y con la responsabilidad de estar cuando se nos necesita.',
    icon: Zap,
  },
];

export default function AboutContent({ content }: AboutContentProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Enhanced hierarchy */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16">
        {' '}
        {/* Enhanced spacing */}
        <div className="max-w-border-64 mx-auto">
          <div className="text-left space-y-8 text-foreground">
            {' '}
            {/* Enhanced spacing */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-title font-bold uppercase tracking-wide leading-tight">
              {content.content.about.title || 'Sobre Nosotros'}
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl leading-relaxed font-body">
              {content.content.about.subtitle ||
                'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.'}
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Enhanced hierarchy */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16 bg-muted/30">
        {' '}
        {/* Enhanced spacing */}
        <div className="max-w-border-64 mx-auto space-y-12">
          {' '}
          {/* Enhanced spacing */}
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-title font-bold mb-6 text-foreground uppercase tracking-wide">
              {content.content.about.philosophy.title || 'Nuestra Filosofía'}
            </h2>
            <div className="w-32 h-1 bg-primary rounded-full"></div>{' '}
            {/* Enhanced accent */}
          </div>
          {/* Philosophy Items - Horizontal Layout */}
          <div className="space-y-12">
            {philosophyItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center gap-6 md:gap-8"
              >
                {/* Title Container */}
                <div className="bg-primary px-8 py-6 md:px-10 md:py-8 rounded-lg shadow-lg flex-shrink-0 w-40 md:w-48 lg:w-56 flex items-center justify-center">
                  <h3
                    className="text-xl md:text-2xl lg:text-3xl font-subtitle font-bold text-primary-foreground uppercase tracking-wide text-center no-underline"
                    style={{ textDecoration: 'none', borderBottom: 'none' }}
                  >
                    {item.title}
                  </h3>
                </div>
                {/* Content Text */}
                <div className="flex-1 max-w-4xl">
                  <p className="text-lg md:text-xl text-foreground leading-relaxed font-subtitle text-center md:text-left">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section - Enhanced hierarchy */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16">
        {' '}
        {/* Enhanced spacing */}
        <div className="max-w-border-64 mx-auto space-y-12">
          {' '}
          {/* Enhanced spacing */}
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-title font-bold mb-6 text-foreground uppercase tracking-wide">
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
                  <div className="text-4xl font-subtitle text-primary group-hover:text-primary/80 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-subtitle font-bold text-foreground uppercase tracking-wide no-underline">
                    {item.title}
                  </h3>
                  <p className="text-body-md text-foreground font-body">
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
    </div>
  );
}
