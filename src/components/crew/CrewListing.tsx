'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Instagram,
  Linkedin,
  Globe,
  Mail,
  Facebook,
  Twitter,
  Youtube,
  ExternalLink,
  Share2,
  Search,
  Filter,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';

interface CrewListingProps {
  crewMembers: CrewMember[];
}

// Social media platform configuration
const socialMediaConfig = {
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'text-primary',
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    color: 'text-primary',
  },
  website: {
    icon: Globe,
    label: 'Website',
    color: 'text-primary',
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: 'text-primary',
  },
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: 'text-primary',
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: 'text-primary',
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    color: 'text-primary',
  },
  vimeo: {
    icon: ExternalLink,
    label: 'Vimeo',
    color: 'text-primary',
  },
  behance: {
    icon: ExternalLink,
    label: 'Behance',
    color: 'text-primary',
  },
  dribbble: {
    icon: Share2,
    label: 'Dribbble',
    color: 'text-primary',
  },
  pinterest: {
    icon: Share2,
    label: 'Pinterest',
    color: 'text-primary',
  },
  tiktok: {
    icon: ExternalLink,
    label: 'TikTok',
    color: 'text-foreground',
  },
};

// Available skills for filtering
const availableSkills = [
  'Fotografía',
  'Videografía',
  'Edición',
  'Iluminación',
  'Sonido',
  'Dron',
  'Retoque',
  'Color Grading',
  'Motion Graphics',
  'Animación',
  'Dirección',
  'Producción',
  'Asistente',
  'Técnico',
  'Artista',
];

export default function CrewListing({ crewMembers }: CrewListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Get available social media links for a crew member
  const getAvailableSocialLinks = (member: CrewMember) => {
    if (!member.socialLinks) return [];

    return Object.entries(member.socialLinks)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([platform, value]) => ({
        platform,
        value: value!,
        config: socialMediaConfig[platform as keyof typeof socialMediaConfig],
      }));
  };

  // Get unique roles from crew members
  const uniqueRoles = useMemo(() => {
    const roles = crewMembers
      .map(member => member.role?.es || member.role?.en || '')
      .filter(role => role.trim() !== '')
      .filter((role, index, arr) => arr.indexOf(role) === index);
    return roles.sort();
  }, [crewMembers]);

  // Filter crew members based on search and filters
  const filteredCrewMembers = useMemo(() => {
    return crewMembers.filter(member => {
      // Search query filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        (member.name?.es || '').toLowerCase().includes(searchLower) ||
        (member.name?.en || '').toLowerCase().includes(searchLower) ||
        (member.role?.es || '').toLowerCase().includes(searchLower) ||
        (member.role?.en || '').toLowerCase().includes(searchLower) ||
        (member.bio?.es || '').toLowerCase().includes(searchLower) ||
        (member.bio?.en || '').toLowerCase().includes(searchLower) ||
        (member.skills || []).some(skill =>
          skill.toLowerCase().includes(searchLower)
        );

      // Skill filter
      const matchesSkill =
        selectedSkill === 'all' ||
        (member.skills || []).includes(selectedSkill);

      // Role filter
      const memberRole = member.role?.es || member.role?.en || '';
      const matchesRole = selectedRole === 'all' || memberRole === selectedRole;

      return matchesSearch && matchesSkill && matchesRole;
    });
  }, [crewMembers, searchQuery, selectedSkill, selectedRole]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkill('all');
    setSelectedRole('all');
  };

  const hasActiveFilters =
    searchQuery || selectedSkill !== 'all' || selectedRole !== 'all';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background">
        <div className="max-w-border-64 mx-auto px-4 md:px-8 lg:px-8 xl:px-16 py-12">
          <div className="text-center">
            <h1 className="text-section-title-lg font-body font-semibold mb-4">
              Nuestro Equipo
            </h1>
            <p className="text-xl text-background/80 max-w-2xl mx-auto">
              Conoce a nuestro equipo de fotógrafos y videógrafos profesionales.
              Cada miembro tiene su estilo único y especialidades.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-border-64 mx-auto px-4 md:px-8 lg:px-8 xl:px-16 py-8">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, rol, especialidades..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {
                    [
                      searchQuery,
                      selectedSkill !== 'all' ? selectedSkill : '',
                      selectedRole !== 'all' ? selectedRole : '',
                    ].filter(Boolean).length
                  }
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skill Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Especialidad
                  </label>
                  <Select
                    value={selectedSkill}
                    onValueChange={setSelectedSkill}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las especialidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todas las especialidades
                      </SelectItem>
                      {availableSkills.map(skill => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rol</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      {uniqueRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredCrewMembers.length} miembro
              {filteredCrewMembers.length !== 1 ? 's' : ''} encontrado
              {filteredCrewMembers.length !== 1 ? 's' : ''}
              {crewMembers.length !== filteredCrewMembers.length && (
                <span> de {crewMembers.length} total</span>
              )}
            </span>
            {hasActiveFilters && (
              <span>
                Filtros activos:{' '}
                {[
                  searchQuery,
                  selectedSkill !== 'all' ? selectedSkill : '',
                  selectedRole !== 'all' ? selectedRole : '',
                ]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Crew Members Grid */}
        {filteredCrewMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters
                ? 'No se encontraron miembros'
                : 'No hay miembros del equipo disponibles'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros o la búsqueda'
                : 'No hay miembros del equipo para mostrar en este momento.'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCrewMembers.map(member => {
              const availableSocialLinks = getAvailableSocialLinks(member);

              return (
                <Link
                  key={member.id}
                  href={`/crew/${getSlugFromName(member.name.es || '')}`}
                  className="block"
                >
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                            {member.portrait ? (
                              <Image
                                src={member.portrait}
                                alt={member.name.es || 'Crew Member'}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {member.name.es}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {member.role.es}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Bio Preview */}
                      {member.bio.es && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {member.bio.es}
                        </p>
                      )}

                      {/* Skills */}
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} más
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Enhanced Social Links */}
                      {availableSocialLinks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">
                            Redes Sociales
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {availableSocialLinks
                              .slice(0, 4)
                              .map(({ platform, config }) => {
                                const IconComponent = config.icon;
                                return (
                                  <div
                                    key={platform}
                                    className={`p-1 rounded-full ${config.color} bg-muted/50`}
                                    title={config.label}
                                  >
                                    <IconComponent className="w-3 h-3" />
                                  </div>
                                );
                              })}
                            {availableSocialLinks.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{availableSocialLinks.length - 4} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
