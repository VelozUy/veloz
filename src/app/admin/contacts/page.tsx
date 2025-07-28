'use client';

import AdminLayout from '@/components/admin/AdminLayout';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Plus,
  Calendar,
  Phone,
  Mail,
  User,
  Building,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { contactMessageService } from '@/services/contact-messages';
import { projectTrackingService } from '@/services/project-tracking';
import type { ContactMessage } from '@/types';
import type { EnhancedProject } from '@/types/project-tracking';

interface ContactWithProject extends ContactMessage {
  project?: EnhancedProject;
  projectId?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'new' | 'in_progress' | 'completed' | 'archived'
  >('all');
  const [selectedContact, setSelectedContact] =
    useState<ContactWithProject | null>(null);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
    useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactMessageService.getAll();
      if (response.success && response.data) {
        setContacts(response.data as ContactWithProject[]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
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

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(contact => contact.status === filterStatus);
    }

    return filtered;
  };

  const handleStatusUpdate = async (
    contactId: string,
    newStatus: ContactMessage['status']
  ) => {
    try {
      await contactMessageService.update(contactId, { status: newStatus });
      setContacts(prev =>
        prev.map(contact =>
          contact.id === contactId ? { ...contact, status: newStatus } : contact
        )
      );
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleCreateProjectFromContact = async (
    contact: ContactWithProject
  ) => {
    try {
      setCreatingProject(true);

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
      await contactMessageService.update(contact.id, { projectId });

      // Update local state
      setContacts(prev =>
        prev.map(c => (c.id === contact.id ? { ...c, projectId } : c))
      );

      // Close dialog and show success
      setIsCreateProjectDialogOpen(false);

      // Open the new project in a new tab
      window.open(`/admin/projects/${projectId}/edit`, '_blank');
    } catch (error) {
      console.error('Error creating project from contact:', error);
    } finally {
      setCreatingProject(false);
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
      <AdminLayout title="Contactos">
        <div className="container mx-auto p-4">
          <div className="text-center">Cargando contactos...</div>
        </div>
      </AdminLayout>
    );
  }

  const filteredContacts = getFilteredContacts();

  return (
    <AdminLayout title="Contactos">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-section-title-md font-body font-semibold text-foreground mb-1">
            Gestión de Contactos
          </h1>
          <p className="text-body-sm text-muted-foreground">
            Gestiona los mensajes de contacto y crea proyectos desde ellos
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Filtros y Búsqueda</span>
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
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="new">Nuevos</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="archived">Archivados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Mensajes de Contacto ({filteredContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map(contact => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {getEventTypeIcon(contact.eventType)}
                            </span>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{contact.email}</span>
                              </div>
                              {contact.phone && (
                                <div className="text-sm text-muted-foreground flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{contact.eventType}</div>
                          {contact.eventDate && (
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  contact.eventDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm line-clamp-2">
                            {contact.message || 'Sin mensaje'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={contact.status}
                          onValueChange={(value: ContactMessage['status']) =>
                            handleStatusUpdate(contact.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nuevo</SelectItem>
                            <SelectItem value="in_progress">
                              En progreso
                            </SelectItem>
                            <SelectItem value="completed">
                              Completado
                            </SelectItem>
                            <SelectItem value="archived">Archivado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedContact(contact)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsCreateProjectDialogOpen(true);
                            }}
                            disabled={creatingProject}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Crear Proyecto
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredContacts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron contactos que coincidan con los filtros
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                    <strong>Tipo de evento:</strong>{' '}
                    {selectedContact?.eventType}
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

              <div className="p-4 bg-primary/5 rounded">
                <h4 className="font-medium mb-2">Proyecto que se creará</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Título:</strong> {selectedContact?.eventType} -{' '}
                    {selectedContact?.name}
                  </div>
                  <div>
                    <strong>Estado:</strong> Borrador
                  </div>
                  <div>
                    <strong>Cliente:</strong> {selectedContact?.name}
                  </div>
                  <div>
                    <strong>Tipo de evento:</strong>{' '}
                    {selectedContact?.eventType}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateProjectDialogOpen(false)}
                  disabled={creatingProject}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() =>
                    selectedContact &&
                    handleCreateProjectFromContact(selectedContact)
                  }
                  disabled={creatingProject}
                >
                  {creatingProject ? 'Creando...' : 'Crear Proyecto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
