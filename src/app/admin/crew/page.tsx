'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, User, Eye, Users } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import { crewPortfolioService } from '@/services/crew-portfolio';
import type { CrewMember } from '@/types';
import type { CrewPortfolioStats } from '@/services/crew-portfolio';
import CrewWorkAssignment from '@/components/admin/CrewWorkAssignment';
import Image from 'next/image';

export default function CrewManagementPage() {
  const router = useRouter();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [crewStats, setCrewStats] = useState<
    Record<string, CrewPortfolioStats>
  >({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  type TabType = 'crew' | 'assignments';
  const [activeTab, setActiveTab] = useState<TabType>('crew');

  useEffect(() => {
    loadCrewMembers();
  }, []);

  const loadCrewMembers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Crew page - loading crew members...');
      const result = await crewMemberService.getAllCrewMembers();
      console.log('🔍 Crew page - getAll result:', result);
      if (result.success) {
        const crewData = (result.data as CrewMember[]) || [];
        setCrewMembers(crewData);

        // Load portfolio stats for each crew member
        const statsPromises = crewData.map(async crewMember => {
          const statsResult = await crewPortfolioService.getCrewMemberStats(
            crewMember.id
          );
          return {
            id: crewMember.id,
            stats:
              statsResult.success && statsResult.data
                ? statsResult.data
                : {
                    totalProjects: 0,
                    completedProjects: 0,
                    inProgressProjects: 0,
                    totalWorks: 0,
                    averageRating: 0,
                    topCategories: [],
                    recentWorks: [],
                  },
          };
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap: Record<string, CrewPortfolioStats> = {};
        statsResults.forEach(({ id, stats }) => {
          statsMap[id] = stats;
        });
        setCrewStats(statsMap);
      } else {
        console.error('Failed to load crew members:', result.error);
      }
    } catch (error) {
      console.error('Error loading crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadCrewMembers();
      return;
    }

    try {
      setLoading(true);
      const result = await crewMemberService.searchCrewMembers(searchTerm);
      if (result.success) {
        setCrewMembers((result.data as CrewMember[]) || []);
      } else {
        console.error('Search failed:', result.error);
      }
    } catch (error) {
      console.error('Error searching crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')
    ) {
      return;
    }

    try {
      const result = await crewMemberService.deleteCrewMember(id);
      if (result.success) {
        await loadCrewMembers();
      } else {
        console.error('Failed to delete crew member:', result.error);
      }
    } catch (error) {
      console.error('Error deleting crew member:', error);
    }
  };

  const handleEdit = (crewMember: CrewMember) => {
    router.push(`/admin/crew/${crewMember.id}/edit`);
  };

  const handleView = (crewMember: CrewMember) => {
    // For now, view will also go to edit page
    router.push(`/admin/crew/${crewMember.id}/edit`);
  };

  const handleAddNew = () => {
    router.push('/admin/crew/new');
  };

  const filteredCrewMembers = crewMembers.filter(
    member =>
      (member.name.es || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.name.en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.role.es || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.role.en || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Gestión de Equipo">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Equipo
            </h1>
            <p className="text-muted-foreground">
              Administra los miembros del equipo y sus perfiles profesionales
            </p>
          </div>
          {activeTab === 'crew' && (
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Miembro
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          <Button
            variant={activeTab === 'crew' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('crew')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <User className="w-4 h-4 mr-2" />
            Miembros del Equipo
          </Button>
          <Button
            variant={activeTab === 'assignments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('assignments')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users className="w-4 h-4 mr-2" />
            Asignaciones de Trabajo
          </Button>
        </div>

        {activeTab === 'crew' && (
          <>
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por nombre, rol o habilidades..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Crew Members List */}
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">
                      Cargando miembros del equipo...
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : filteredCrewMembers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {searchTerm
                        ? 'No se encontraron resultados'
                        : 'No hay miembros del equipo'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm
                        ? 'Intenta con otros términos de búsqueda'
                        : 'Comienza agregando el primer miembro del equipo'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Primer Miembro
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCrewMembers.map(member => (
                  <Card
                    key={member.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            {member.portrait ? (
                              <Image
                                src={member.portrait || '/default-avatar.png'}
                                alt={member.name.es || 'Miembro del equipo'}
                                className="w-12 h-12 rounded-full object-cover"
                                width={48}
                                height={48}
                              />
                            ) : (
                              <User className="w-6 h-6 text-primary" />
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
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(member)}
                            aria-label="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                            aria-label="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            aria-label="Eliminar"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
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
                                variant="secondary"
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

                        {/* Portfolio Stats */}
                        {crewStats[member.id] && (
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">
                                {crewStats[member.id].totalProjects}
                              </span>{' '}
                              proyectos
                            </div>
                            <div>
                              <span className="font-medium">
                                {crewStats[member.id].totalWorks}
                              </span>{' '}
                              trabajos
                            </div>
                            <div>
                              <span className="font-medium">
                                {crewStats[member.id].completedProjects}
                              </span>{' '}
                              completados
                            </div>
                            <div>
                              <span className="font-medium">
                                {crewStats[member.id].averageRating.toFixed(1)}
                              </span>{' '}
                              rating
                            </div>
                          </div>
                        )}

                        {member.socialLinks &&
                          (member.socialLinks.instagram ||
                            member.socialLinks.linkedin) && (
                            <div className="flex space-x-2">
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
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Work Assignment Section */}
            {/* Temporarily disabled due to TypeScript issue */}
            {/* {activeTab === 'assignments' && (
          <CrewWorkAssignment
            onAssignmentChange={(projectId, crewMemberIds) => {
              console.log('Crew assignment updated:', { projectId, crewMemberIds });
              // Reload crew members to refresh stats
              loadCrewMembers();
            }}
          />
        )} */}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
