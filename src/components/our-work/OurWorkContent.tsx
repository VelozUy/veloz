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
    mediaId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'image' | 'video';
    zIndex: number;
  }>;
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

// UI text translations
const UI_TEXT = {
  es: {
    title: 'Nuestro Trabajo',
    subtitle:
      'Explora nuestra colección de proyectos pasados. Cada imagen y video cuenta una historia única de momentos especiales capturados con pasión y profesionalismo.',
    allProjects: 'Todos los Proyectos',
    noProjects: 'No se encontraron proyectos para esta categoría.',
    featured: 'Destacado',
    wantSomethingLikeThis: 'Quiero algo así',
    tooltipText: 'Contactar para un proyecto similar',
    readyTitle: '¿Listo para crear algo increíble?',
    readySubtitle:
      'Cada proyecto es único. Cuéntanos sobre tu evento y crearemos algo extraordinario juntos.',
    startConversation: 'Comenzar Conversación',
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
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
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

  // Filter projects by event type
  const filteredProjects = useMemo(() => {
    if (selectedEventType === 'all') {
      return projects;
    }
    return projects.filter(project => project.eventType === selectedEventType);
  }, [projects, selectedEventType]);

  // Get unique event types from projects
  const availableEventTypes = useMemo(() => {
    const types = new Set(
      projects
        .map(p => p.eventType)
        .filter((type): type is string => Boolean(type))
    );
    return Array.from(types);
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

  // Render Custom Layout using Visual Grid Editor blocks
  const renderCustomLayout = (project: Project) => {
    // If no media blocks defined, show a simple grid
    if (!project.mediaBlocks || project.mediaBlocks.length === 0) {
      return (
        <div className="space-y-8">
          {/* Project Title and Description */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Simple Grid Fallback */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.media.slice(0, 6).map((media, index) => (
              <div
                key={media.id || index}
                className="aspect-square relative overflow-hidden"
              >
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
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

    // Sort media blocks by z-index and position
    const sortedBlocks = [...project.mediaBlocks].sort(
      (a, b) => a.zIndex - b.zIndex
    );

    return (
      <div className="space-y-8">
        {/* Project Title and Description */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Visual Grid Layout */}
        <div className="relative w-full h-[600px] bg-gray-100 overflow-hidden">
          {sortedBlocks.map(block => {
            const media = project.media.find(m => m.id === block.mediaId);
            if (!media) return null;

            // Convert pixel coordinates to percentages
            // Grid is 480x320px (6x4 cells of 80px each)
            const GRID_WIDTH_PX = 6 * 80; // 480px
            const GRID_HEIGHT_PX = 4 * 80; // 320px

            const blockStyle = {
              position: 'absolute' as const,
              left: `${(block.x / GRID_WIDTH_PX) * 100}%`,
              top: `${(block.y / GRID_HEIGHT_PX) * 100}%`,
              width: `${(block.width / GRID_WIDTH_PX) * 100}%`,
              height: `${(block.height / GRID_HEIGHT_PX) * 100}%`,
              zIndex: block.zIndex,
            };

            return (
              <div
                key={block.id}
                style={blockStyle}
                className="overflow-hidden"
              >
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={media.url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <div className="flex justify-center gap-3">
          {project.featured && (
            <Badge className="bg-primary text-primary-foreground">
              <Heart className="w-3 h-3 mr-1" />
              {uiText.featured}
            </Badge>
          )}
          {project.eventType && (
            <Badge variant="secondary">
              {getEventTypeLabel(project.eventType)}
            </Badge>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center pt-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleCTAClick(project.eventType || '')}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-8 py-4"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {uiText.wantSomethingLikeThis}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{uiText.tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-8 lg:px-12">
        <div className="w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {uiText.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {uiText.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="px-4 md:px-8 lg:px-12 mb-12">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              variant={selectedEventType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedEventType('all')}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {uiText.allProjects}
            </Button>

            {availableEventTypes.map(eventType => (
              <Button
                key={eventType}
                variant={
                  selectedEventType === eventType ? 'default' : 'outline'
                }
                onClick={() => setSelectedEventType(eventType)}
                className="flex items-center gap-2"
              >
                {getEventTypeLabel(eventType)}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

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
          {filteredProjects.map((project, index) => (
            <motion.section
              key={project.id}
              variants={projectVariants}
              className="w-full"
            >
              {/* Project Container - Full Width */}
              <div className="w-full bg-background">
                {/* Project Content - Full Width */}
                <div className="w-full px-4 md:px-8 lg:px-12">
                  {renderProject(project)}
                </div>
              </div>

              {/* Separator between projects (except for the last one) */}
              {index < filteredProjects.length - 1 && (
                <div className="w-full py-20 bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
              )}
            </motion.section>
          ))}
        </motion.div>
      )}

      {/* Bottom CTA Section */}
      <section className="px-4 md:px-8 lg:px-12 mt-24">
        <div className="w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {uiText.readyTitle}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {uiText.readySubtitle}
            </p>
            <Button
              onClick={() => handleCTAClick('')}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-8 py-4"
            >
              {uiText.startConversation}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
