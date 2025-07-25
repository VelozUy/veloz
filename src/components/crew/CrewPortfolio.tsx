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
import { Input } from '@/components/ui/input';
import {
  Camera,
  Video,
  Filter,
  Loader2,
  Search,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';
import { crewPortfolioService, type CrewWork } from '@/services/crew-portfolio';

interface CrewPortfolioProps {
  crewMember: CrewMember;
}

// Enhanced mock data for crew member works - this would come from the database
const mockWorks: CrewWork[] = [
  {
    id: '1',
    projectId: 'project-1',
    title: 'Boda en Viña del Mar',
    category: 'casamiento',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Fotografía de boda en la costa de Chile',
    date: '2024-12-15',
    client: 'María y Juan',
    location: 'Viña del Mar, Chile',
    status: 'delivered',
    crewRole: 'Fotógrafo Principal',
    rating: 5,
    review: 'Excelente trabajo, muy profesional y creativo',
  },
  {
    id: '2',
    projectId: 'project-2',
    title: 'Evento Corporativo Tech',
    category: 'corporativos',
    type: 'video' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Video promocional para empresa tecnológica',
    date: '2024-11-20',
    client: 'TechCorp Chile',
    location: 'Santiago, Chile',
    status: 'delivered',
    crewRole: 'Videógrafo',
    rating: 5,
  },
  {
    id: '3',
    projectId: 'project-3',
    title: 'Sesión de Moda',
    category: 'moda',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Fotografía de moda para revista local',
    date: '2024-10-10',
    client: 'Revista Vogue Chile',
    location: 'Santiago, Chile',
    status: 'delivered',
    crewRole: 'Fotógrafo',
    rating: 5,
    review: 'Resultados espectaculares, muy satisfechos',
  },
  {
    id: '4',
    projectId: 'project-4',
    title: 'Evento Cultural',
    category: 'culturales',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Documentación de evento cultural',
    date: '2024-09-15',
    client: 'Centro Cultural',
    location: 'Montevideo, Uruguay',
    status: 'delivered',
    crewRole: 'Fotógrafo',
    rating: 4,
  },
  {
    id: '5',
    projectId: 'project-5',
    title: 'Producto Comercial',
    category: 'producto',
    type: 'image' as const,
    url: '/veloz-logo-blue.png',
    thumbnailUrl: '/veloz-logo-blue.png',
    description: 'Fotografía de producto para catálogo',
    date: '2024-08-20',
    client: 'Empresa Comercial',
    location: 'Montevideo, Uruguay',
    status: 'delivered',
    crewRole: 'Fotógrafo',
    rating: 5,
  },
];

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'casamiento', label: 'Casamientos' },
  { value: 'corporativos', label: 'Corporativos' },
  { value: 'moda', label: 'Moda' },
  { value: 'producto', label: 'Producto' },
  { value: 'culturales', label: 'Culturales' },
  { value: 'photoshoot', label: 'Photoshoot' },
  { value: 'prensa', label: 'Prensa' },
  { value: 'otros', label: 'Otros' },
];

export default function CrewPortfolio({ crewMember }: CrewPortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [works, setWorks] = useState<CrewWork[]>([]);
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
        setWorks(response.data);
        setUseMockData(false);
      } else {
        // Fallback to mock data if service fails
        console.warn('Crew portfolio service failed, using mock data');
        setWorks(mockWorks);
        setUseMockData(true);
      }
    } catch (error) {
      console.error('Error loading crew works:', error);
      // Fallback to mock data
      setWorks(mockWorks);
      setUseMockData(true);
      setError('Error al cargar los trabajos - mostrando datos de ejemplo');
    } finally {
      setLoading(false);
    }
  }, [crewMember.id]);

  useEffect(() => {
    loadCrewWorks();
  }, [loadCrewWorks]);

  // Filter works based on category and search query
  const filteredWorks = works.filter(work => {
    const matchesCategory =
      selectedCategory === 'all' || work.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.client.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

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
          {useMockData && (
            <p className="text-sm text-primary mt-1">
              Mostrando datos de ejemplo - sistema en desarrollo
            </p>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar trabajos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
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
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredWorks.length} trabajo{filteredWorks.length !== 1 ? 's' : ''}{' '}
          encontrado{filteredWorks.length !== 1 ? 's' : ''}
        </span>
        {searchQuery && <span>Buscando: &quot;{searchQuery}&quot;</span>}
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
                      {getCategoryLabel(work.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(work.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Client and Location */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Cliente: {work.client}</div>
                    <div>Ubicación: {work.location}</div>
                  </div>

                  {/* Rating for completed projects */}
                  {work.rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(work.rating)].map((_, i) => (
                        <span key={i} className="text-primary">
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        {work.rating}/5
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // TODO: Implement lightbox or modal for viewing work
                        console.log('View work:', work.id);
                      }}
                    >
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/our-work/${work.category}`}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver Categor&iacute;a
                      </Link>
                    </Button>
                  </div>
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
