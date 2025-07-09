'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LocalizedContent } from '@/lib/static-content.generated';
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_LABELS_EN,
  EVENT_TYPE_LABELS_PT,
} from '@/constants';
import { EventType } from '@/types';
import {
  Calendar,
  MapPin,
  Play,
  ExternalLink,
  Heart,
  Filter,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FONT_OPTIONS } from '@/components/admin/VisualGridEditor';
import HeroLayout from '@/components/layout/HeroLayout';
import {
  CategoryBadge,
  CategoryTypography,
} from '@/components/ui/category-typography';
import { EventCategory, getCategoryStyle } from '@/constants/categories';

// Project interface for the our-work page
interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  eventType?: string;
  location?: string;
  eventDate: string;
  featured: boolean;
  status?: 'published' | 'draft' | 'archived';
  mediaBlocks?: Array<{
    id: string;
    mediaId?: string; // Optional for title blocks
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'image' | 'video' | 'title';
    zIndex: number;
    // Title-specific properties
    title?: string;
    font?: string;
    color?: string;
    // Media positioning within block (for image/video blocks)
    mediaOffsetX?: number; // Offset from center (0 = centered)
    mediaOffsetY?: number; // Offset from center (0 = centered)
  }>;
  heroMediaConfig?: {
    mediaId?: string;
    aspectRatio: '1:1' | '16:9' | '4:5' | '9:16' | 'custom';
    customRatio?: {
      width: number;
      height: number;
    };
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
  };
  media: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    description?: Record<string, string>;
    tags?: string[];
    aspectRatio?: '1:1' | '16:9' | '9:16';
    order?: number;
  }>;
}

interface OurWorkContentProps {
  content: LocalizedContent;
}

const UI_TEXT = {
  es: {
    title: 'Nuestro Trabajo',
    subtitle:
      'Explora nuestra colección de proyectos pasados. Cada imagen y video cuenta una historia única de momentos especiales capturados con pasión y profesionalismo.',
    allProjects: 'Todos los Proyectos',
    noProjects: 'Ningún proyecto encontrado para esta categoría.',
    featured: 'Destacado',
    wantSomethingLikeThis: 'Quiero algo así',
    tooltipText: 'Contactar para un proyecto similar',
    readyTitle: '¿Listo para crear algo increíble?',
    readySubtitle:
      'Cada proyecto es único. Cuéntanos sobre tu evento y crearemos algo extraordinario juntos.',
    startConversation: 'Iniciar Conversa',
    noImage: 'Sin imagen',
  },
  en: {
    title: 'Our Work',
    subtitle:
      'Explore our collection of past projects. Each image and video tells a unique story of special moments captured with passion and professionalism.',
    allProjects: 'All Projects',
    noProjects: 'No projects found for this category.',
    featured: 'Featured',
    wantSomethingLikeThis: 'I want something like this',
    tooltipText: 'Contact for a similar project',
    readyTitle: 'Ready to create something amazing?',
    readySubtitle:
      "Every project is unique. Tell us about your event and we'll create something extraordinary together.",
    startConversation: 'Start Conversation',
    noImage: 'No image',
  },
  pt: {
    title: 'Nosso Trabalho',
    subtitle:
      'Explore nossa coleção de projetos passados. Cada imagem e vídeo conta uma história única de momentos especiais capturados com paixão e profissionalismo.',
    allProjects: 'Todos os Projetos',
    noProjects: 'Nenhum projeto encontrado para esta categoria.',
    featured: 'Destacado',
    wantSomethingLikeThis: 'Quero algo assim',
    tooltipText: 'Contatar para um projeto similar',
    readyTitle: 'Pronto para criar algo incrível?',
    readySubtitle:
      'Cada projeto é único. Conte-nos sobre seu evento e criaremos algo extraordinário juntos.',
    startConversation: 'Iniciar Conversa',
    noImage: 'Sem imagem',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const projectVariants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  },
};

export function OurWorkContent({ content }: OurWorkContentProps) {
  const [carouselIndices, setCarouselIndices] = useState<
    Record<string, number>
  >({});

  // Determine current locale from content
  const currentLocale = content.locale || 'es';
  const uiText = UI_TEXT[currentLocale as keyof typeof UI_TEXT] || UI_TEXT.es;

  // Transform static content into component format
  const projects: Project[] = useMemo(() => {
    if (!content.content.projects || content.content.projects.length === 0) {
      return [];
    }
    return content.content.projects
      .map(project => ({
        ...project,
        title: project.title,
        description: project.description,
        status: 'published' as const, // Assume all static content is published
      }))
      .sort((a, b) => {
        // Featured projects first, then by date
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (
          new Date(b.eventDate || 0).getTime() -
          new Date(a.eventDate || 0).getTime()
        );
      });
  }, [content]);

  // Use all projects since filters are removed
  const filteredProjects = useMemo(() => {
    return projects;
  }, [projects]);

  // Get event type label based on current locale (defaulting to Spanish)
  const getEventTypeLabel = (eventType: string, locale: string = 'es') => {
    switch (locale) {
      case 'en':
        return EVENT_TYPE_LABELS_EN[eventType as EventType] || eventType;
      case 'pt':
        return EVENT_TYPE_LABELS_PT[eventType as EventType] || eventType;
      default:
        return EVENT_TYPE_LABELS[eventType as EventType] || eventType;
    }
  };

  // Handle CTA click - open contact form with prefilled event type
  const handleCTAClick = (eventType: string) => {
    // Store the selected event type in sessionStorage for the contact form
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('prefilledEventType', eventType);
    }
    // Navigate to contact page
    window.location.href = '/contact';
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Continuous slow movement carousel for each project
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    filteredProjects.forEach(project => {
      if (project.media.length > 1) {
        const interval = setInterval(() => {
          setCarouselIndices(prev => {
            const currentIndex = prev[project.id] || 0;
            const nextIndex = (currentIndex + 1) % project.media.length;
            return {
              ...prev,
              [project.id]: nextIndex,
            };
          });
        }, 6000); // Change every 6 seconds for slow continuous movement

        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [filteredProjects]);

  // Get current carousel index for a project
  const getCurrentCarouselIndex = (projectId: string) => {
    return carouselIndices[projectId] || 0;
  };

  // Get category from event type
  const getCategoryFromEventType = (eventType: string): EventCategory => {
    const eventTypeMap: Record<string, EventCategory> = {
      casamiento: 'Casamiento',
      corporativos: 'Corporativos',
      'culturales-artisticos': 'Culturales y artísticos',
      photoshoot: 'Photoshoot',
      prensa: 'Prensa',
      otros: 'Otros',
    };
    return eventTypeMap[eventType] || 'Otros';
  };

  // Render Custom Layout using Visual Grid Editor blocks
  const renderCustomLayout = (project: Project) => {
    const category = project.eventType
      ? getCategoryFromEventType(project.eventType)
      : 'Otros';
    const categoryStyle = getCategoryStyle(category);

    // If hero media is configured, render hero layout first
    if (project.heroMediaConfig && project.heroMediaConfig.mediaId) {
      return (
        <div className="space-y-8">
          {/* Hero Section */}
          <HeroLayout
            heroConfig={project.heroMediaConfig}
            projectMedia={project.media}
            projectTitle={project.title}
            className="mb-8"
          />

          {/* Project Description with Category Typography */}
          {project.description && (
            <div className="text-center space-y-6">
              <CategoryTypography
                category={category}
                variant="body"
                size="lg"
                language={currentLocale as 'es' | 'en' | 'pt'}
                className="max-w-4xl mx-auto leading-relaxed"
              >
                {project.description}
              </CategoryTypography>
            </div>
          )}

          {/* Simple Grid for Our-Work List Page */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.media.slice(0, 6).map((media, index) => (
              <div
                key={media.id || index}
                className="aspect-square relative overflow-hidden rounded-lg"
              >
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <Image
                    src={media.url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // For our-work list page, always use simple grid layout
    return (
      <div className="space-y-8">
        {/* Project Description with Category Typography */}
        {project.description && (
          <div className="text-center space-y-6">
            <CategoryTypography
              category={category}
              variant="body"
              size="lg"
              language={currentLocale as 'es' | 'en' | 'pt'}
              className="max-w-4xl mx-auto leading-relaxed"
            >
              {project.description}
            </CategoryTypography>
          </div>
        )}

        {/* Simple Grid for Our-Work List Page */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.media.slice(0, 6).map((media, index) => (
            <div
              key={media.id || index}
              className="aspect-square relative overflow-hidden rounded-lg"
            >
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <Image
                  src={media.url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render project using only custom layout
  const renderProject = (project: Project) => {
    return renderCustomLayout(project);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Projects Full-Width Wall-to-Wall Layout */}
      {filteredProjects.length === 0 ? (
        <section className="px-4 md:px-8 lg:px-12">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-muted-foreground text-lg">
                {uiText.noProjects}
              </div>
            </motion.div>
          </div>
        </section>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0"
        >
          {filteredProjects.map((project, index) => {
            const category = project.eventType
              ? getCategoryFromEventType(project.eventType)
              : 'Otros';
            const categoryStyle = getCategoryStyle(category);

            return (
              <motion.section
                key={project.id}
                variants={projectVariants}
                className="w-full"
              >
                {/* Project Container - Full Width with Category Styling */}
                <Link href={`/our-work/${project.id}`} className="block">
                  <div
                    className={`w-full hover:bg-muted/50 transition-colors duration-300 cursor-pointer ${categoryStyle.colors.background}`}
                  >
                    {/* Project Content - Full Width */}
                    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
                      {/* Category Badge */}
                      <div className="flex justify-center mb-6">
                        <CategoryBadge
                          category={category}
                          language={currentLocale as 'es' | 'en' | 'pt'}
                          showIcon={true}
                          showDescription={false}
                        />
                      </div>

                      {/* Project Title with Category Typography */}
                      <div className="text-center mb-6">
                        <CategoryTypography
                          category={category}
                          variant="title"
                          size="xl"
                          language={currentLocale as 'es' | 'en' | 'pt'}
                          className="mb-4"
                        >
                          {project.title}
                        </CategoryTypography>
                      </div>

                      {renderProject(project)}
                    </div>
                  </div>
                </Link>

                {/* Separator between projects (except for the last one) */}
                {index < filteredProjects.length - 1 && (
                  <div className="w-full py-20 bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
                )}
              </motion.section>
            );
          })}
        </motion.div>
      )}

      {/* Title and Subtitle Section */}
      <section className="px-4 md:px-8 lg:px-12">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {uiText.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {uiText.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 lg:px-12">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {uiText.readyTitle}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {uiText.readySubtitle}
            </p>
            <Button
              size="lg"
              onClick={() => handleCTAClick('general')}
              className="text-lg px-8 py-4"
            >
              {uiText.startConversation}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
