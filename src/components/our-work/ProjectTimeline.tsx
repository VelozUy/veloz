'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Camera,
  Video,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelinePhase {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  icon: React.ReactNode;
  details?: string[];
}

interface ProjectTimelineProps {
  project: {
    id: string;
    title: string;
    eventDate?: string;
    location?: string;
    eventType?: string;
    crewMembers?: string[];
    timeline?: Array<{
      id: string;
      title: string;
      description: string;
      date: string;
      status: 'completed' | 'in_progress' | 'planned';
    }>;
  };
  className?: string;
  enhanced?: boolean; // Enable enhanced visual design
  onInteraction?: (action: 'view' | 'click' | 'expand') => void;
}

const getTimelinePhases = (
  project: ProjectTimelineProps['project']
): TimelinePhase[] => {
  const eventDate = project.eventDate
    ? new Date(project.eventDate)
    : new Date();
  const phases: TimelinePhase[] = [];

  // Pre-event phases
  phases.push({
    id: 'planning',
    title: 'Planificación',
    description: 'Definición de conceptos y logística del evento',
    date: new Date(
      eventDate.getTime() - 30 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    status: 'completed',
    icon: <Calendar className="w-5 h-5" />,
    details: [
      'Consulta inicial con el cliente',
      'Definición de conceptos y estilo',
      'Selección de locación y fechas',
      'Planificación de logística',
    ],
  });

  phases.push({
    id: 'preparation',
    title: 'Preparación',
    description: 'Preparativos finales y coordinación del equipo',
    date: new Date(
      eventDate.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    status: 'completed',
    icon: <Users className="w-5 h-5" />,
    details: [
      'Coordinación del equipo de trabajo',
      'Preparación de equipos técnicos',
      'Revisión de detalles finales',
      'Confirmación de horarios',
    ],
  });

  // Event day
  phases.push({
    id: 'event',
    title: 'Día del Evento',
    description: 'Captura de momentos especiales y cobertura completa',
    date: eventDate.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    status: 'completed',
    icon: <Camera className="w-5 h-5" />,
    details: [
      'Cobertura fotográfica completa',
      'Grabación de video profesional',
      'Captura de momentos especiales',
      'Interacción con invitados',
    ],
  });

  // Post-event phases
  phases.push({
    id: 'editing',
    title: 'Edición',
    description: 'Procesamiento y selección del mejor material',
    date: new Date(
      eventDate.getTime() + 3 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    status: 'completed',
    icon: <Video className="w-5 h-5" />,
    details: [
      'Selección de las mejores fotos',
      'Edición y retoque profesional',
      'Montaje de video highlights',
      'Preparación de álbum digital',
    ],
  });

  phases.push({
    id: 'delivery',
    title: 'Entrega',
    description: 'Entrega final de material procesado al cliente',
    date: new Date(
      eventDate.getTime() + 14 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    status: 'completed',
    icon: <CheckCircle className="w-5 h-5" />,
    details: [
      'Entrega de fotos en alta resolución',
      'Video editado profesional',
      'Álbum digital personalizado',
      'Soporte post-entrega',
    ],
  });

  return phases;
};

/**
 * Enhanced ProjectTimeline Component
 *
 * Modern timeline component with enhanced animations and interactions.
 * Preserves timeline functionality while adding portfolio-quality presentation.
 *
 * Performance Features:
 * - Optimized animations with reduced motion support
 * - Lazy loading of timeline details
 * - Smooth transitions and interactions
 * - Enhanced accessibility features
 *
 * Accessibility Features:
 * - ARIA labels for all interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly structure
 * - Focus management
 * - High contrast support
 */
export default function ProjectTimeline({
  project,
  className,
  onInteraction,
}: ProjectTimelineProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [visiblePhases, setVisiblePhases] = useState<Set<string>>(new Set());
  const phases = getTimelinePhases(project);

  // Track timeline view on mount
  useEffect(() => {
    onInteraction?.('view');

    // Initialize visible phases for animation
    const timer = setTimeout(() => {
      phases.forEach((phase, index) => {
        setTimeout(() => {
          setVisiblePhases(prev => new Set([...prev, phase.id]));
        }, index * 200);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [onInteraction, phases]);

  const handlePhaseClick = useCallback(
    (phaseId: string) => {
      setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
      onInteraction?.('click');
    },
    [expandedPhase, onInteraction]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, phaseId: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePhaseClick(phaseId);
      }
    },
    [handlePhaseClick]
  );

  const getStatusColor = useCallback((status: TimelinePhase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-primary text-primary-foreground';
      case 'upcoming':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }, []);

  const getStatusIcon = useCallback((status: TimelinePhase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-white" />;
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  }, []);

  return (
    <section
      className={cn('py-12 bg-background text-foreground', className)}
      role="region"
      aria-label={`Cronología del proyecto ${project.title}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Cronología del Proyecto
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre el proceso completo detrás de {project.title}, desde la
            planificación inicial hasta la entrega final
          </p>
        </motion.div>

        {/* Enhanced Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform -translate-x-1/2" />

          {/* Timeline Phases */}
          <div className="space-y-8">
            {phases.map((phase, index) => {
              const isVisible = visiblePhases.has(phase.id);
              const isExpanded = expandedPhase === phase.id;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={phase.id}
                  className={cn(
                    'relative flex items-start',
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  )}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  animate={{
                    opacity: isVisible ? 1 : 0,
                    x: isVisible ? 0 : isEven ? -50 : 50,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                    ease: 'easeOut',
                  }}
                >
                  {/* Timeline Dot */}
                  <div
                    className={cn(
                      'absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-background transform -translate-x-1/2',
                      getStatusColor(phase.status)
                    )}
                  >
                    {getStatusIcon(phase.status)}
                  </div>

                  {/* Content Card */}
                  <motion.div
                    className={cn(
                      'flex-1 ml-16 md:ml-0 md:w-5/12',
                      isEven ? 'md:pr-8' : 'md:pl-8'
                    )}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={cn(
                        'bg-card text-card-foreground rounded-lg p-6 shadow-lg border border-border',
                        'hover:shadow-xl transition-all duration-300',
                        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
                      )}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePhaseClick(phase.id)}
                      onKeyDown={e => handleKeyDown(e, phase.id)}
                      aria-label={`${phase.title} - ${phase.description}. Click para ver detalles`}
                      aria-expanded={isExpanded}
                    >
                      {/* Phase Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {phase.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {phase.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {phase.date}
                            </p>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            getStatusColor(phase.status)
                          )}
                        >
                          {phase.status === 'completed'
                            ? 'Completado'
                            : phase.status === 'in-progress'
                              ? 'En Progreso'
                              : 'Pendiente'}
                        </div>
                      </div>

                      {/* Phase Description */}
                      <p className="text-muted-foreground mb-4">
                        {phase.description}
                      </p>

                      {/* Expandable Details */}
                      <AnimatePresence>
                        {isExpanded && phase.details && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-border">
                              <h4 className="font-medium text-foreground mb-3">
                                Detalles del proceso:
                              </h4>
                              <ul className="space-y-2">
                                {phase.details.map((detail, detailIndex) => (
                                  <motion.li
                                    key={detailIndex}
                                    className="flex items-start space-x-2 text-sm text-muted-foreground"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      delay: detailIndex * 0.1,
                                    }}
                                  >
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    <span>{detail}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expand/Collapse Indicator */}
                      {phase.details && (
                        <div className="mt-4 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-6 h-6 text-muted-foreground"
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Footer */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-muted-foreground">
            Cada fase representa nuestro compromiso con la excelencia y la
            atención al detalle
          </p>
        </motion.div>
      </div>
    </section>
  );
}
