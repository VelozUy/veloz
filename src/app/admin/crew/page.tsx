'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, User, Eye } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';
import CrewMemberForm from './CrewMemberForm';

export default function CrewManagementPage() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    loadCrewMembers();
  }, []);

  const loadCrewMembers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Crew page - loading crew members...');
      const result = await crewMemberService.getAll();
      console.log('🔍 Crew page - getAll result:', result);
      if (result.success) {
        const crewData = (result.data as CrewMember[]) || [];
        console.log('🔍 Crew page - crew data:', crewData);
        setCrewMembers(crewData);
      } else {
        console.error('Failed to load crew members:', result.error);
      }
    } catch (error) {
      console.error('Error loading crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadCrewMembers();
      return;
    }

    try {
      setLoading(true);
      const result = await crewMemberService.searchCrewMembers(searchTerm);
      if (result.success) {
        setCrewMembers((result.data as CrewMember[]) || []);
      } else {
        console.error('Search failed:', result.error);
      }
    } catch (error) {
      console.error('Error searching crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')) {
      return;
    }

    try {
      const result = await crewMemberService.delete(id);
      if (result.success) {
        await loadCrewMembers();
      } else {
        console.error('Failed to delete crew member:', result.error);
      }
    } catch (error) {
      console.error('Error deleting crew member:', error);
    }
  };

  const handleEdit = (crewMember: CrewMember) => {
    setSelectedCrewMember(crewMember);
    setIsFormOpen(true);
  };

  const handleView = (crewMember: CrewMember) => {
    setSelectedCrewMember(crewMember);
    setIsViewOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCrewMember(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadCrewMembers();
  };

  const filteredCrewMembers = crewMembers.filter(member =>
    (member.name.es || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.name.en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role.es || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role.en || '').toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <AdminLayout title="Gestión de Equipo">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Equipo</h1>
            <p className="text-muted-foreground">
              Administra los miembros del equipo y sus perfiles profesionales
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Miembro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedCrewMember ? 'Editar Miembro del Equipo' : 'Agregar Miembro del Equipo'}
                </DialogTitle>
              </DialogHeader>
              <CrewMemberForm
                crewMember={selectedCrewMember}
                onSuccess={handleFormSuccess}
                onCancel={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre, rol o habilidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Crew Members List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Cargando miembros del equipo...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredCrewMembers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay miembros del equipo'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Comienza agregando el primer miembro del equipo'}
                </p>
                {!searchTerm && (
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Primer Miembro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Miembro del Equipo</DialogTitle>
                      </DialogHeader>
                      <CrewMemberForm
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormClose}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCrewMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {member.portrait ? (
                          <img
                            src={member.portrait}
                            alt={member.name.es}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{member.name.es}</h3>
                        <p className="text-sm text-muted-foreground">{member.role.es}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(member)}
                        aria-label="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(member)}
                        aria-label="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        aria-label="Eliminar"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {member.bio.es && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {member.bio.es}
                      </p>
                    )}
                    {member.socialLinks && (member.socialLinks.instagram || member.socialLinks.linkedin) && (
                      <div className="flex space-x-2">
                        {member.socialLinks.instagram && (
                          <Badge variant="outline" className="text-xs">
                            Instagram
                          </Badge>
                        )}
                        {member.socialLinks.linkedin && (
                          <Badge variant="outline" className="text-xs">
                            LinkedIn
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Miembro del Equipo</DialogTitle>
            </DialogHeader>
            {selectedCrewMember && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    {selectedCrewMember.portrait ? (
                      <img
                        src={selectedCrewMember.portrait}
                        alt={selectedCrewMember.name.es}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCrewMember.name.es}</h3>
                    <p className="text-muted-foreground">{selectedCrewMember.role.es}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Biografía</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Español</p>
                        <p className="text-sm">{selectedCrewMember.bio.es || 'No disponible'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">English</p>
                        <p className="text-sm">{selectedCrewMember.bio.en || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Português</p>
                        <p className="text-sm">{selectedCrewMember.bio.pt || 'Não disponível'}</p>
                      </div>
                    </div>
                  </div>

                  {(selectedCrewMember.socialLinks?.instagram || selectedCrewMember.socialLinks?.linkedin) && (
                    <div>
                      <h4 className="font-medium mb-2">Enlaces Sociales</h4>
                      <div className="flex space-x-2">
                        {selectedCrewMember.socialLinks?.instagram && (
                          <Badge variant="outline">
                            Instagram: {selectedCrewMember.socialLinks.instagram}
                          </Badge>
                        )}
                        {selectedCrewMember.socialLinks?.linkedin && (
                          <Badge variant="outline">
                            LinkedIn: {selectedCrewMember.socialLinks.linkedin}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Información del Sistema</h4>
                                         <div className="text-sm text-muted-foreground space-y-1">
                       <p>ID: {selectedCrewMember.id}</p>
                       <p>Creado: {selectedCrewMember.createdAt?.toLocaleDateString()}</p>
                       <p>Actualizado: {selectedCrewMember.updatedAt?.toLocaleDateString()}</p>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
} 