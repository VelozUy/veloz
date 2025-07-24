'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  FolderOpen,
  Plus,
  Link,
  Unlink,
  Search,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Edit,
} from 'lucide-react';
import { contactMessageService } from '@/services/contact-messages';
import { projectTrackingService } from '@/services/project-tracking';
import type { ContactMessage } from '@/types';
import type { EnhancedProject } from '@/types/project-tracking';

interface ContactProjectAssignmentProps {
  contactId?: string;
  projectId?: string;
  onAssignmentChange?: (contactId: string, projectId: string) => void;
  onProjectCreated?: (projectId: string) => void;
}

interface ContactWithProject extends ContactMessage {
  project?: EnhancedProject;
  projectId?: string;
}

export default function ContactProjectAssignment({
  contactId,
  projectId,
  onAssignmentChange,
  onProjectCreated,
}: ContactProjectAssignmentProps) {
  const [contacts, setContacts] = useState<ContactWithProject[]>([]);
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'assigned' | 'unassigned'
  >('all');
  const [selectedContact, setSelectedContact] =
    useState<ContactWithProject | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<EnhancedProject | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
    useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load contacts and projects in parallel
      const [contactsResponse, projectsResponse] = await Promise.all([
        contactMessageService.getAll(),
        projectTrackingService.getAllProjects(),
      ]);

      if (contactsResponse.success && contactsResponse.data) {
        setContacts(contactsResponse.data as ContactWithProject[]);
      }

      if (projectsResponse) {
        setProjects(projectsResponse);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContacts = () => {
    let filtered = contacts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        contact =>
          contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.eventType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by assignment status
    switch (filterStatus) {
      case 'assigned':
        filtered = filtered.filter(contact => contact.projectId);
        break;
      case 'unassigned':
        filtered = filtered.filter(contact => !contact.projectId);
        break;
      case 'all':
      default:
        break;
    }

    return filtered;
  };

  const handleAssignContact = async (contactId: string, projectId: string) => {
    try {
      // Update contact with project assignment
      await contactMessageService.update(contactId, { projectId });

      // Update local state
      setContacts(prev =>
        prev.map(contact =>
          contact.id === contactId ? { ...contact, projectId } : contact
        )
      );

      onAssignmentChange?.(contactId, projectId);
      setIsAssignmentDialogOpen(false);
    } catch (error) {
      console.error('Error assigning contact to project:', error);
    }
  };

  const handleUnassignContact = async (contactId: string) => {
    try {
      // Remove project assignment from contact
      await contactMessageService.update(contactId, { projectId: null });

      // Update local state
      setContacts(prev =>
        prev.map(contact =>
          contact.id === contactId
            ? { ...contact, projectId: undefined }
            : contact
        )
      );

      onAssignmentChange?.(contactId, '');
    } catch (error) {
      console.error('Error unassigning contact from project:', error);
    }
  };

  const handleCreateProjectFromContact = async (
    contact: ContactWithProject
  ) => {
    try {
      // Create new project from contact data
      const projectData = {
        title: {
          es: `${contact.eventType} - ${contact.name}`,
          en: `${contact.eventType} - ${contact.name}`,
          pt: `${contact.eventType} - ${contact.name}`,
        },
        description: {
          es: contact.message || 'Proyecto creado desde formulario de contacto',
          en: contact.message || 'Project created from contact form',
          pt:
            contact.message ||
            'Projeto criado a partir do formulário de contato',
        },
        eventType: contact.eventType || 'other',
        eventDate: contact.eventDate || new Date().toISOString(),
        location: '',
        tags: [],
        featured: false,
        status: 'draft' as const,
        order: 0,
        client: {
          name: contact.name,
          email: contact.email || '',
          phone: contact.phone,
          address: '',
          notes: '',
          confidential: false,
          accessCode: Math.random().toString(36).substr(2, 9),
        },
        priority: 'medium' as const,
        crewMembers: [],
        timeline: [],
        progress: {
          percentage: 0,
          completedMilestones: 0,
          totalMilestones: 0,
          lastUpdated: new Date().toISOString(),
        },
        communications: [],
        files: [],
        mediaCount: {
          photos: 0,
          videos: 0,
        },
        lastModifiedBy: 'admin',
      };

      const projectId = await projectTrackingService.createProject(projectData);

      // Assign contact to the new project
      await handleAssignContact(contact.id, projectId);

      onProjectCreated?.(projectId);
      setIsCreateProjectDialogOpen(false);
    } catch (error) {
      console.error('Error creating project from contact:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-primary/10 text-primary';
      case 'in_progress':
        return 'bg-warning/10 text-warning';
      case 'completed':
        return 'bg-success/10 text-success';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case 'wedding':
      case 'casamiento':
        return '💒';
      case 'corporate':
      case 'corporativo':
        return '🏢';
      case 'birthday':
      case 'cumpleaños':
        return '🎂';
      case 'quinceanera':
        return '👑';
      default:
        return '📸';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando contactos y proyectos...</div>
        </CardContent>
      </Card>
    );
  }

  const filteredContacts = getFilteredContacts();

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Asignación de Contactos a Proyectos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar contactos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, email o tipo de evento..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="status-filter">Filtrar por estado</Label>
              <Select
                value={filterStatus}
                onValueChange={(value: any) => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los contactos</SelectItem>
                  <SelectItem value="assigned">
                    Asignados a proyectos
                  </SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.map(contact => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {getEventTypeIcon(contact.eventType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{contact.name}</h3>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                      {contact.projectId && (
                        <Badge variant="secondary">
                          <Link className="h-3 w-3 mr-1" />
                          Asignado
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>{contact.eventType}</span>
                        {contact.eventDate && (
                          <span>
                            - {new Date(contact.eventDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {contact.message && (
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-3 w-3 mt-0.5" />
                          <span className="line-clamp-2">
                            {contact.message}
                          </span>
                        </div>
                      )}
                    </div>

                    {contact.projectId && (
                      <div className="mt-2 p-2 bg-primary/5 rounded border">
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="h-3 w-3 text-primary" />
                          <span className="text-sm font-medium">
                            Proyecto:{' '}
                            {contact.project?.title?.es || 'Proyecto asignado'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {contact.projectId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnassignContact(contact.id)}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Desasignar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContact(contact);
                        setIsAssignmentDialogOpen(true);
                      }}
                    >
                      <Link className="h-4 w-4 mr-1" />
                      Asignar
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedContact(contact);
                      setIsCreateProjectDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Crear Proyecto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No se encontraron contactos que coincidan con los filtros
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignment Dialog */}
      <Dialog
        open={isAssignmentDialogOpen}
        onOpenChange={setIsAssignmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Contacto a Proyecto</DialogTitle>
            <DialogDescription>
              Selecciona un proyecto para asignar el contacto &quot;
              {selectedContact?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Proyecto</Label>
              <Select
                onValueChange={value => {
                  const project = projects.find(p => p.id === value);
                  setSelectedProject(project || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title.es || project.title.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAssignmentDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (selectedContact && selectedProject) {
                    handleAssignContact(selectedContact.id, selectedProject.id);
                  }
                }}
                disabled={!selectedProject}
              >
                Asignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog
        open={isCreateProjectDialogOpen}
        onOpenChange={setIsCreateProjectDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Proyecto desde Contacto</DialogTitle>
            <DialogDescription>
              Crear un nuevo proyecto basado en la información del contacto
              &quot;{selectedContact?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <h4 className="font-medium mb-2">Información del Contacto</h4>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Nombre:</strong> {selectedContact?.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedContact?.email}
                </div>
                <div>
                  <strong>Teléfono:</strong>{' '}
                  {selectedContact?.phone || 'No proporcionado'}
                </div>
                <div>
                  <strong>Tipo de evento:</strong> {selectedContact?.eventType}
                </div>
                <div>
                  <strong>Fecha:</strong>{' '}
                  {selectedContact?.eventDate
                    ? new Date(selectedContact.eventDate).toLocaleDateString()
                    : 'No especificada'}
                </div>
                {selectedContact?.message && (
                  <div>
                    <strong>Mensaje:</strong> {selectedContact.message}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateProjectDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (selectedContact) {
                    handleCreateProjectFromContact(selectedContact);
                  }
                }}
              >
                Crear Proyecto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
