'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Loader2,
  Camera,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';
import { crewPortfolioService, type CrewWork } from '@/services/crew-portfolio';

interface CrewWorksProps {
  crewMember: CrewMember;
}

// Enhanced mock data for recent works - this would come from the database
const mockRecentWorks: CrewWork[] = [
  {
    id: '1',
    projectId: 'project-1',
    title: 'Boda María y Juan',
    category: 'casamiento',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Fotografía de boda en la costa de Chile',
    date: '2024-12-15',
    client: 'María González',
    location: 'Viña del Mar, Chile',
    status: 'delivered',
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
    projectId: 'project-2',
    title: 'Evento Corporativo TechCorp',
    category: 'corporativos',
    type: 'video' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Video promocional para empresa tecnológica',
    date: '2024-11-20',
    client: 'TechCorp Chile',
    location: 'Santiago, Chile',
    status: 'in_editing',
    crewRole: 'Videógrafo',
  },
  {
    id: '3',
    projectId: 'project-3',
    title: 'Sesión de Moda Revista Vogue',
    category: 'moda',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Fotografía de moda para revista local',
    date: '2024-10-10',
    client: 'Revista Vogue Chile',
    location: 'Santiago, Chile',
    status: 'delivered',
    rating: 5,
    review: 'Resultados espectaculares, muy satisfechos',
    images: ['/veloz-logo-blue.png', '/veloz-logo-blue.png'],
    crewRole: 'Fotógrafo',
  },
  {
    id: '4',
    projectId: 'project-4',
    title: 'Evento Cultural Centro Cultural',
    category: 'culturales',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Documentación de evento cultural',
    date: '2024-09-15',
    client: 'Centro Cultural Montevideo',
    location: 'Montevideo, Uruguay',
    status: 'delivered',
    rating: 4,
    review: 'Muy buen trabajo documentando el evento',
    images: ['/veloz-logo-blue.png'],
    crewRole: 'Fotógrafo',
  },
  {
    id: '5',
    projectId: 'project-5',
    title: 'Producto Comercial Empresa',
    category: 'producto',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Fotografía de producto para catálogo',
    date: '2024-08-20',
    client: 'Empresa Comercial',
    location: 'Montevideo, Uruguay',
    status: 'shooting_scheduled',
    crewRole: 'Fotógrafo',
  },
];

const statusConfig = {
  delivered: {
    label: 'Completado',
    color: 'bg-primary',
    textColor: 'text-primary',
  },
  in_editing: {
    label: 'En Progreso',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  shooting_scheduled: {
    label: 'Programado',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  draft: {
    label: 'Borrador',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  archived: {
    label: 'Archivado',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
};

export default function CrewWorks({ crewMember }: CrewWorksProps) {
  const [recentWorks, setRecentWorks] = useState<CrewWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const loadCrewWorks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await crewPortfolioService.getCrewMemberWorks(
        crewMember.id
      );
      if (response.success && response.data) {
        setRecentWorks(response.data);
        setUseMockData(false);
      } else {
        // Fallback to mock data if service fails
        console.warn('Crew works service failed, using mock data');
        setRecentWorks(mockRecentWorks);
        setUseMockData(true);
      }
    } catch (error) {
      console.error('Error loading crew works:', error);
      // Fallback to mock data
      setRecentWorks(mockRecentWorks);
      setUseMockData(true);
      setError('Error al cargar los trabajos - mostrando datos de ejemplo');
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

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      casamiento: 'Casamientos',
      corporativos: 'Corporativos',
      moda: 'Moda',
      producto: 'Producto',
      culturales: 'Culturales',
      photoshoot: 'Photoshoot',
      prensa: 'Prensa',
      otros: 'Otros',
    };
    return categoryLabels[category] || category;
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
        {useMockData && (
          <p className="text-sm text-primary mt-1">
            Mostrando datos de ejemplo - sistema en desarrollo
          </p>
        )}
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
                          className={`${getStatusConfig(work.status).color} ${getStatusConfig(work.status).textColor}`}
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
                          {getCategoryLabel(work.category)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {work.crewRole}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress for in-progress projects */}
                    {(work.status === 'in_editing' ||
                      work.status === 'shooting_scheduled') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span>0%</span> {/* Placeholder for progress */}
                        </div>
                        <Progress value={0} className="h-2" />{' '}
                        {/* Placeholder for progress */}
                      </div>
                    )}

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
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/our-work/${work.category}`}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver Categoría
                        </Link>
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
