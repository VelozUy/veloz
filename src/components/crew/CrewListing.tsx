'use client';

import { useState } from 'react';
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
  Search,
  Filter,
  User,
  Camera,
  Video,
  Instagram,
  Linkedin,
  Globe,
  Mail,
  Facebook,
  Twitter,
  Youtube,
  ExternalLink,
  Share2,
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
    icon: Video,
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
    icon: Video,
    label: 'TikTok',
    color: 'text-foreground',
  },
};

export default function CrewListing({ crewMembers }: CrewListingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const filteredCrewMembers = crewMembers.filter(member => {
    const matchesSearch =
      member.name.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesRole =
      selectedRole === 'all' ||
      member.role.es?.toLowerCase().includes(selectedRole.toLowerCase()) ||
      member.role.en?.toLowerCase().includes(selectedRole.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const roles = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'fotógrafo', label: 'Fotógrafos' },
    { value: 'videógrafo', label: 'Videógrafos' },
    { value: 'editor', label: 'Editores' },
    { value: 'director', label: 'Directores' },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, rol o especialidad..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Crew Members Grid */}
        {filteredCrewMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCrewMembers.map(member => {
              const availableSocialLinks = getAvailableSocialLinks(member);

              return (
                <Card
                  key={member.id}
                  className="group hover:shadow-lg transition-shadow"
                >
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

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/crew/${getSlugFromName(member.name.es || '')}`}
                      >
                        <Button size="sm" className="flex-1">
                          Ver Perfil
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        Contactar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {crewMembers.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Miembros del Equipo
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {
                    crewMembers.filter(m =>
                      m.role.es?.toLowerCase().includes('fotógrafo')
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Fotógrafos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {
                    crewMembers.filter(m =>
                      m.role.es?.toLowerCase().includes('videógrafo')
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Videógrafos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {crewMembers.reduce((acc, m) => acc + m.skills.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Especialidades
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
