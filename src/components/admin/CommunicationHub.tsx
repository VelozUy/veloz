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
import type {
  Communication,
  MessageTemplate,
  ClientFeedback,
} from '@/services/communications';

export default function CommunicationHub() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [feedback, setFeedback] = useState<ClientFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // New message form
  const [newMessage, setNewMessage] = useState({
    clientId: '',
    subject: '',
    content: '',
    type: 'email' as 'email' | 'sms',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // For now, using mock data
      const mockCommunications: Communication[] = [
        {
          id: '1',
          clientId: 'client1',
          clientName: 'María González',
          projectId: 'proj1',
          projectName: 'Boda María y Juan',
          type: 'email',
          subject: 'Confirmación de fecha',
          content:
            'Hola María, confirmamos la fecha del evento para el 15 de septiembre...',
          status: 'read',
          direction: 'outbound',
          timestamp: new Date('2025-01-27T10:30:00'),
          priority: 'high',
          tags: ['confirmación', 'fecha'],
        },
        {
          id: '2',
          clientId: 'client2',
          clientName: 'Carlos Rodríguez',
          projectId: 'proj2',
          projectName: 'Evento Corporativo TechCorp',
          type: 'sms',
          subject: 'Recordatorio de reunión',
          content:
            'Recordatorio: Reunión mañana a las 10:00 AM para revisar detalles del evento.',
          status: 'delivered',
          direction: 'outbound',
          timestamp: new Date('2025-01-27T09:15:00'),
          priority: 'medium',
        },
        {
          id: '3',
          clientId: 'client3',
          clientName: 'Ana Martínez',
          type: 'phone',
          subject: 'Consulta sobre servicios',
          content:
            'Llamada telefónica de 15 minutos. Cliente interesada en servicios de fotografía para cumpleaños.',
          status: 'sent',
          direction: 'inbound',
          timestamp: new Date('2025-01-27T08:45:00'),
          priority: 'low',
        },
      ];

      const mockTemplates: MessageTemplate[] = [
        {
          id: '1',
          name: 'Bienvenida',
          subject: '¡Bienvenido a Veloz!',
          content:
            'Hola {{clientName}}, gracias por elegir Veloz para tu evento. Estamos emocionados de trabajar contigo...',
          type: 'email',
          category: 'welcome',
          variables: ['clientName', 'eventType'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Recordatorio de reunión',
          subject: 'Recordatorio: Reunión de planificación',
          content:
            'Hola {{clientName}}, te recordamos que tenemos una reunión programada para {{meetingDate}}...',
          type: 'email',
          category: 'reminder',
          variables: ['clientName', 'meetingDate'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockFeedback: ClientFeedback[] = [
        {
          id: '1',
          clientId: 'client1',
          clientName: 'María González',
          projectId: 'proj1',
          projectName: 'Boda María y Juan',
          rating: 5,
          comment:
            'Excelente comunicación durante todo el proceso. Muy profesionales y atentos a los detalles.',
          timestamp: new Date('2025-01-26T16:30:00'),
          category: 'communication',
        },
      ];

      setCommunications(mockCommunications);
      setTemplates(mockTemplates);
      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Error loading communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      // TODO: Implement actual message sending

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
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleViewDetails = (communication: Communication) => {
    setSelectedCommunication(communication);
    setDetailDialogOpen(true);
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

  if (loading) {
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
          <h1 className="text-2xl font-bold">Centro de Comunicaciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas las comunicaciones con clientes en un solo lugar
          </p>
        </div>
        <Button onClick={() => setNewMessageDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Comunicación
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
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
                <SelectItem value="file_share">Compartir archivo</SelectItem>
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
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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

      {/* Main Content */}
      <Tabs defaultValue="communications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="communications" className="space-y-4">
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
                      <Badge variant="outline">{template.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Asunto:</strong> {template.subject}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.content.substring(0, 100)}...
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        <Button size="sm">Usar Plantilla</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                <CardTitle>Tasa de Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Promedio</p>
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
              {selectedCommunication.attachments &&
                selectedCommunication.attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">
                      Archivos adjuntos
                    </label>
                    <div className="flex gap-2 mt-1">
                      {selectedCommunication.attachments.map(
                        (attachment, index) => (
                          <Button key={index} size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            {attachment}
                          </Button>
                        )
                      )}
                    </div>
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
                  <SelectItem value="client1">María González</SelectItem>
                  <SelectItem value="client2">Carlos Rodríguez</SelectItem>
                  <SelectItem value="client3">Ana Martínez</SelectItem>
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
    </div>
  );
}
