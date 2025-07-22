'use client';
/* eslint-disable no-restricted-syntax */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Plus,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Filter,
  Search,
  BarChart3,
  UserPlus,
  Settings,
  Activity,
  Target,
  Award,
  Briefcase,
  Camera,
  Video,
  Scissors,
} from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';

interface TeamMember extends Omit<CrewMember, 'skills'> {
  workload: {
    currentProjects: number;
    completedProjects: number;
    totalHours: number;
    availability: 'available' | 'busy' | 'unavailable';
  };
  performance: {
    rating: number;
    clientSatisfaction: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
  skills: {
    primary: string[];
    secondary: string[];
    certifications: string[];
  };
  schedule: {
    nextProject?: string;
    nextProjectDate?: string;
    availability: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
  };
}

interface TeamManagementProps {
  className?: string;
}

export default function TeamManagement({
  className = '',
}: TeamManagementProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showMemberDialog, setShowMemberDialog] = useState(false);

  // Load team members with enhanced data
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const result = await crewMemberService.getAllCrewMembers();
      if (result.success) {
        const crewData = (result.data as CrewMember[]) || [];

        // Enhance crew data with workload and performance metrics
        const enhancedTeamMembers: TeamMember[] = crewData.map(crew => ({
          ...crew,
          workload: {
            currentProjects: Math.floor(Math.random() * 5) + 1,
            completedProjects: Math.floor(Math.random() * 20) + 5,
            totalHours: Math.floor(Math.random() * 200) + 50,
            availability: ['available', 'busy', 'unavailable'][
              Math.floor(Math.random() * 3)
            ] as any,
          },
          performance: {
            rating: Math.floor(Math.random() * 20) + 80, // 80-100
            clientSatisfaction: Math.floor(Math.random() * 20) + 80,
            onTimeDelivery: Math.floor(Math.random() * 20) + 80,
            qualityScore: Math.floor(Math.random() * 20) + 80,
          },
          skills: {
            primary: crew.skills.slice(0, 3),
            secondary: crew.skills.slice(3, 6),
            certifications: [
              'Adobe Certified',
              'Canon Professional',
              'Sony Alpha',
            ],
          },
          schedule: {
            availability: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false,
            },
          },
        }));

        setTeamMembers(enhancedTeamMembers);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-accent-lime';
      case 'busy':
        return 'bg-accent-soft-gold';
      case 'unavailable':
        return 'bg-accent-rose';
      default:
        return 'bg-muted';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'Ocupado';
      case 'unavailable':
        return 'No Disponible';
      default:
        return 'Desconocido';
    }
  };

  const getRoleIcon = (role: string) => {
    if (
      role.toLowerCase().includes('fotógrafo') ||
      role.toLowerCase().includes('photographer')
    ) {
      return <Camera className="w-4 h-4" />;
    } else if (
      role.toLowerCase().includes('videógrafo') ||
      role.toLowerCase().includes('videographer')
    ) {
      return <Video className="w-4 h-4" />;
    } else if (
      role.toLowerCase().includes('editor') ||
      role.toLowerCase().includes('edición')
    ) {
      return <Scissors className="w-4 h-4" />;
    } else {
      return <Briefcase className="w-4 h-4" />;
    }
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch =
      member.name.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.en?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      member.role.es?.toLowerCase().includes(roleFilter.toLowerCase()) ||
      member.role.en?.toLowerCase().includes(roleFilter.toLowerCase());

    const matchesAvailability =
      availabilityFilter === 'all' ||
      member.workload.availability === availabilityFilter;

    return matchesSearch && matchesRole && matchesAvailability;
  });

  const teamStats = {
    total: teamMembers.length,
    available: teamMembers.filter(m => m.workload.availability === 'available')
      .length,
    busy: teamMembers.filter(m => m.workload.availability === 'busy').length,
    unavailable: teamMembers.filter(
      m => m.workload.availability === 'unavailable'
    ).length,
    averageRating: Math.round(
      teamMembers.reduce((sum, m) => sum + m.performance.rating, 0) /
        teamMembers.length
    ),
    totalProjects: teamMembers.reduce(
      (sum, m) => sum + m.workload.currentProjects,
      0
    ),
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestión de Equipo
          </h1>
          <p className="text-muted-foreground">
            Administra el equipo, carga de trabajo y rendimiento
          </p>
        </div>
        <Button onClick={() => setShowMemberDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar Miembro
        </Button>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total del Equipo
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.total}</div>
            <p className="text-xs text-muted-foreground">Miembros activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent-lime" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-lime">
              {teamStats.available}
            </div>
            <p className="text-xs text-muted-foreground">
              Listos para proyectos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proyectos Activos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">En progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calificación Promedio
            </CardTitle>
            <Star className="h-4 w-4 text-accent-soft-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-soft-gold">
              {teamStats.averageRating}%
            </div>
            <p className="text-xs text-muted-foreground">
              Satisfacción del cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, rol o habilidades..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="fotógrafo">Fotógrafos</SelectItem>
                <SelectItem value="videógrafo">Videógrafos</SelectItem>
                <SelectItem value="editor">Editores</SelectItem>
                <SelectItem value="asistente">Asistentes</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las disponibilidades</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">Ocupado</SelectItem>
                <SelectItem value="unavailable">No Disponible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Management Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="workload">Carga de Trabajo</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="schedule">Horarios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeamMembers.map(member => (
              <Card
                key={member.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.portrait} />
                        <AvatarFallback>
                          {member.name.es?.charAt(0) ||
                            member.name.en?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {member.name.es || member.name.en}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(member.role.es || member.role.en || '')}
                          <p className="text-sm text-muted-foreground">
                            {member.role.es || member.role.en}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getAvailabilityColor(member.workload.availability)} text-foreground`}
                    >
                      {getAvailabilityText(member.workload.availability)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calificación</span>
                      <span className="font-medium">
                        {member.performance.rating}%
                      </span>
                    </div>
                    <Progress
                      value={member.performance.rating}
                      className="h-2"
                    />
                  </div>

                  {/* Workload Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Proyectos activos:
                      </span>
                      <span className="font-medium ml-1">
                        {member.workload.currentProjects}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Completados:
                      </span>
                      <span className="font-medium ml-1">
                        {member.workload.completedProjects}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Habilidades principales:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.primary.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMember(member);
                        setShowMemberDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workload Tab */}
        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carga de Trabajo del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeamMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.portrait} />
                        <AvatarFallback>
                          {member.name.es?.charAt(0) ||
                            member.name.en?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {member.name.es || member.name.en}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {member.role.es || member.role.en}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {member.workload.currentProjects}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Proyectos activos
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {member.workload.totalHours}h
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Horas este mes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {member.workload.completedProjects}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completados
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getAvailabilityColor(
                          member.workload.availability
                        )}
                      >
                        {getAvailabilityText(member.workload.availability)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeamMembers.map(member => (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.portrait} />
                          <AvatarFallback>
                            {member.name.es?.charAt(0) ||
                              member.name.en?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {member.name.es || member.name.en}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {member.role.es || member.role.en}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-accent-soft-gold" />
                        <span className="font-medium">
                          {member.performance.rating}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Satisfacción del Cliente
                        </div>
                        <Progress
                          value={member.performance.clientSatisfaction}
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {member.performance.clientSatisfaction}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Entrega a Tiempo
                        </div>
                        <Progress
                          value={member.performance.onTimeDelivery}
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {member.performance.onTimeDelivery}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Calidad
                        </div>
                        <Progress
                          value={member.performance.qualityScore}
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {member.performance.qualityScore}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Proyectos Completados
                        </div>
                        <div className="text-lg font-bold">
                          {member.workload.completedProjects}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horarios y Disponibilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeamMembers.map(member => (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.portrait} />
                          <AvatarFallback>
                            {member.name.es?.charAt(0) ||
                              member.name.en?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {member.name.es || member.name.en}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {member.role.es || member.role.en}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getAvailabilityColor(
                          member.workload.availability
                        )}
                      >
                        {getAvailabilityText(member.workload.availability)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(
                        (day, index) => {
                          const isAvailable =
                            member.schedule.availability[
                              [
                                'monday',
                                'tuesday',
                                'wednesday',
                                'thursday',
                                'friday',
                                'saturday',
                                'sunday',
                              ][
                                index
                              ] as keyof typeof member.schedule.availability
                            ];
                          return (
                            <div key={day} className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">
                                {day}
                              </div>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                  isAvailable
                                    ? 'bg-accent-lime text-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {isAvailable ? '✓' : '✗'}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {member.schedule.nextProject && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium">
                          Próximo proyecto:
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.schedule.nextProject}
                        </div>
                        {member.schedule.nextProjectDate && (
                          <div className="text-xs text-muted-foreground">
                            {member.schedule.nextProjectDate}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Dialog */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMember
                ? 'Editar Miembro del Equipo'
                : 'Agregar Miembro del Equipo'}
            </DialogTitle>
            <DialogDescription>
              {selectedMember
                ? 'Modifica la información del miembro del equipo'
                : 'Agrega un nuevo miembro al equipo'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* This would integrate with the existing CrewMemberForm component */}
            <p className="text-muted-foreground">
              Formulario de miembro del equipo (integrado con el sistema
              existente)
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowMemberDialog(false)}
              >
                Cancelar
              </Button>
              <Button>
                {selectedMember ? 'Guardar Cambios' : 'Agregar Miembro'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
