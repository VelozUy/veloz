'use client';

import { Card, CardContent } from '@/components/ui/card';
import FAQSection from './FAQSection';
import type { LocalizedContent } from '@/lib/static-content.generated';
import { FastForwardUnderline } from '@/components/ui/animated-underline';

import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface AboutContentProps {
  content: LocalizedContent;
}

// Philosophy items based on the content structure
const getPhilosophyItems = (content: LocalizedContent) => {
  // Check if dynamic philosophy items exist in the content
  if (
    content.content.about.philosophy.items &&
    Array.isArray(content.content.about.philosophy.items)
  ) {
    return content.content.about.philosophy.items;
  }

  // Fallback to static philosophy items based on the content locale
  const locale = content.locale;

  const staticItems = {
    es: [
      {
        title: 'Calidad',
        description:
          'Porque cada persona que nos elige merece lo mejor, desde el primer clic hasta la entrega final.',
      },
      {
        title: 'Sensibilidad',
        description:
          'Porque en cada evento hay historias reales, personas que sienten, viven y confían en que sepamos capturar eso irrepetible.',
      },
      {
        title: 'Velocidad',
        description:
          'Porque entendemos que el tiempo importa y las historias no esperan. Respondemos con agilidad y con la responsabilidad de estar cuando se nos necesita.',
      },
    ],
    en: [
      {
        title: 'Quality',
        description:
          'Because every person who chooses us deserves the best, from the first click to the final delivery.',
      },
      {
        title: 'Sensitivity',
        description:
          'Because in every event there are real stories, people who feel, live and trust that we know how to capture that irreplaceable moment.',
      },
      {
        title: 'Speed',
        description:
          "Because we understand that time matters and stories don't wait. We respond with agility and with the responsibility of being there when we are needed.",
      },
    ],
    pt: [
      {
        title: 'Qualidade',
        description:
          'Porque cada pessoa que nos escolhe merece o melhor, desde o primeiro clique até a entrega final.',
      },
      {
        title: 'Sensibilidade',
        description:
          'Porque em cada evento há histórias reais, pessoas que sentem, vivem e confiam que sabemos capturar esse momento irrepetível.',
      },
      {
        title: 'Velocidade',
        description:
          'Porque entendemos que o tempo importa e as histórias não esperam. Respondemos com agilidade e com a responsabilidade de estar lá quando somos necessários.',
      },
    ],
  };

  return staticItems[locale as keyof typeof staticItems] || staticItems.es;
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const fadeInUp = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function AboutContent({ content }: AboutContentProps) {
  const prefersReduced = usePrefersReducedMotion();

  // Handle case where content is undefined
  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Content not available
          </h1>
          <p className="text-muted-foreground">The content is not available.</p>
        </div>
      </div>
    );
  }

  const methodologySteps = content.content.about.methodology.steps ?? [];
  const philosophyItems = getPhilosophyItems(content);

  // No mini-TOC; anchor ids remain for potential deep links

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-8 md:pt-8 pb-8 md:pb-8 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <motion.div
            variants={prefersReduced ? undefined : staggerContainer}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.4 }}
            className="text-left space-y-6 text-foreground"
          >
            <motion.h1
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-title uppercase tracking-wide leading-tight"
            >
              {content.content.about.title || 'Sobre Nosotros'}
            </motion.h1>
            <motion.p
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-xl md:text-2xl max-w-4xl leading-relaxed font-body"
            >
              {content.content.about.subtitle ||
                'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.'}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mini-TOC removed */}

      {/* Filosofía */}
      <section
        id="filosofia"
        className="py-8 md:py-12 px-4 sm:px-8 lg:px-16 bg-muted/30 scroll-mt-24"
      >
        <div className="max-w-border-64 mx-auto space-y-10">
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-left"
          >
            <h2 className="text-3xl md:text-4xl font-title font-bold mb-6 text-foreground uppercase tracking-wide">
              {content.content.about.philosophy.title || 'Nuestra Filosofía'}
            </h2>
            <motion.div
              className="h-1 bg-primary rounded-full"
              style={{ width: prefersReduced ? '8rem' : undefined }}
              initial={prefersReduced ? undefined : { width: 0 }}
              whileInView={prefersReduced ? undefined : { width: '8rem' }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>

          <motion.div
            variants={prefersReduced ? undefined : staggerContainer}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-10"
          >
            {philosophyItems.map((item, index) => (
              <motion.div
                key={index}
                variants={prefersReduced ? undefined : fadeInUp}
                className="group flex flex-col md:flex-row items-center gap-6 md:gap-8"
              >
                <div className="bg-primary px-8 py-6 md:px-10 md:py-8 rounded-lg shadow-lg flex-shrink-0 w-40 md:w-48 lg:w-56 flex items-center justify-center group relative">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-subtitle font-bold text-primary-foreground uppercase tracking-wide text-center relative">
                    {item.title}
                    <FastForwardUnderline
                      isActive={false}
                      color="custom"
                      customColor="bg-primary-foreground"
                    />
                  </h3>
                </div>
                <div className="flex-1 max-w-4xl">
                  <p className="text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed font-subtitle text-center md:text-left">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Metodología */}
      <section
        id="metodologia"
        className="py-8 md:py-12 px-4 sm:px-8 lg:px-16 scroll-mt-24"
      >
        <div className="max-w-border-64 mx-auto space-y-10">
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-left"
          >
            <h2 className="text-3xl md:text-4xl font-title font-bold mb-6 text-foreground uppercase tracking-wide">
              {content.content.about.methodology.title || 'Nuestra Metodología'}
            </h2>
            <motion.div
              className="h-1 bg-primary rounded-full"
              style={{ width: prefersReduced ? '8rem' : undefined }}
              initial={prefersReduced ? undefined : { width: 0 }}
              whileInView={prefersReduced ? undefined : { width: '8rem' }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>

          <motion.div
            variants={prefersReduced ? undefined : staggerContainer}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-8 items-stretch"
          >
            {methodologySteps.map((item: any, index: number) => (
              <motion.div
                key={index}
                variants={prefersReduced ? undefined : fadeInUp}
                whileHover={prefersReduced ? undefined : { y: -6 }}
                className="h-full"
              >
                <Card
                  tabIndex={0}
                  className="group h-full flex bg-card border-border shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`${item.title}`}
                >
                  <CardContent className="p-8 text-left space-y-6 flex flex-col h-full">
                    <div className="text-4xl font-subtitle text-primary group-hover:text-primary/80 transition-colors">
                      {item.step}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-subtitle font-bold text-foreground uppercase tracking-wide relative group">
                      <span className="relative">
                        {item.title}
                        <FastForwardUnderline
                          isActive={false}
                          color="current"
                        />
                      </span>
                    </h3>
                    <p className="text-body-md text-foreground font-body">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      {content.content.faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24">
          <FAQSection
            faqs={content.content.faqs}
            title={content.content.about.faq.title || 'Preguntas Frecuentes'}
            locale={content.locale}
          />
        </section>
      )}
    </div>
  );
}
