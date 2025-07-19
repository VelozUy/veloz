'use client';

import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye,
  Search,
  Mail,
  MailOpen,
  Clock,
  CheckCircle,
  Archive,
  Phone,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { contactMessageService } from '@/services/firebase';
import { ContactMessage } from '@/types';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await contactMessageService.getAll<ContactMessage>();
      if (response.success && response.data) {
        // Sort by creation date, newest first
        const sortedMessages = response.data.sort((a, b) => {
          const aTime = (a.createdAt as { seconds: number })?.seconds || 0;
          const bTime = (b.createdAt as { seconds: number })?.seconds || 0;
          return bTime - aTime;
        });
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await contactMessageService.markAsRead(messageId);
      if (response.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleUpdateStatus = async (
    messageId: string,
    newStatus: 'new' | 'in_progress' | 'completed' | 'archived'
  ) => {
    try {
      const response = await contactMessageService.updateStatus(
        messageId,
        newStatus
      );
      if (response.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, status: newStatus } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDetailDialogOpen(true);

    // Mark as read when viewing details
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
  };

  // Filter messages based on search and filters
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // Search filter
      const searchMatch =
        searchTerm === '' ||
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch =
        statusFilter === 'all' || message.status === statusFilter;

      // Source filter
      const sourceMatch =
        sourceFilter === 'all' || message.source === sourceFilter;

      // Read filter
      const readMatch =
        readFilter === 'all' ||
        (readFilter === 'read' && message.isRead) ||
        (readFilter === 'unread' && !message.isRead);

      return searchMatch && statusMatch && sourceMatch && readMatch;
    });
  }, [messages, searchTerm, statusFilter, sourceFilter, readFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter(m => !m.isRead).length;
    const newMessages = messages.filter(m => m.status === 'new').length;
    const inProgress = messages.filter(m => m.status === 'in_progress').length;

    return { total, unread, newMessages, inProgress };
  }, [messages]);

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'bg-primary/10 text-primary',
      in_progress: 'bg-muted text-muted-foreground',
      completed: 'bg-primary text-primary-foreground',
      archived: 'bg-muted-foreground/10 text-muted-foreground',
    };

    const labels = {
      new: 'Nuevo',
      in_progress: 'En Proceso',
      completed: 'Completado',
      archived: 'Archivado',
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          'bg-muted-foreground/10 text-muted-foreground'
        }
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    return (
      <Badge variant={source === 'contact_form' ? 'default' : 'secondary'}>
        {source === 'contact_form' ? 'Formulario' : 'Widget'}
      </Badge>
    );
  };

  const formatDate = (
    timestamp: { seconds: number } | Date | string | null | undefined
  ) => {
    if (!timestamp) return 'Sin fecha';

    const date = (timestamp as { seconds: number })?.seconds
      ? new Date((timestamp as { seconds: number }).seconds * 1000)
      : new Date(timestamp as Date | string);

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Mensajes de Contacto">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Mensajes de Contacto">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Leídos</CardTitle>
            <MailOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.unread}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.newMessages}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email, tipo de evento..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="in_progress">En Proceso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Leído" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unread">No Leídos</SelectItem>
                  <SelectItem value="read">Leídos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="contact_form">Formulario</SelectItem>
                  <SelectItem value="widget">Widget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {messages.length === 0
                        ? 'No hay mensajes de contacto'
                        : 'No se encontraron mensajes con los filtros aplicados'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map(message => (
                  <TableRow
                    key={message.id}
                    className={`cursor-pointer hover:bg-muted/50 ${!message.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={() => handleViewDetails(message)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                        <span
                          className={!message.isRead ? 'font-semibold' : ''}
                        >
                          {message.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {message.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {message.email}
                          </div>
                        )}
                        {message.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {message.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="capitalize">{message.eventType}</div>
                        {message.eventDate && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(message.eventDate).toLocaleDateString(
                              'es-ES'
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell>{getSourceBadge(message.source)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={e => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleViewDetails(message);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          {!message.isRead && (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleMarkAsRead(message.id);
                              }}
                            >
                              <MailOpen className="h-4 w-4 mr-2" />
                              Marcar como Leído
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleUpdateStatus(message.id, 'in_progress');
                            }}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            En Proceso
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleUpdateStatus(message.id, 'completed');
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleUpdateStatus(message.id, 'archived');
                            }}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Mensaje</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Header with status and source */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedMessage.status)}
                  {getSourceBadge(selectedMessage.source)}
                  {!selectedMessage.isRead && (
                    <Badge variant="outline" className="text-blue-600">
                      No Leído
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(selectedMessage.createdAt)}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Información de Contacto</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Nombre:</strong> {selectedMessage.name}
                    </div>
                    {selectedMessage.email && (
                      <div className="flex items-center gap-2">
                        <strong>Email:</strong>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-primary hover:underline"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    )}
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-2">
                        <strong>Teléfono:</strong>
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="text-primary hover:underline"
                        >
                          {selectedMessage.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Información del Evento</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Tipo:</strong>{' '}
                      <span className="capitalize">
                        {selectedMessage.eventType}
                      </span>
                    </div>
                    {selectedMessage.eventDate && (
                      <div>
                        <strong>Fecha:</strong>{' '}
                        {new Date(selectedMessage.eventDate).toLocaleDateString(
                          'es-ES'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              {selectedMessage.message && (
                <div className="space-y-2">
                  <h4 className="font-medium">Mensaje</h4>
                  <div className="bg-muted p-4 rounded-none text-sm whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedMessage.metadata && (
                <div className="text-xs text-muted-foreground border-t pt-4">
                  <div>
                    <strong>Idioma:</strong> {selectedMessage.metadata.locale}
                  </div>
                  {selectedMessage.userAgent && (
                    <div className="mt-1">
                      <strong>Navegador:</strong> {selectedMessage.userAgent}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 border-t pt-4">
                <Select
                  value={selectedMessage.status}
                  onValueChange={value =>
                    handleUpdateStatus(
                      selectedMessage.id,
                      value as 'new' | 'in_progress' | 'completed' | 'archived'
                    )
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuevo</SelectItem>
                    <SelectItem value="in_progress">En Proceso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>

                {selectedMessage.email && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(`mailto:${selectedMessage.email}`, '_blank')
                    }
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                )}

                {selectedMessage.phone && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(`tel:${selectedMessage.phone}`, '_blank')
                    }
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
