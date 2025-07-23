'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users, Calendar, MapPin, Eye } from 'lucide-react';
import { projectTrackingService } from '@/services/project-tracking';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';
import type { EnhancedProject } from '@/types/project-tracking';

interface CrewWorkAssignmentProps {
  crewMemberId?: string;
  onAssignmentChange?: (projectId: string, crewMemberIds: string[]) => void;
}

export default function CrewWorkAssignment({
  crewMemberId,
  onAssignmentChange,
}: CrewWorkAssignmentProps) {
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCrewMembers, setSelectedCrewMembers] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsResult, crewResult] = await Promise.all([
        projectTrackingService.getAllProjects(),
        crewMemberService.getAllCrewMembers(),
      ]);

      setProjects(projectsResult || []);

      if (crewResult.success) {
        setCrewMembers(crewResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedCrewMembers(project.crewMembers || []);
    }
  };

  const handleCrewMemberToggle = (crewMemberId: string) => {
    setSelectedCrewMembers(prev => {
      const isSelected = prev.includes(crewMemberId);
      if (isSelected) {
        return prev.filter(id => id !== crewMemberId);
      } else {
        return [...prev, crewMemberId];
      }
    });
  };

  const handleSaveAssignment = async () => {
    if (!selectedProject) return;

    try {
      // Update project with new crew assignments
      await projectTrackingService.updateProject(selectedProject, {
        crewMembers: selectedCrewMembers,
      });

      // Update local state
      setProjects(prev =>
        prev.map(project =>
          project.id === selectedProject
            ? { ...project, crewMembers: selectedCrewMembers }
            : project
        )
      );

      onAssignmentChange?.(selectedProject, selectedCrewMembers);
    } catch (error) {
      console.error('Error updating crew assignment:', error);
    }
  };

  const filteredProjects = projects.filter(
    project =>
      project.title.es.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'in_editing':
        return 'bg-accent/10 text-accent-foreground border border-accent/20';
      case 'shooting_scheduled':
        return 'bg-muted text-muted-foreground border border-border';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  const getProjectStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'in_editing':
        return 'En Edición';
      case 'shooting_scheduled':
        return 'Programado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">
              Cargando proyectos...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Asignación de Equipo a Proyectos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-search">Buscar Proyectos</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="project-search"
                placeholder="Buscar por título, cliente o tipo de evento..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Seleccionar Proyecto</Label>
            <Select value={selectedProject} onValueChange={handleProjectSelect}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona un proyecto para asignar equipo" />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <span>{project.title.es}</span>
                      <Badge
                        variant="outline"
                        className={getProjectStatusColor(project.status)}
                      >
                        {getProjectStatusText(project.status)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selected Project Details */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const project = projects.find(p => p.id === selectedProject);
              if (!project) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {project.title.es}
                    </h3>
                    <p className="text-muted-foreground">
                      {project.description.es}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{project.client.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{project.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{project.location}</span>
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className={getProjectStatusColor(project.status)}
                      >
                        {getProjectStatusText(project.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Current Crew Assignment */}
                  <div>
                    <h4 className="font-medium mb-2">Equipo Actual</h4>
                    {project.crewMembers && project.crewMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {project.crewMembers.map(crewId => {
                          const crewMember = crewMembers.find(
                            c => c.id === crewId
                          );
                          return crewMember ? (
                            <Badge key={crewId} variant="secondary">
                              {crewMember.name.es}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No hay equipo asignado
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Crew Member Selection */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Asignar Miembros del Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crewMembers.map(crewMember => (
                <div
                  key={crewMember.id}
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={`crew-${crewMember.id}`}
                    checked={selectedCrewMembers.includes(crewMember.id)}
                    onCheckedChange={() =>
                      handleCrewMemberToggle(crewMember.id)
                    }
                  />
                  <Label
                    htmlFor={`crew-${crewMember.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{crewMember.name.es}</div>
                        <div className="text-sm text-muted-foreground">
                          {crewMember.role.es}
                        </div>
                        {crewMember.skills && crewMember.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {crewMember.skills
                              .slice(0, 2)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {crewMember.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{crewMember.skills.length - 2} más
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button onClick={handleSaveAssignment} className="w-full">
                Guardar Asignación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
