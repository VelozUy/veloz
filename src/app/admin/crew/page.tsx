'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Search, Edit, Trash2, User, Eye, Users, Calendar, MapPin, Check, X } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import { ProjectTrackingService } from '@/services/project-tracking';
import { CrewMember } from '@/types';
import { EnhancedProject } from '@/types/project-tracking';

export default function CrewManagementPage() {
  const router = useRouter();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingSkills, setEditingSkills] = useState<string | null>(null);
  const [editingProjects, setEditingProjects] = useState<string | null>(null);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [tempProjects, setTempProjects] = useState<string[]>([]);

  // Common skills for quick selection
  const commonSkills = [
    'Fotografía', 'Videografía', 'Edición', 'Iluminación', 'Sonido',
    'Dron', 'Retoque', 'Color Grading', 'Motion Graphics', 'Animación',
    'Dirección', 'Producción', 'Asistente', 'Técnico', 'Artista'
  ];

  useEffect(() => {
    loadCrewMembers();
    loadProjects();
  }, []);

  const loadCrewMembers = async () => {
    try {
      const result = await crewMemberService.getAllCrewMembers();
      if (result.success && result.data) {
        setCrewMembers(result.data);
      }
    } catch (error) {
      console.error('Error loading crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projectTrackingService = new ProjectTrackingService();
      const projectList = await projectTrackingService.getAllProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleDeleteCrewMember = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')) {
      try {
        await crewMemberService.deleteCrewMember(id);
        await loadCrewMembers();
      } catch (error) {
        console.error('Error deleting crew member:', error);
      }
    }
  };

  const startEditingSkills = (memberId: string, currentSkills: string[]) => {
    setEditingSkills(memberId);
    setTempSkills([...currentSkills]);
  };

  const startEditingProjects = (memberId: string, currentProjects: string[]) => {
    setEditingProjects(memberId);
    setTempProjects([...currentProjects]);
  };

  const saveSkills = async (memberId: string) => {
    try {
      const member = crewMembers.find(m => m.id === memberId);
      if (member) {
        await crewMemberService.updateCrewMember(memberId, {
          ...member,
          skills: tempSkills
        });
        await loadCrewMembers();
      }
    } catch (error) {
      console.error('Error updating skills:', error);
    } finally {
      setEditingSkills(null);
      setTempSkills([]);
    }
  };

  const saveProjects = async (memberId: string) => {
    try {
      // Update each project that has this crew member
      const projectTrackingService = new ProjectTrackingService();
      
      // Remove member from all projects first
      for (const project of projects) {
        if (project.crewMembers?.includes(memberId)) {
          const updatedCrewMembers = project.crewMembers.filter(id => id !== memberId);
          await projectTrackingService.updateProject(project.id, {
            crewMembers: updatedCrewMembers
          });
        }
      }

      // Add member to selected projects
      for (const projectId of tempProjects) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          const currentCrewMembers = project.crewMembers || [];
          if (!currentCrewMembers.includes(memberId)) {
            await projectTrackingService.updateProject(projectId, {
              crewMembers: [...currentCrewMembers, memberId]
            });
          }
        }
      }

      await loadProjects();
    } catch (error) {
      console.error('Error updating projects:', error);
    } finally {
      setEditingProjects(null);
      setTempProjects([]);
    }
  };

  const cancelEditing = () => {
    setEditingSkills(null);
    setEditingProjects(null);
    setTempSkills([]);
    setTempProjects([]);
  };

  const toggleSkill = (skill: string) => {
    setTempSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleProject = (projectId: string) => {
    setTempProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const filteredCrewMembers = crewMembers.filter(member =>
    (member.name.es || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.name.en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role.es || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role.en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCrewMemberAssignments = (memberId: string) => {
    return projects.filter(project => 
      project.crewMembers?.includes(memberId)
    );
  };

  const getDisplayName = (member: CrewMember) => {
    return member.name.es || member.name.en || 'Miembro del Equipo';
  };

  const getDisplayRole = (member: CrewMember) => {
    return member.role.es || member.role.en || 'Rol';
  };

  const getMemberSkills = (member: CrewMember) => {
    return Array.isArray(member.skills) ? member.skills : [];
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando miembros del equipo...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crew</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los miembros del equipo y sus perfiles
            </p>
          </div>
          <Button onClick={() => router.push('/admin/crew/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Miembro
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre, rol o habilidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Crew Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Miembros del Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCrewMembers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miembro</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Habilidades</TableHead>
                    <TableHead>Proyectos Actuales</TableHead>
                    <TableHead>Redes Sociales</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCrewMembers.map((member) => {
                    const assignments = getCrewMemberAssignments(member.id);
                    const displayName = getDisplayName(member);
                    const displayRole = getDisplayRole(member);
                    const isEditingSkills = editingSkills === member.id;
                    const isEditingProjects = editingProjects === member.id;
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{displayName}</div>
                              {member.bio.es && (
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {member.bio.es}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{displayRole}</div>
                        </TableCell>
                        <TableCell>
                          {isEditingSkills ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {tempSkills.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-xs">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Agregar Habilidad
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <Label>Seleccionar Habilidades</Label>
                                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                      {commonSkills.map((skill) => (
                                        <div key={skill} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={skill}
                                            checked={tempSkills.includes(skill)}
                                            onCheckedChange={() => toggleSkill(skill)}
                                          />
                                          <Label htmlFor={skill} className="text-sm cursor-pointer">
                                            {skill}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  onClick={() => saveSkills(member.id)}
                                  className="h-6 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditing}
                                  className="h-6 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                                                          <div 
                                className="flex flex-wrap gap-1 max-w-xs cursor-pointer hover:bg-muted p-1 rounded"
                                onClick={() => startEditingSkills(member.id, getMemberSkills(member))}
                              >
                                {getMemberSkills(member).slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {getMemberSkills(member).length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{getMemberSkills(member).length - 3}
                                  </Badge>
                                )}
                                <Edit className="w-3 h-3 text-muted-foreground ml-1" />
                              </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditingProjects ? (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                {tempProjects.map((projectId) => {
                                  const project = projects.find(p => p.id === projectId);
                                  return project ? (
                                    <div key={projectId} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground truncate max-w-32">
                                        {project.title.es || project.title.en || 'Proyecto'}
                                      </span>
                                      <Badge 
                                        variant={project.status === 'delivered' ? 'default' : 'secondary'}
                                        className="text-xs ml-1"
                                      >
                                        {project.status}
                                      </Badge>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-xs">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Asignar Proyecto
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <Label>Seleccionar Proyectos</Label>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                      {projects.map((project) => (
                                        <div key={project.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={project.id}
                                            checked={tempProjects.includes(project.id)}
                                            onCheckedChange={() => toggleProject(project.id)}
                                          />
                                          <Label htmlFor={project.id} className="text-sm cursor-pointer flex-1">
                                            <div className="flex items-center justify-between">
                                              <span className="truncate">
                                                {project.title.es || project.title.en || 'Proyecto'}
                                              </span>
                                              <Badge 
                                                variant={project.status === 'delivered' ? 'default' : 'secondary'}
                                                className="text-xs ml-2"
                                              >
                                                {project.status}
                                              </Badge>
                                            </div>
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  onClick={() => saveProjects(member.id)}
                                  className="h-6 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditing}
                                  className="h-6 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-muted p-1 rounded"
                              onClick={() => startEditingProjects(member.id, assignments.map(p => p.id))}
                            >
                              {assignments.length > 0 ? (
                                <div className="space-y-1">
                                  {assignments.slice(0, 2).map((project) => (
                                    <div key={project.id} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground truncate max-w-32">
                                        {project.title.es || project.title.en || 'Proyecto'}
                                      </span>
                                      <Badge 
                                        variant={project.status === 'delivered' ? 'default' : 'secondary'}
                                        className="text-xs ml-1"
                                      >
                                        {project.status}
                                      </Badge>
                                    </div>
                                  ))}
                                  {assignments.length > 2 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{assignments.length - 2} más
                                    </div>
                                  )}
                                  <Edit className="w-3 h-3 text-muted-foreground mt-1" />
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <span className="text-muted-foreground text-sm">Sin proyectos</span>
                                  <Edit className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.socialLinks && Object.keys(member.socialLinks).length > 0 ? (
                            <div className="flex space-x-2">
                              {member.socialLinks.instagram && (
                                <a
                                  href={member.socialLinks.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-500 hover:text-pink-600"
                                  title="Instagram"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                </a>
                              )}
                              {member.socialLinks.linkedin && (
                                <a
                                  href={member.socialLinks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                  title="LinkedIn"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                </a>
                              )}
                              {member.socialLinks.twitter && (
                                <a
                                  href={member.socialLinks.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-500"
                                  title="Twitter"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin redes</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/crew/${member.id}/edit`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCrewMember(member.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'No se encontraron miembros' : 'No hay miembros del equipo'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Comienza agregando el primer miembro del equipo'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/admin/crew/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Miembro
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
