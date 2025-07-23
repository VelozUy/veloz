'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Video, Filter, Loader2 } from 'lucide-react';
import type { CrewMember } from '@/types';
import { crewPortfolioService, type CrewWork } from '@/services/crew-portfolio';

interface CrewPortfolioProps {
  crewMember: CrewMember;
}

// Mock data for crew member works - this would come from the database
const mockWorks = [
  {
    id: '1',
    title: 'Boda en Viña del Mar',
    category: 'casamiento',
    type: 'image',
    url: '/api/placeholder/600/400',
    thumbnailUrl: '/api/placeholder/300/200',
    description: 'Fotografía de boda en la costa de Chile',
    date: '2024-12-15',
  },
  {
    id: '2',
    title: 'Evento Corporativo Tech',
    category: 'corporativos',
    type: 'video',
    url: '/api/placeholder/600/400',
    thumbnailUrl: '/api/placeholder/300/200',
    description: 'Video promocional para empresa tecnológica',
    date: '2024-11-20',
  },
  {
    id: '3',
    title: 'Sesión de Moda',
    category: 'moda',
    type: 'image',
    url: '/api/placeholder/600/400',
    thumbnailUrl: '/api/placeholder/300/200',
    description: 'Fotografía de moda para revista local',
    date: '2024-10-10',
  },
];

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'casamiento', label: 'Casamientos' },
  { value: 'corporativos', label: 'Corporativos' },
  { value: 'moda', label: 'Moda' },
  { value: 'producto', label: 'Producto' },
  { value: 'culturales-artisticos', label: 'Culturales & Artísticos' },
  { value: 'photoshoot', label: 'Photoshoot' },
  { value: 'prensa', label: 'Prensa' },
  { value: 'otros', label: 'Otros' },
];

export default function CrewPortfolio({ crewMember }: CrewPortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [works, setWorks] = useState<CrewWork[]>([]);
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
        setWorks(response.data);
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

  const filteredWorks = works.filter(
    work => selectedCategory === 'all' || work.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            Portfolio de {crewMember.name.es}
          </h2>
          <p className="text-muted-foreground">
            Explora los trabajos más recientes y destacados
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      {/* Works Grid */}
      {!loading && !error && filteredWorks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No hay trabajos en esta categoría
              </h3>
              <p className="text-muted-foreground">
                Prueba seleccionando otra categoría o contacta directamente con{' '}
                {crewMember.name.es}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !loading && !error ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorks.map(work => (
            <Card
              key={work.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <Image
                    src={work.thumbnailUrl || work.url}
                    alt={work.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    {work.type === 'video' ? (
                      <Badge variant="secondary" className="bg-background/80">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-background/80">
                        <Camera className="w-3 h-3 mr-1" />
                        Foto
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {work.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {work.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.value === work.category)?.label ||
                        work.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(work.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // TODO: Implement lightbox or modal for viewing work
                      console.log('View work:', work.id);
                    }}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Contact CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">
              ¿Te gusta el estilo de {crewMember.name.es}?
            </h3>
            <p className="text-muted-foreground mb-4">
              Contacta directamente para discutir tu proyecto
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>Contactar a {crewMember.name.es}</Button>
              <Button variant="outline">Ver Más Trabajos</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
