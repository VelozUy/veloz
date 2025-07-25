'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { crewAvailabilityService, type AvailabilityCalendar, type AvailabilitySlot, type CreateAvailabilitySlotData } from '@/services/crew-availability';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';

interface CrewAvailabilityCalendarProps {
  selectedCrewMemberId?: string;
  onCrewMemberChange?: (crewMemberId: string) => void;
}

export default function CrewAvailabilityCalendar({ 
  selectedCrewMemberId,
  onCrewMemberChange 
}: CrewAvailabilityCalendarProps) {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [selectedCrewMember, setSelectedCrewMember] = useState<string>(selectedCrewMemberId || '');
  const [calendar, setCalendar] = useState<AvailabilityCalendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState<CreateAvailabilitySlotData>({
    crewMemberId: '',
    startTime: new Date(),
    endTime: new Date(),
    type: 'available',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadCrewMembers();
  }, []);

  useEffect(() => {
    if (selectedCrewMember) {
      loadCalendar();
    }
  }, [selectedCrewMember, currentDate]);

  const loadCrewMembers = async () => {
    try {
      const response = await crewMemberService.getAllCrewMembers();
      if (response.success && response.data) {
        setCrewMembers(response.data);
        if (!selectedCrewMember && response.data.length > 0) {
          setSelectedCrewMember(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading crew members:', error);
      setError('Error al cargar miembros del equipo');
    }
  };

  const loadCalendar = async () => {
    if (!selectedCrewMember) return;

    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(currentDate);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      const response = await crewAvailabilityService.getCrewMemberAvailability(
        selectedCrewMember,
        startDate,
        endDate
      );

      if (response.success && response.data) {
        setCalendar(response.data);
      } else {
        setError(response.error || 'Error al cargar el calendario');
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
      setError('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const handleCrewMemberChange = (crewMemberId: string) => {
    setSelectedCrewMember(crewMemberId);
    onCrewMemberChange?.(crewMemberId);
  };

  const handleAddSlot = async () => {
    if (!selectedCrewMember) return;

    try {
      setLoading(true);
      const slotData = {
        ...newSlot,
        crewMemberId: selectedCrewMember,
      };

      const response = await crewAvailabilityService.createAvailabilitySlot(slotData);
      if (response.success) {
        setIsAddSlotDialogOpen(false);
        setNewSlot({
          crewMemberId: '',
          startTime: new Date(),
          endTime: new Date(),
          type: 'available',
          reason: '',
          notes: '',
        });
        loadCalendar();
      } else {
        setError(response.error || 'Error al crear el slot');
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      setError('Error al crear el slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este slot?')) return;

    try {
      setLoading(true);
      const response = await crewAvailabilityService.deleteAvailabilitySlot(slotId);
      if (response.success) {
        loadCalendar();
      } else {
        setError(response.error || 'Error al eliminar el slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      setError('Error al eliminar el slot');
    } finally {
      setLoading(false);
    }
  };

  const getSlotColor = (type: string) => {
    switch (type) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'busy':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'unavailable':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'busy':
        return <Clock className="w-4 h-4" />;
      case 'unavailable':
        return <X className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getSlotsForDate = (date: Date) => {
    if (!calendar) return [];

    return calendar.slots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      return (
        slotDate.getDate() === date.getDate() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const days = getDaysInMonth(currentDate);
  const selectedCrewMemberData = crewMembers.find(c => c.id === selectedCrewMember);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendario de Disponibilidad</h2>
          <p className="text-muted-foreground">
            Gestiona la disponibilidad de los miembros del equipo
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCrewMember} onValueChange={handleCrewMemberChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar miembro del equipo" />
            </SelectTrigger>
            <SelectContent>
              {crewMembers.map(crew => (
                <SelectItem key={crew.id} value={crew.id}>
                  {crew.name.es}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddSlotDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Slot
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const prevMonth = new Date(currentDate);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            setCurrentDate(prevMonth);
          }}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Mes Anterior
        </Button>
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <Button
          variant="outline"
          onClick={() => {
            const nextMonth = new Date(currentDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            setCurrentDate(nextMonth);
          }}
        >
          Mes Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Cargando calendario...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadCalendar}>Reintentar</Button>
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && !error && calendar && (
        <div className="space-y-4">
          {/* Availability Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Resumen de Disponibilidad - {calendar.crewMemberName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {calendar.totalAvailableHours.toFixed(1)}h
                  </div>
                  <p className="text-sm text-green-600">Horas Disponibles</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {calendar.totalBusyHours.toFixed(1)}h
                  </div>
                  <p className="text-sm text-red-600">Horas Ocupadas</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {calendar.availabilityPercentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-blue-600">Disponibilidad</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {calendar.conflicts.length}
                  </div>
                  <p className="text-sm text-orange-600">Conflictos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Calendario Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                  const slots = getSlotsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 border rounded-lg ${
                        isToday ? 'bg-primary/10 border-primary' : 'bg-background'
                      } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {slots.map(slot => (
                          <div
                            key={slot.id}
                            className={`p-1 rounded text-xs border ${getSlotColor(slot.type)}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {getSlotIcon(slot.type)}
                                <span className="font-medium">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="h-4 w-4 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            {slot.reason && (
                              <div className="text-xs mt-1">{slot.reason}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Conflicts */}
          {calendar.conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                  Conflictos Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {calendar.conflicts.map((conflict, index) => (
                    <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-800">
                          {conflict.conflictType === 'double_booking' ? 'Doble reserva' : 'Conflicto de horario'}
                        </span>
                      </div>
                      <div className="text-sm text-orange-700">
                        {conflict.conflictingSlots.map(slot => (
                          <div key={slot.id} className="ml-4">
                            {formatDate(slot.startTime)} {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Slot Dialog */}
      <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Slot de Disponibilidad</DialogTitle>
            <DialogDescription>
              Define un nuevo período de disponibilidad para {selectedCrewMemberData?.name.es}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Inicio</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={newSlot.startTime.toISOString().slice(0, 16)}
                  onChange={(e) => setNewSlot({
                    ...newSlot,
                    startTime: new Date(e.target.value),
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de Fin</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={newSlot.endTime.toISOString().slice(0, 16)}
                  onChange={(e) => setNewSlot({
                    ...newSlot,
                    endTime: new Date(e.target.value),
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newSlot.type}
                onValueChange={(value: 'available' | 'unavailable' | 'busy') =>
                  setNewSlot({ ...newSlot, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="busy">Ocupado</SelectItem>
                  <SelectItem value="unavailable">No Disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Razón (opcional)</Label>
              <Input
                id="reason"
                value={newSlot.reason}
                onChange={(e) => setNewSlot({ ...newSlot, reason: e.target.value })}
                placeholder="Ej: Proyecto de boda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={newSlot.notes}
                onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
                placeholder="Información adicional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSlotDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSlot} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Agregar Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 