'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LocalizedContent } from '@/lib/static-content.generated';
import { EVENT_TYPE_LABELS, EVENT_TYPE_LABELS_EN, EVENT_TYPE_LABELS_PT } from '@/constants';
import { EventType } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Play, 
  ExternalLink, 
  Heart,
  Filter
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
    subtitle: 'Explora nuestra colección de proyectos pasados. Cada imagen y video cuenta una historia única de momentos especiales capturados con pasión y profesionalismo.',
    allProjects: 'Todos los Proyectos',
    noProjects: 'No se encontraron proyectos para esta categoría.',
    featured: 'Destacado',
    wantSomethingLikeThis: 'Quiero algo así',
    tooltipText: 'Contactar para un proyecto similar',
    readyTitle: '¿Listo para crear algo increíble?',
    readySubtitle: 'Cada proyecto es único. Cuéntanos sobre tu evento y crearemos algo extraordinario juntos.',
    startConversation: 'Comenzar Conversación',
    noImage: 'Sin imagen',
  },
  en: {
    title: 'Our Work',
    subtitle: 'Explore our collection of past projects. Each image and video tells a unique story of special moments captured with passion and professionalism.',
    allProjects: 'All Projects',
    noProjects: 'No projects found for this category.',
    featured: 'Featured',
    wantSomethingLikeThis: 'I want something like this',
    tooltipText: 'Contact for a similar project',
    readyTitle: 'Ready to create something amazing?',
    readySubtitle: 'Every project is unique. Tell us about your event and we\'ll create something extraordinary together.',
    startConversation: 'Start Conversation',
    noImage: 'No image',
  },
  pt: {
    title: 'Nosso Trabalho',
    subtitle: 'Explore nossa coleção de projetos passados. Cada imagem e vídeo conta uma história única de momentos especiais capturados com paixão e profissionalismo.',
    allProjects: 'Todos os Projetos',
    noProjects: 'Nenhum projeto encontrado para esta categoria.',
    featured: 'Destacado',
    wantSomethingLikeThis: 'Quero algo assim',
    tooltipText: 'Contatar para um projeto similar',
    readyTitle: 'Pronto para criar algo incrível?',
    readySubtitle: 'Cada projeto é único. Conte-nos sobre seu evento e criaremos algo extraordinário juntos.',
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

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  },
};

export function OurWorkContent({ content }: OurWorkContentProps) {
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

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
        return new Date(b.eventDate || 0).getTime() - new Date(a.eventDate || 0).getTime();
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
    const types = new Set(projects.map(p => p.eventType).filter((type): type is string => Boolean(type)));
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
        day: 'numeric'
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
              [project.id]: nextIndex
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

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto text-center">
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
      <section className="px-4 mb-12">
        <div className="container mx-auto">
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
                variant={selectedEventType === eventType ? 'default' : 'outline'}
                onClick={() => setSelectedEventType(eventType)}
                className="flex items-center gap-2"
              >
                {getEventTypeLabel(eventType)}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Projects Full-Width Layout */}
      <section className="px-4">
        <div className="container mx-auto">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-muted-foreground text-lg">
                {uiText.noProjects}
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-16"
            >
              {filteredProjects.map((project, index) => {
                const currentMediaIndex = getCurrentCarouselIndex(project.id);
                const isCarouselLeft = index % 2 === 0; // Alternate carousel position
                
                return (
                  <motion.div
                    key={project.id}
                    variants={cardVariants}
                    className="group"
                  >
                    <div className="flex flex-col lg:flex-row lg:min-h-[500px] bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      {/* Carousel Section */}
                      <div className={`relative lg:w-1/2 ${isCarouselLeft ? 'lg:order-1' : 'lg:order-2'}`}>
                        {project.media.length > 0 ? (
                          <div className="relative w-full h-64 lg:h-full overflow-hidden" style={{ minHeight: '256px', maxHeight: '100%' }}>
                            {/* Continuous Sliding Carousel Container */}
                            <motion.div 
                              className="flex h-full"
                              animate={{ 
                                x: project.media.length > 1 ? `-${currentMediaIndex * 100}%` : 0 
                              }}
                              transition={{ 
                                duration: 6, 
                                ease: "linear",
                                repeat: 0
                              }}
                              onAnimationComplete={() => {
                                if (project.media.length > 1) {
                                  // Move to next image or reset to first
                                  setCarouselIndices(prev => ({
                                    ...prev,
                                    [project.id]: (currentMediaIndex + 1) % project.media.length
                                  }));
                                }
                              }}
                            >
                              {/* Show all media items in sequence */}
                              {project.media.map((media, mediaIndex) => (
                                <div 
                                  key={`${project.id}-media-${mediaIndex}`}
                                  className="relative flex-shrink-0 w-full h-full"
                                  style={{ minWidth: '100%', maxWidth: '100%' }}
                                >
                                  {media.type === 'video' ? (
                                    <video
                                      src={media.url}
                                      className="w-full h-full object-cover"
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                                      style={{ objectFit: 'cover' }}
                                      sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                  )}
                                  
                                  {/* Play Button for Videos */}
                                  {media.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-16 h-16 bg-background/80 rounded-full flex items-center justify-center">
                                        <Play className="w-8 h-8 text-foreground ml-1" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </motion.div>

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2 z-10">
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
                          </div>
                        ) : (
                          <div className="w-full h-64 lg:h-full bg-muted flex items-center justify-center">
                            <div className="text-muted-foreground">{uiText.noImage}</div>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className={`lg:w-1/2 p-8 flex flex-col justify-center ${isCarouselLeft ? 'lg:order-2' : 'lg:order-1'}`}>
                        <div className="space-y-6">
                          {/* Title and Description */}
                          <div className="space-y-4">
                            <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                              {project.title}
                            </h3>
                            {project.description && (
                              <p className="text-lg text-muted-foreground leading-relaxed">
                                {project.description}
                              </p>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="space-y-4">
                            {project.location && (
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin className="w-5 h-5" />
                                <span className="text-lg">{project.location}</span>
                              </div>
                            )}
                            
                            {project.eventDate && (
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <Calendar className="w-5 h-5" />
                                <span className="text-lg">{formatDate(project.eventDate)}</span>
                              </div>
                            )}
                            
                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-sm">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* CTA Button */}
                          <div className="pt-4">
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
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="px-4 mt-16">
        <div className="container mx-auto text-center">
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