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
import { Search, Filter, User, Camera, Video } from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';

interface CrewListingProps {
  crewMembers: CrewMember[];
}

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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || selectedRole !== 'all'
                    ? 'No se encontraron resultados'
                    : 'No hay miembros del equipo'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedRole !== 'all'
                    ? 'Intenta con otros términos de búsqueda'
                    : 'El equipo se está preparando para mostrarse'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCrewMembers.map(member => (
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
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Bio */}
                    {member.bio.es && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
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

                    {/* Social Links */}
                    {member.socialLinks && (
                      <div className="flex gap-2">
                        {member.socialLinks.instagram && (
                          <Badge variant="outline" className="text-xs">
                            Instagram
                          </Badge>
                        )}
                        {member.socialLinks.linkedin && (
                          <Badge variant="outline" className="text-xs">
                            LinkedIn
                          </Badge>
                        )}
                        {member.socialLinks.website && (
                          <Badge variant="outline" className="text-xs">
                            Website
                          </Badge>
                        )}
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
                  </div>
                </CardContent>
              </Card>
            ))}
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

        {/* CTA */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2">
                ¿Quieres trabajar con nuestro equipo?
              </h3>
              <p className="text-muted-foreground mb-4">
                Cada miembro tiene su estilo único. Encuentra el fotógrafo o
                videógrafo perfecto para tu proyecto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button>Contactar al Equipo</Button>
                <Button variant="outline">Ver Nuestros Trabajos</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
