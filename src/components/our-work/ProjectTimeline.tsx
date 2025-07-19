'use client';

import { useState, useEffect } from 'react';
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

export default function ProjectTimeline({
  project,
  className,
  onInteraction,
}: ProjectTimelineProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const phases = getTimelinePhases(project);

  // Track timeline view on mount
  useEffect(() => {
    onInteraction?.('view');
  }, [onInteraction]);

  const handlePhaseClick = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
    onInteraction?.('click');
  };

  const getStatusColor = (status: TimelinePhase['status']) => {
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
  };

  const getStatusIcon = (status: TimelinePhase['status']) => {
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
  };

  return (
    <section className={cn('py-12 bg-background', className)}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-body font-normal mb-4 text-foreground">
            Cronología del Proyecto
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body">
            Descubre el proceso completo detrás de {project.title}, desde la
            planificación inicial hasta la entrega final
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />

          {/* Timeline Phases */}
          <div className="space-y-8">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-6">
                  {/* Timeline Dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center z-10 relative">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          getStatusColor(phase.status)
                        )}
                      >
                        {phase.icon}
                      </div>
                    </div>
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground font-medium">
                      {phase.date}
                    </div>
                  </div>

                  {/* Phase Content */}
                  <div className="flex-1 min-w-0">
                    <motion.div
                      className="bg-card border border-border rounded-none p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      onClick={() =>
                        setExpandedPhase(
                          expandedPhase === phase.id ? null : phase.id
                        )
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedPhase(
                            expandedPhase === phase.id ? null : phase.id
                          );
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-body font-normal text-card-foreground">
                              {phase.title}
                            </h3>
                            <div
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                                getStatusColor(phase.status)
                              )}
                            >
                              {getStatusIcon(phase.status)}
                              {phase.status === 'completed' && 'Completado'}
                              {phase.status === 'in-progress' && 'En Progreso'}
                              {phase.status === 'upcoming' && 'Próximo'}
                            </div>
                          </div>
                          <p className="text-muted-foreground font-body">
                            {phase.description}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <AnimatePresence>
                        {expandedPhase === phase.id && phase.details && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-border">
                              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide font-body">
                                Actividades Incluidas
                              </h4>
                              <ul className="space-y-2">
                                {phase.details.map((detail, detailIndex) => (
                                  <motion.li
                                    key={detailIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      delay: detailIndex * 0.1,
                                    }}
                                    className="flex items-start gap-2 text-sm font-body"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <span className="text-card-foreground">
                                      {detail}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-card border border-border rounded-none p-6">
            <h3 className="text-lg font-body font-normal mb-2 text-card-foreground">
              ¿Te gustaría un proceso similar para tu evento?
            </h3>
            <p className="text-muted-foreground mb-4 font-body">
              Cada proyecto es único y nos adaptamos a tus necesidades
              específicas
            </p>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-none font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              Consultar Disponibilidad
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
