'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  MessageSquare,
  User,
  Building,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { contactMessageService } from '@/services/contact-messages';
import type { ContactMessage } from '@/types';

interface ProjectContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'client' | 'stakeholder' | 'vendor' | 'other';
  eventType?: string;
  eventDate?: string;
  message?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectContactTabProps {
  projectId: string;
  projectTitle?: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const CONTACT_ROLES = [
  { value: 'client', label: 'Cliente', icon: User },
  { value: 'stakeholder', label: 'Interesado', icon: Users },
  { value: 'vendor', label: 'Proveedor', icon: Building },
  { value: 'other', label: 'Otro', icon: UserCheck },
] as const;

export default function ProjectContactTab({
  projectId,
  projectTitle,
  onSuccess,
  onError,
}: ProjectContactTabProps) {
  const [contacts, setContacts] = useState<ProjectContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ProjectContact | null>(
    null
  );
  // Filter state
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for adding/editing contacts
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client' as ProjectContact['role'],
    eventType: '',
    eventDate: '',
    message: '',
  });

  useEffect(() => {
    loadProjectContacts();
  }, [projectId]);

  const loadProjectContacts = async () => {
    try {
      setLoading(true);
      setError('');

      // Get contacts for this specific project
      const response = await contactMessageService.getByProjectId(projectId);
      if (response.success && response.data) {
        // Map contacts to include role information
        const projectContacts = response.data.map(contact => ({
          ...contact,
          role: 'client' as ProjectContact['role'], // Default role
          createdAt: contact.createdAt
            ? new Date(contact.createdAt.seconds * 1000)
            : new Date(),
          updatedAt: contact.updatedAt
            ? new Date(contact.updatedAt.seconds * 1000)
            : new Date(),
        }));
        setContacts(projectContacts);
      }
    } catch (error) {
      console.error('Error loading project contacts:', error);
      setError('Error al cargar los contactos del proyecto');
      onError?.('Error al cargar los contactos del proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    try {
      if (!contactForm.name.trim()) {
        setError('El nombre es requerido');
        return;
      }

      // Create new contact
      const newContactData = {
        name: contactForm.name,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
        eventType: contactForm.eventType || 'other',
        eventDate: contactForm.eventDate || undefined,
        message: contactForm.message || undefined,
        source: 'contact_form' as const,
        isRead: false,
        projectId: projectId, // Link to current project
      };

      const response = await contactMessageService.create(newContactData);
      if (response.success) {
        // Reload contacts
        await loadProjectContacts();
        resetContactForm();
        setIsAddDialogOpen(false);
        onSuccess?.('Contacto agregado exitosamente');
      } else {
        setError(response.error || 'Error al agregar el contacto');
        onError?.(response.error || 'Error al agregar el contacto');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      setError('Error al agregar el contacto');
      onError?.('Error al agregar el contacto');
    }
  };

  const handleEditContact = async () => {
    try {
      if (!selectedContact) return;

      if (!contactForm.name.trim()) {
        setError('El nombre es requerido');
        return;
      }

      // Update contact
      const updateData = {
        name: contactForm.name,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
        eventType: contactForm.eventType || 'other',
        eventDate: contactForm.eventDate || undefined,
        message: contactForm.message || undefined,
      };

      const response = await contactMessageService.update(
        selectedContact.id,
        updateData
      );
      if (response.success) {
        // Reload contacts
        await loadProjectContacts();
        resetContactForm();
        setIsEditDialogOpen(false);
        setSelectedContact(null);
        onSuccess?.('Contacto actualizado exitosamente');
      } else {
        setError(response.error || 'Error al actualizar el contacto');
        onError?.(response.error || 'Error al actualizar el contacto');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      setError('Error al actualizar el contacto');
      onError?.('Error al actualizar el contacto');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const response = await contactMessageService.delete(contactId);
      if (response.success) {
        // Reload contacts
        await loadProjectContacts();
        onSuccess?.('Contacto eliminado exitosamente');
      } else {
        setError(response.error || 'Error al eliminar el contacto');
        onError?.(response.error || 'Error al eliminar el contacto');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      setError('Error al eliminar el contacto');
      onError?.('Error al eliminar el contacto');
    }
  };

  const handleEditClick = (contact: ProjectContact) => {
    setSelectedContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role,
      eventType: contact.eventType || '',
      eventDate: contact.eventDate || '',
      message: contact.message || '',
    });
    setIsEditDialogOpen(true);
  };

  const resetContactForm = () => {
    setContactForm({
      name: '',
      email: '',
      phone: '',
      role: 'client',
      eventType: '',
      eventDate: '',
      message: '',
    });
  };

  // Filter contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(contact => contact.role === filterRole);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        contact =>
          contact.name.toLowerCase().includes(term) ||
          contact.email?.toLowerCase().includes(term) ||
          contact.phone?.toLowerCase().includes(term) ||
          contact.message?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [contacts, filterRole, searchTerm]);

  const getRoleInfo = (role: ProjectContact['role']) => {
    return CONTACT_ROLES.find(r => r.value === role) || CONTACT_ROLES[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contactos del Proyecto</h3>
          <p className="text-sm text-muted-foreground">
            {contacts.length} contacto{contacts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetContactForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Contacto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
              <DialogDescription>
                Agrega un nuevo contacto para este proyecto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={e =>
                    setContactForm(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={e =>
                    setContactForm(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={contactForm.phone}
                  onChange={e =>
                    setContactForm(prev => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+598 99 123 456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={contactForm.role}
                  onValueChange={value =>
                    setContactForm(prev => ({
                      ...prev,
                      role: value as ProjectContact['role'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={e =>
                    setContactForm(prev => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Información adicional..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddContact}>Agregar Contacto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {CONTACT_ROLES.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No hay contactos
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterRole !== 'all'
                  ? 'No se encontraron contactos que coincidan con los filtros'
                  : 'Aún no hay contactos asociados a este proyecto'}
              </p>
              {!searchTerm && filterRole === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Contacto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredContacts.map(contact => {
              const roleInfo = getRoleInfo(contact.role);
              const RoleIcon = roleInfo.icon;

              return (
                <Card key={contact.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {roleInfo.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {contact.createdAt.toLocaleDateString('es-ES')}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">
                            {contact.name}
                          </h4>
                          <div className="space-y-1 text-sm text-muted-foreground mt-2">
                            {contact.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="w-3 h-3" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {contact.eventType && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3" />
                                <span>{contact.eventType}</span>
                                {contact.eventDate && (
                                  <span>
                                    -{' '}
                                    {new Date(
                                      contact.eventDate
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                            {contact.message && (
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-3 h-3 mt-0.5" />
                                <span className="line-clamp-2">
                                  {contact.message}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(contact)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Contacto</DialogTitle>
            <DialogDescription>
              Modifica la información del contacto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={contactForm.name}
                onChange={e =>
                  setContactForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={contactForm.email}
                onChange={e =>
                  setContactForm(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={contactForm.phone}
                onChange={e =>
                  setContactForm(prev => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+598 99 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select
                value={contactForm.role}
                onValueChange={value =>
                  setContactForm(prev => ({
                    ...prev,
                    role: value as ProjectContact['role'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-message">Mensaje</Label>
              <Textarea
                id="edit-message"
                value={contactForm.message}
                onChange={e =>
                  setContactForm(prev => ({ ...prev, message: e.target.value }))
                }
                placeholder="Información adicional..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditContact}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
