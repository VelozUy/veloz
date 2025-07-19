'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
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
import { MessageCircle, Phone, Calendar as CalendarIcon } from 'lucide-react';

// UI text translations
const UI_TEXT = {
  es: {
    contact: 'Contactar',
    title: 'Contacta con nosotros',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    eventType: 'Tipo de evento',
    eventTypePlaceholder: 'Selecciona un tipo',
    eventDate: 'Fecha del evento',
    message: 'Mensaje',
    messagePlaceholder: 'Cuéntanos sobre tu proyecto...',
    sendMessage: 'Enviar mensaje',
    wedding: 'Boda',
    corporate: 'Corporativo',
    birthday: 'Cumpleaños',
    other: 'Otro',
  },
  en: {
    contact: 'Contact',
    title: 'Contact us',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    eventType: 'Event type',
    eventTypePlaceholder: 'Select a type',
    eventDate: 'Event date',
    message: 'Message',
    messagePlaceholder: 'Tell us about your project...',
    sendMessage: 'Send message',
    wedding: 'Wedding',
    corporate: 'Corporate',
    birthday: 'Birthday',
    other: 'Other',
  },
  pt: {
    contact: 'Contactar',
    title: 'Entre em contato conosco',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    eventType: 'Tipo de evento',
    eventTypePlaceholder: 'Selecione um tipo',
    eventDate: 'Data do evento',
    message: 'Mensagem',
    messagePlaceholder: 'Conte-nos sobre seu projeto...',
    sendMessage: 'Enviar mensagem',
    wedding: 'Casamento',
    corporate: 'Corporativo',
    birthday: 'Aniversário',
    other: 'Outro',
  },
};

interface ContactWidgetProps {
  language?: 'es' | 'en' | 'pt';
}

export function ContactWidget({ language = 'es' }: ContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    message: '',
  });

  const uiText = UI_TEXT[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setIsOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      eventType: '',
      date: '',
      message: '',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            {uiText.contact}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{uiText.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{uiText.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{uiText.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{uiText.phone}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">{uiText.eventType}</Label>
              <Select
                value={formData.eventType}
                onValueChange={value =>
                  setFormData({ ...formData, eventType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={uiText.eventTypePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">{uiText.wedding}</SelectItem>
                  <SelectItem value="corporate">{uiText.corporate}</SelectItem>
                  <SelectItem value="birthday">{uiText.birthday}</SelectItem>
                  <SelectItem value="other">{uiText.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">{uiText.eventDate}</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{uiText.message}</Label>
              <textarea
                id="message"
                className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none bg-background text-foreground"
                value={formData.message}
                onChange={e =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder={uiText.messagePlaceholder}
              />
            </div>
            <Button type="submit" className="w-full">
              {uiText.sendMessage}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
