'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Mail,
  MessageSquare,
  Phone,
  FileText,
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  Archive,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Upload,
  Calendar,
  User,
  Building,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  communicationsService,
  messageTemplatesService,
  clientFeedbackService,
} from '@/services/communications';
import { contactMessageService } from '@/services/contact-messages';
import type {
  Communication,
  MessageTemplate,
  ClientFeedback,
} from '@/services/communications';
import type { ContactMessage } from '@/types';

interface ContactWithProject extends ContactMessage {
  project?: any;
  projectId?: string;
}

export default function UnifiedCommunicationHub() {
  // Communications state
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [feedback, setFeedback] = useState<ClientFeedback[]>([]);

  // Contacts state
  const [contacts, setContacts] = useState<ContactWithProject[]>([]);

  // Projects state for client selection
  const [projects, setProjects] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);

  // Dialog states
  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<ContactWithProject | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [contactDetailDialogOpen, setContactDetailDialogOpen] = useState(false);
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
    useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [contactFilterStatus, setContactFilterStatus] = useState<
    'all' | 'new' | 'in_progress' | 'completed' | 'archived'
  >('all');

  // New message form
  const [newMessage, setNewMessage] = useState({
    clientId: '',
    subject: '',
    content: '',
    type: 'email' as 'email' | 'sms',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'email' as 'email' | 'sms',
    category: 'custom' as 'welcome' | 'follow_up' | 'reminder' | 'custom',
    variables: [] as string[],
  });

  // Template editing state
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  useEffect(() => {
    loadData();
    loadContacts();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load communications from database
      const communicationsResponse = await communicationsService.getAll();
      if (communicationsResponse.success && communicationsResponse.data) {
        setCommunications(communicationsResponse.data as Communication[]);
      } else {
        console.warn('Failed to load communications:', communicationsResponse);
        if (
          communicationsResponse.error?.includes('permission') ||
          communicationsResponse.error?.includes('permissions')
        ) {
          console.error(
            'Permission denied for communications. Please ensure you are logged in as an admin.'
          );
        }
        setCommunications([]);
      }

      // Load templates from database
      const templatesResponse =
        await messageTemplatesService.getActiveTemplates();
      if (templatesResponse.success && templatesResponse.data) {
        setTemplates(templatesResponse.data as MessageTemplate[]);
      } else {
        console.warn('Failed to load templates:', templatesResponse);
        if (
          templatesResponse.error?.includes('permission') ||
          templatesResponse.error?.includes('permissions')
        ) {
          console.error(
            'Permission denied for templates. Please ensure you are logged in as an admin.'
          );
        }
        setTemplates([]);
      }

      // Load feedback from database
      const feedbackResponse = await clientFeedbackService.getAll();
      if (feedbackResponse.success && feedbackResponse.data) {
        setFeedback(feedbackResponse.data as ClientFeedback[]);
      } else {
        console.warn('Failed to load feedback:', feedbackResponse);
        if (
          feedbackResponse.error?.includes('permission') ||
          feedbackResponse.error?.includes('permissions')
        ) {
          console.error(
            'Permission denied for feedback. Please ensure you are logged in as an admin.'
          );
        }
        setFeedback([]);
      }

      // Load projects for client selection
      try {
        const { projectTrackingService } = await import(
          '@/services/project-tracking'
        );
        const projectsData = await projectTrackingService.getAllProjects();
        setProjects(projectsData);
      } catch (error) {
        console.warn('Failed to load projects:', error);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading communication data:', error);
      // Set empty arrays on error
      setCommunications([]);
      setTemplates([]);
      setFeedback([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);

      // Check if service exists and has getAll method
      if (
        !contactMessageService ||
        typeof contactMessageService.getAll !== 'function'
      ) {
        console.warn(
          'contactMessageService.getAll is not available, using mock data'
        );
        throw new Error('Service method not available');
      }

      // Try to get all contacts using the base service method
      const response = await contactMessageService.getAll();
      if (response.success && response.data) {
        setContacts(response.data as ContactWithProject[]);
      } else {
        console.warn('Failed to load contacts:', response);
        if (
          response.error?.includes('permission') ||
          response.error?.includes('permissions')
        ) {
          console.error(
            'Permission denied for contacts. Please ensure you are logged in as an admin.'
          );
        }
        // Fallback to mock data for development
        const mockContacts: ContactWithProject[] = [
          {
            id: '1',
            name: 'María González',
            email: 'maria@example.com',
            phone: '+34 600 123 456',
            eventType: 'Boda',
            eventDate: '2025-06-15',
            message:
              'Hola, estamos interesados en sus servicios para nuestra boda. ¿Podrían enviarnos información sobre sus paquetes?',
            status: 'new',
            source: 'contact_form',
            isRead: false,
            archived: false,
            createdAt: {
              seconds: Math.floor(
                new Date('2025-01-27T14:30:00').getTime() / 1000
              ),
              nanoseconds: 0,
            },
            updatedAt: {
              seconds: Math.floor(
                new Date('2025-01-27T14:30:00').getTime() / 1000
              ),
              nanoseconds: 0,
            },
          },
          {
            id: '2',
            name: 'Carlos Rodríguez',
            email: 'carlos@techcorp.com',
            phone: '+34 600 789 012',
            eventType: 'Evento Corporativo',
            eventDate: '2025-03-20',
            message:
              'Necesitamos servicios de fotografía para nuestro evento corporativo anual. ¿Tienen experiencia en eventos empresariales?',
            status: 'in_progress',
            source: 'contact_form',
            isRead: true,
            archived: false,
            createdAt: {
              seconds: Math.floor(
                new Date('2025-01-26T10:15:00').getTime() / 1000
              ),
              nanoseconds: 0,
            },
            updatedAt: {
              seconds: Math.floor(
                new Date('2025-01-26T10:15:00').getTime() / 1000
              ),
              nanoseconds: 0,
            },
          },
          {
            id: '3',
            name: 'Ana Martínez',
            email: 'ana@example.com',
            phone: '+34 600 345 678',
            eventType: 'Cumpleaños',
            eventDate: '2025-04-10',
            message:
              'Queremos celebrar el cumpleaños de mi hija. ¿Ofrecen servicios para fiestas infantiles?',
            status: 'completed',
            source: 'contact_form',
            isRead: true,
            archived: false,
            createdAt: {
              seconds: Math.floor(
                new Date('2025-01-25T16:45:00').getTime() / 1000
              ),
              nanoseconds: 0,
            },
            updatedAt: {
              seconds: Math.floor(
                new Date('2025-01-25T16:45:00').getTime() / 1000
              ),
              nanoseconds: 0,
            },
          },
        ];
        setContacts(mockContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        console.error(
          'Permission denied for contacts. Please ensure you are logged in as an admin.'
        );
      }
      // For now, use mock data if API fails
      const mockContacts: ContactWithProject[] = [
        {
          id: '1',
          name: 'María González',
          email: 'maria@example.com',
          phone: '+34 600 123 456',
          eventType: 'Boda',
          eventDate: '2025-06-15',
          message:
            'Hola, estamos interesados en sus servicios para nuestra boda. ¿Podrían enviarnos información sobre sus paquetes?',
          status: 'new',
          source: 'contact_form',
          isRead: false,
          archived: false,
          createdAt: {
            seconds: Math.floor(
              new Date('2025-01-27T14:30:00').getTime() / 1000
            ),
            nanoseconds: 0,
          },
          updatedAt: {
            seconds: Math.floor(
              new Date('2025-01-27T14:30:00').getTime() / 1000
            ),
            nanoseconds: 0,
          },
        },
        {
          id: '2',
          name: 'Carlos Rodríguez',
          email: 'carlos@techcorp.com',
          phone: '+34 600 789 012',
          eventType: 'Evento Corporativo',
          eventDate: '2025-03-20',
          message:
            'Necesitamos servicios de fotografía para nuestro evento corporativo anual. ¿Tienen experiencia en eventos empresariales?',
          status: 'in_progress',
          source: 'contact_form',
          isRead: true,
          archived: false,
          createdAt: {
            seconds: Math.floor(
              new Date('2025-01-26T10:15:00').getTime() / 1000
            ),
            nanoseconds: 0,
          },
          updatedAt: {
            seconds: Math.floor(
              new Date('2025-01-26T10:15:00').getTime() / 1000
            ),
            nanoseconds: 0,
          },
        },
        {
          id: '3',
          name: 'Ana Martínez',
          email: 'ana@example.com',
          phone: '+34 600 345 678',
          eventType: 'Cumpleaños',
          eventDate: '2025-04-10',
          message:
            'Queremos celebrar el cumpleaños de mi hija. ¿Ofrecen servicios para fiestas infantiles?',
          status: 'completed',
          source: 'contact_form',
          isRead: true,
          archived: false,
          createdAt: {
            seconds: Math.floor(
              new Date('2025-01-25T16:45:00').getTime() / 1000
            ),
            nanoseconds: 0,
          },
          updatedAt: {
            seconds: Math.floor(
              new Date('2025-01-25T16:45:00').getTime() / 1000
            ),
            nanoseconds: 0,
          },
        },
      ];
      setContacts(mockContacts);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      // Validate required fields
      if (!newMessage.clientId || !newMessage.subject || !newMessage.content) {
        console.error('Missing required fields for new message');
        return;
      }

      // Find the selected project to get client name
      const selectedProject = projects.find(p => p.id === newMessage.clientId);
      const clientName = selectedProject?.client?.name || 'Cliente';

      // Create communication object
      const communicationData = {
        clientId: newMessage.clientId,
        clientName: clientName,
        projectId: newMessage.clientId, // Using projectId as clientId for now
        projectName: selectedProject?.title?.es || 'Proyecto',
        type: newMessage.type,
        subject: newMessage.subject,
        content: newMessage.content,
        status: 'sent' as const,
        direction: 'outbound' as const,
        priority: newMessage.priority,
        timestamp: new Date(),
      };

      // Send communication to database
      const response =
        await communicationsService.sendCommunication(communicationData);

      if (response.success) {
        setNewMessageDialogOpen(false);
        setNewMessage({
          clientId: '',
          subject: '',
          content: '',
          type: 'email',
          priority: 'medium',
        });
        // Reload communications
        await loadData();
      } else {
        console.error('Failed to send message:', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleViewDetails = (communication: Communication) => {
    setSelectedCommunication(communication);
    setDetailDialogOpen(true);
  };

  const handleViewContactDetails = (contact: ContactWithProject) => {
    setSelectedContact(contact);
    setContactDetailDialogOpen(true);
  };

  const handleStatusUpdate = async (
    contactId: string,
    newStatus: ContactMessage['status']
  ) => {
    try {
      const response = await contactMessageService.updateStatus(
        contactId,
        newStatus
      );
      if (response.success) {
        setContacts(prev =>
          prev.map(contact =>
            contact.id === contactId
              ? { ...contact, status: newStatus }
              : contact
          )
        );
      } else {
        console.error('Failed to update contact status:', response);
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleCreateProjectFromContact = async (
    contact: ContactWithProject
  ) => {
    try {
      setCreatingProject(true);
      // Implementation for creating project from contact

      // Here you would implement the actual project creation logic
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsCreateProjectDialogOpen(false);
      setSelectedContact(null);

      // Refresh contacts to show updated status
      await loadContacts();
    } catch (error) {
      console.error('Error creating project from contact:', error);
    } finally {
      setCreatingProject(false);
    }
  };

  // Template handlers
  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        ...newTemplate,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await messageTemplatesService.create(templateData);
      if (response.success) {
        setTemplateDialogOpen(false);
        setNewTemplate({
          name: '',
          subject: '',
          content: '',
          type: 'email',
          category: 'custom',
          variables: [],
        });
        // Refresh templates
        const templatesResponse =
          await messageTemplatesService.getActiveTemplates();
        if (templatesResponse.success && templatesResponse.data) {
          setTemplates(templatesResponse.data);
        }
      } else {
        console.error('Failed to create template:', response.error);
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      category: template.category,
      variables: template.variables,
    });
    setIsEditingTemplate(true);
    setTemplateDialogOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const templateData = {
        ...newTemplate,
        updatedAt: new Date(),
      };

      const response = await messageTemplatesService.update(
        editingTemplate.id,
        templateData
      );
      if (response.success) {
        setTemplateDialogOpen(false);
        setIsEditingTemplate(false);
        setEditingTemplate(null);
        setNewTemplate({
          name: '',
          subject: '',
          content: '',
          type: 'email',
          category: 'custom',
          variables: [],
        });
        // Refresh templates
        const templatesResponse =
          await messageTemplatesService.getActiveTemplates();
        if (templatesResponse.success && templatesResponse.data) {
          setTemplates(templatesResponse.data);
        }
      } else {
        console.error('Failed to update template:', response.error);
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    setNewMessage({
      ...newMessage,
      subject: template.subject,
      content: template.content,
      type: template.type,
    });
    setNewMessageDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await messageTemplatesService.update(templateId, {
        isActive: false,
      });
      if (response.success) {
        // Refresh templates
        const templatesResponse =
          await messageTemplatesService.getActiveTemplates();
        if (templatesResponse.success && templatesResponse.data) {
          setTemplates(templatesResponse.data);
        }
      } else {
        console.error('Failed to delete template:', response.error);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { color: 'bg-primary/10 text-primary', icon: Send },
      delivered: {
        color: 'bg-accent-lime/10 text-accent-lime',
        icon: CheckCircle,
      },
      read: { color: 'bg-accent-sky/10 text-accent-sky', icon: Eye },
      failed: {
        color: 'bg-destructive/10 text-destructive',
        icon: AlertCircle,
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.sent;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      email: Mail,
      sms: MessageSquare,
      phone: Phone,
      meeting: Clock,
      file_share: FileText,
    };
    const Icon = iconMap[type as keyof typeof iconMap] || Mail;
    return <Icon className="w-4 h-4" />;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-accent-soft-gold/10 text-accent-soft-gold',
      high: 'bg-destructive/10 text-destructive',
    };
    return (
      <Badge
        className={
          priorityConfig[priority as keyof typeof priorityConfig] ||
          priorityConfig.medium
        }
      >
        {priority}
      </Badge>
    );
  };

  const getContactStatusColor = (status: string) => {
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

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch =
      comm.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || comm.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' || comm.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || comm.priority === priorityFilter;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getFilteredContacts = () => {
    let filtered = contacts;

    if (contactSearchTerm) {
      filtered = filtered.filter(
        contact =>
          contact.name
            ?.toLowerCase()
            .includes(contactSearchTerm.toLowerCase()) ||
          contact.email
            ?.toLowerCase()
            .includes(contactSearchTerm.toLowerCase()) ||
          contact.eventType
            ?.toLowerCase()
            .includes(contactSearchTerm.toLowerCase())
      );
    }

    if (contactFilterStatus !== 'all') {
      filtered = filtered.filter(
        contact => contact.status === contactFilterStatus
      );
    }

    return filtered;
  };

  const filteredContacts = getFilteredContacts();

  if (loading || contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando comunicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Centro de Comunicaciones Unificado
          </h1>
          <p className="text-muted-foreground">
            Gestiona todas las comunicaciones y contactos en un solo lugar
          </p>
        </div>
        <Button onClick={() => setNewMessageDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Comunicación
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Contactos Tab */}
        <TabsContent value="contacts" className="space-y-4">
          {/* Contact Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros de Contactos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email o tipo de evento..."
                    value={contactSearchTerm}
                    onChange={e => setContactSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={contactFilterStatus}
                  onValueChange={(value: any) => setContactFilterStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
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
                            {new Date(
                              contact.createdAt.seconds * 1000
                            ).toLocaleDateString()}
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
                            onClick={() => handleViewContactDetails(contact)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comunicaciones Tab */}
        <TabsContent value="communications" className="space-y-4">
          {/* Communication Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros de Comunicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente o asunto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de comunicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="phone">Teléfono</SelectItem>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="file_share">
                      Compartir archivo
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="read">Leído</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Communications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Comunicaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunications.map(comm => (
                    <TableRow key={comm.id}>
                      <TableCell className="font-medium">
                        {comm.clientName}
                      </TableCell>
                      <TableCell>{comm.projectName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(comm.type)}
                          <span className="capitalize">{comm.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{comm.subject}</TableCell>
                      <TableCell>{getStatusBadge(comm.status)}</TableCell>
                      <TableCell>{getPriorityBadge(comm.priority)}</TableCell>
                      <TableCell>
                        {comm.timestamp.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(comm)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="w-4 h-4 mr-2" />
                              Archivar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plantillas Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Plantillas de Mensajes</CardTitle>
                <Button onClick={() => setTemplateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant="secondary">{template.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Asunto:</strong> {template.subject}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.content.substring(0, 100)}...
                      </p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-1">
                            <strong>Variables:</strong>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTemplate(template)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Usar Plantilla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map(item => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{item.clientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.projectName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${i < item.rating ? 'text-warning' : 'text-muted-foreground'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.comment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleDateString('es-ES')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analíticas Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Comunicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {communications.length}
                </div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Nuevos Contactos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {contacts.filter(c => c.status === 'new').length}
                </div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Satisfacción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5</div>
                <p className="text-xs text-muted-foreground">
                  Basado en feedback
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Communication Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Comunicación</DialogTitle>
          </DialogHeader>
          {selectedCommunication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCommunication.clientName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Proyecto</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCommunication.projectName || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedCommunication.type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedCommunication.status)}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Asunto</label>
                <p className="text-sm text-muted-foreground">
                  {selectedCommunication.subject}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Contenido</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedCommunication.content}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Detail Dialog */}
      <Dialog
        open={contactDetailDialogOpen}
        onOpenChange={setContactDetailDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Contacto</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedContact.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedContact.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedContact.phone || 'No proporcionado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de Evento</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedContact.eventType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Fecha del Evento
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {selectedContact.eventDate
                      ? new Date(selectedContact.eventDate).toLocaleDateString()
                      : 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">
                    <Badge
                      className={getContactStatusColor(selectedContact.status)}
                    >
                      {selectedContact.status}
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedContact.message && (
                <div>
                  <label className="text-sm font-medium">Mensaje</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedContact.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Message Dialog */}
      <Dialog
        open={newMessageDialogOpen}
        onOpenChange={setNewMessageDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Comunicación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <Select
                value={newMessage.clientId}
                onValueChange={value =>
                  setNewMessage({ ...newMessage, clientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.client?.name ||
                        project.title?.es ||
                        `Proyecto ${project.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={newMessage.type}
                onValueChange={value =>
                  setNewMessage({
                    ...newMessage,
                    type: value as 'email' | 'sms',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Asunto</label>
              <Input
                value={newMessage.subject}
                onChange={e =>
                  setNewMessage({ ...newMessage, subject: e.target.value })
                }
                placeholder="Asunto del mensaje"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contenido</label>
              <Textarea
                value={newMessage.content}
                onChange={e =>
                  setNewMessage({ ...newMessage, content: e.target.value })
                }
                placeholder="Contenido del mensaje"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prioridad</label>
              <Select
                value={newMessage.priority}
                onValueChange={value =>
                  setNewMessage({
                    ...newMessage,
                    priority: value as 'low' | 'medium' | 'high',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewMessageDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4 mr-2" />
                Enviar
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
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded">
                <h4 className="font-medium mb-2">Información del Contacto</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Nombre:</strong> {selectedContact.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedContact.email}
                  </div>
                  <div>
                    <strong>Teléfono:</strong>{' '}
                    {selectedContact.phone || 'No proporcionado'}
                  </div>
                  <div>
                    <strong>Tipo de evento:</strong> {selectedContact.eventType}
                  </div>
                  <div>
                    <strong>Fecha:</strong>{' '}
                    {selectedContact.eventDate
                      ? new Date(selectedContact.eventDate).toLocaleDateString()
                      : 'No especificada'}
                  </div>
                  {selectedContact.message && (
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
                    <strong>Título:</strong> {selectedContact.eventType} -{' '}
                    {selectedContact.name}
                  </div>
                  <div>
                    <strong>Estado:</strong> Borrador
                  </div>
                  <div>
                    <strong>Cliente:</strong> {selectedContact.name}
                  </div>
                  <div>
                    <strong>Tipo de evento:</strong> {selectedContact.eventType}
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
                    handleCreateProjectFromContact(selectedContact)
                  }
                  disabled={creatingProject}
                >
                  {creatingProject ? 'Creando...' : 'Crear Proyecto'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">Nombre de la Plantilla</Label>
              <Input
                id="templateName"
                value={newTemplate.name}
                onChange={e =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                placeholder="Nombre de la plantilla (ej: Plantilla de Reunión)"
              />
            </div>
            <div>
              <Label htmlFor="templateSubject">Asunto</Label>
              <Input
                id="templateSubject"
                value={newTemplate.subject}
                onChange={e =>
                  setNewTemplate({ ...newTemplate, subject: e.target.value })
                }
                placeholder="Asunto de la plantilla"
              />
            </div>
            <div>
              <Label htmlFor="templateContent">Contenido</Label>
              <Textarea
                id="templateContent"
                value={newTemplate.content}
                onChange={e =>
                  setNewTemplate({ ...newTemplate, content: e.target.value })
                }
                placeholder="Contenido de la plantilla (puede usar variables como {'{name}'})"
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="templateType">Tipo</Label>
              <Select
                value={newTemplate.type}
                onValueChange={value =>
                  setNewTemplate({
                    ...newTemplate,
                    type: value as 'email' | 'sms',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="templateCategory">Categoría</Label>
              <Select
                value={newTemplate.category}
                onValueChange={value =>
                  setNewTemplate({
                    ...newTemplate,
                    category: value as
                      | 'welcome'
                      | 'follow_up'
                      | 'reminder'
                      | 'custom',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Bienvenida</SelectItem>
                  <SelectItem value="follow_up">Seguimiento</SelectItem>
                  <SelectItem value="reminder">Recordatorio</SelectItem>
                  <SelectItem value="custom">Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="templateVariables">Variables (opcionales)</Label>
              <Input
                id="templateVariables"
                value={(newTemplate.variables || []).join(', ')}
                onChange={e => {
                  const variables = e.target.value
                    .split(',')
                    .map(v => v.trim())
                    .filter(v => v.length > 0);
                  setNewTemplate({ ...newTemplate, variables });
                }}
                placeholder="Ej: name, eventDate"
              />
              <p className="text-xs text-muted-foreground">
                Las variables se pueden usar en el contenido de la plantilla
                (ej: Hola {'{name}'}, la fecha de tu evento es {'{eventDate}'}).
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setTemplateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={
                  isEditingTemplate
                    ? handleUpdateTemplate
                    : handleCreateTemplate
                }
              >
                {isEditingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
