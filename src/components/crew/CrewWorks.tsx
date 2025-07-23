'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Users, Star, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';
import { crewPortfolioService, type CrewWork } from '@/services/crew-portfolio';

interface CrewWorksProps {
  crewMember: CrewMember;
}

// Mock data for recent works - this would come from the database
const mockRecentWorks = [
  {
    id: '1',
    title: 'Boda María y Juan',
    client: 'María González',
    category: 'casamiento',
    location: 'Viña del Mar, Chile',
    date: '2024-12-15',
    status: 'completed',
    rating: 5,
    review: 'Excelente trabajo, muy profesional y creativo',
    images: [
      '/veloz-logo-blue.png',
      '/veloz-logo-blue.png',
      '/veloz-logo-blue.png',
    ],
    crewRole: 'Fotógrafo Principal',
  },
  {
    id: '2',
    title: 'Evento Corporativo TechCorp',
    client: 'TechCorp Chile',
    category: 'corporativos',
    location: 'Santiago, Chile',
    date: '2024-11-20',
    status: 'in_progress',
    progress: 75,
    crewRole: 'Videógrafo',
  },
  {
    id: '3',
    title: 'Sesión de Moda Revista Vogue',
    client: 'Revista Vogue Chile',
    category: 'moda',
    location: 'Santiago, Chile',
    date: '2024-10-10',
    status: 'completed',
    rating: 5,
    review: 'Resultados espectaculares, muy satisfechos',
    images: ['/veloz-logo-blue.png', '/veloz-logo-blue.png'],
    crewRole: 'Fotógrafo',
  },
];

const statusConfig = {
  delivered: { label: 'Completado', color: 'bg-primary' },
  in_editing: { label: 'En Progreso', color: 'bg-primary' },
  shooting_scheduled: { label: 'Programado', color: 'bg-primary' },
  draft: { label: 'Borrador', color: 'bg-muted' },
  archived: { label: 'Archivado', color: 'bg-muted' },
};

export default function CrewWorks({ crewMember }: CrewWorksProps) {
  const [recentWorks, setRecentWorks] = useState<CrewWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCrewWorks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await crewPortfolioService.getCrewMemberWorks(
        crewMember.id
      );
      if (response.success && response.data) {
        setRecentWorks(response.data);
      } else {
        setError(response.error || 'Error al cargar los trabajos');
      }
    } catch (error) {
      console.error('Error loading crew works:', error);
      setError('Error al cargar los trabajos');
    } finally {
      setLoading(false);
    }
  }, [crewMember.id]);

  useEffect(() => {
    loadCrewWorks();
  }, [loadCrewWorks]);

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Trabajos Recientes de {crewMember.name.es}
        </h2>
        <p className="text-muted-foreground">
          Proyectos recientes donde {crewMember.name.es} ha participado
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {recentWorks.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Proyectos Totales
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {recentWorks.filter(w => w.status === 'delivered').length}
              </div>
              <div className="text-sm text-muted-foreground">Completados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {
                  recentWorks.filter(
                    w =>
                      w.status === 'in_editing' ||
                      w.status === 'shooting_scheduled'
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">En Progreso</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {recentWorks.filter(w => w.rating === 5).length}
              </div>
              <div className="text-sm text-muted-foreground">5 Estrellas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Cargando trabajos de {crewMember.name.es}...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Error al cargar los trabajos
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadCrewWorks} variant="outline">
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Works List */}
      {!loading && !error && (
        <div className="space-y-4">
          {recentWorks.map(work => (
            <Card key={work.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Images */}
                  <div className="flex-shrink-0">
                    <div className="grid grid-cols-3 gap-2 w-48">
                      {work.images ? (
                        work.images.slice(0, 3).map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square relative overflow-hidden rounded-lg"
                          >
                            <Image
                              src={image}
                              alt={`${work.title} - imagen ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">
                            Sin imágenes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold">{work.title}</h3>
                        <Badge
                          variant="secondary"
                          className={
                            getStatusConfig(work.status).color +
                            ' text-foreground'
                          }
                        >
                          {getStatusConfig(work.status).label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {work.client}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {work.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(work.date).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {work.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {work.crewRole}
                        </Badge>
                      </div>
                    </div>

                    {/* Rating for completed projects */}
                    {work.status === 'delivered' && work.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(work.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-primary text-primary"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {work.rating}/5 estrellas
                        </span>
                      </div>
                    )}

                    {/* Review */}
                    {work.review && (
                      <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-4">
                        &ldquo;{work.review}&rdquo;
                      </blockquote>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                      <Button size="sm" variant="outline">
                        Contactar Cliente
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">
              ¿Quieres trabajar con {crewMember.name.es}?
            </h3>
            <p className="text-muted-foreground mb-4">
              Contacta directamente para discutir tu proyecto y ver más trabajos
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>Contactar a {crewMember.name.es}</Button>
              <Button variant="outline">Ver Todos los Trabajos</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
