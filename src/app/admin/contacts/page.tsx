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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Reply,
  Archive,
  Trash2,
  Users,
  Link,
  Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { contactMessageService } from '@/services/contact-messages';
import type { ContactMessage } from '@/types';
import ContactProjectAssignment from '@/components/admin/ContactProjectAssignment';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'in_progress' | 'completed' | 'archived'>('all');
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactMessageService.getAll();
      if (response.success && response.data) {
        setContacts(response.data as ContactMessage[]);
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
      filtered = filtered.filter(contact =>
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

  const handleStatusUpdate = async (contactId: string, newStatus: ContactMessage['status']) => {
    try {
      await contactMessageService.update(contactId, { status: newStatus });
      setContacts(prev => 
        prev.map(contact => 
          contact.id === contactId 
            ? { ...contact, status: newStatus }
            : contact
        )
      );
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-heading-md font-body text-foreground mb-1">
            Gestión de Contactos
          </h1>
          <p className="text-body-sm text-muted-foreground">
            Gestiona los mensajes de contacto y conéctalos con proyectos
          </p>
        </div>

        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="assignment">Asignación a Proyectos</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Mensajes de Contacto</span>
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="status-filter">Filtrar por estado</Label>
                    <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
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
                            {contact.isRead ? (
                              <Badge variant="secondary">Leído</Badge>
                            ) : (
                              <Badge variant="destructive">Nuevo</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-3 w-3" />
                              <span>{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="h-3 w-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-3 w-3" />
                              <span>{contact.eventType}</span>
                              {contact.eventDate && (
                                <span>- {new Date(contact.eventDate).toLocaleDateString()}</span>
                              )}
                            </div>
                            {contact.message && (
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="h-3 w-3 mt-0.5" />
                                <span className="line-clamp-2">{contact.message}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

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
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(contact.id, 'in_progress')}
                          disabled={contact.status === 'in_progress'}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          En Progreso
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(contact.id, 'completed')}
                          disabled={contact.status === 'completed'}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Completado
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(contact.id, 'archived')}
                          disabled={contact.status === 'archived'}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archivar
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
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4">
            <ContactProjectAssignment 
              onAssignmentChange={(contactId, projectId) => {
                console.log('Contact assigned:', contactId, 'to project:', projectId);
                // Optionally reload contacts to show updated assignment
                loadContacts();
              }}
              onProjectCreated={(projectId) => {
                console.log('New project created:', projectId);
                // Optionally navigate to the new project
                window.open(`/admin/projects/${projectId}/edit`, '_blank');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
