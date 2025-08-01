'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { emailService } from '@/services/email';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EmailTestPanelProps {
  className?: string;
}

export default function EmailTestPanel({ className }: EmailTestPanelProps) {
  const [selectedLocale, setSelectedLocale] = useState('es');
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isTesting, setIsTesting] = useState(false);

  const locales = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
  ];

  const testEmailData = {
    name: 'Test User',
    email: 'test@example.com',
    eventType: 'Boda',
    eventDate: '2024-09-15',
    location: 'Montevideo, Uruguay',
    services: ['Fotografía', 'Video'],
    message:
      'Este es un mensaje de prueba para verificar el funcionamiento del sistema de emails.',
    phone: '+598 99 123 456',
    source: 'contact_form' as const,
    locale: selectedLocale,
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    setTestResult({ type: null, message: '' });

    try {
      await emailService.sendContactForm(testEmailData);
      setTestResult({
        type: 'success',
        message: `Email de prueba enviado exitosamente en ${locales.find(l => l.code === selectedLocale)?.name}`,
      });
    } catch (error) {
      setTestResult({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Error desconocido al enviar email',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestConfiguration = async () => {
    setIsTesting(true);
    setTestResult({ type: null, message: '' });

    try {
      const isConfigured = await emailService.testConfiguration();
      if (isConfigured) {
        setTestResult({
          type: 'success',
          message: 'Configuración de EmailJS válida',
        });
      } else {
        setTestResult({
          type: 'error',
          message: 'Configuración de EmailJS inválida o faltante',
        });
      }
    } catch (error) {
      setTestResult({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Error al verificar configuración',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getEmailTemplates = () => {
    const templates = emailService.getEmailTemplates(selectedLocale);
    return templates;
  };

  const templates = getEmailTemplates();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Panel de Prueba de Emails
        </CardTitle>
        <CardDescription>
          Prueba el sistema de emails con diferentes idiomas y verifica la
          configuración de EmailJS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="locale-select">Idioma de prueba</Label>
          <Select value={selectedLocale} onValueChange={setSelectedLocale}>
            <SelectTrigger id="locale-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locales.map(locale => (
                <SelectItem key={locale.code} value={locale.code}>
                  {locale.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email Templates Preview */}
        <div className="space-y-4">
          <h4 className="font-medium">
            Plantillas de Email (
            {locales.find(l => l.code === selectedLocale)?.name})
          </h4>

          {/* Admin Template */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Email para Administradores
            </Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm font-medium mb-1">
                Asunto: {templates.admin.subject}
              </div>
              <Textarea
                value={templates.admin.body}
                readOnly
                className="min-h-[200px] text-sm"
                placeholder="Contenido del email..."
              />
            </div>
          </div>

          {/* User Template */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Email de Respuesta Automática
            </Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm font-medium mb-1">
                Asunto: {templates.user.subject}
              </div>
              <Textarea
                value={templates.user.body}
                readOnly
                className="min-h-[200px] text-sm"
                placeholder="Contenido del email..."
              />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleTestConfiguration}
            disabled={isTesting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Verificar Configuración
          </Button>

          <Button
            onClick={handleTestEmail}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar Email de Prueba
          </Button>
        </div>

        {/* Test Result */}
        {testResult.type && (
          <div
            className={`p-3 rounded-md flex items-center gap-2 ${
              testResult.type === 'success'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}
          >
            {testResult.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        {/* Test Data Info */}
        <div className="p-3 bg-accent/10 rounded-md">
          <h5 className="font-medium text-accent-foreground mb-2">
            Datos de Prueba
          </h5>
          <div className="text-sm text-accent-foreground/80 space-y-1">
            <div>
              <strong>Nombre:</strong> {testEmailData.name}
            </div>
            <div>
              <strong>Email:</strong> {testEmailData.email}
            </div>
            <div>
              <strong>Tipo de Evento:</strong> {testEmailData.eventType}
            </div>
            <div>
              <strong>Fecha:</strong> {testEmailData.eventDate}
            </div>
            <div>
              <strong>Ubicación:</strong> {testEmailData.location}
            </div>
            <div>
              <strong>Servicios:</strong> {testEmailData.services.join(', ')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
