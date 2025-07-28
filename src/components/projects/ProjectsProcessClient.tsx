'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Camera,
  Users,
  CheckCircle,
  ArrowRight,
  Clock,
  Star,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

const processSteps = [
  {
    id: 1,
    title: 'Consulta Inicial',
    description:
      'Conversamos sobre tu evento, necesidades específicas y visión del proyecto.',
    icon: MessageSquare,
    duration: '30 min',
    color: 'bg-primary',
  },
  {
    id: 2,
    title: 'Propuesta Personalizada',
    description:
      'Creamos una propuesta única que incluye equipo, timeline y presupuesto detallado.',
    icon: Calendar,
    duration: '24-48h',
    color: 'bg-secondary',
  },
  {
    id: 3,
    title: 'Confirmación y Planificación',
    description:
      'Confirmamos detalles, armamos el equipo y creamos el plan de producción.',
    icon: Users,
    duration: '1 semana',
    color: 'bg-accent',
  },
  {
    id: 4,
    title: 'Día del Evento',
    description:
      'Nuestro equipo profesional captura cada momento con la máxima calidad.',
    icon: Camera,
    duration: 'Según evento',
    color: 'bg-destructive',
  },
  {
    id: 5,
    title: 'Edición y Entrega',
    description:
      'Procesamos, editamos y entregamos tu contenido en el formato acordado.',
    icon: CheckCircle,
    duration: '2-4 semanas',
    color: 'bg-success',
  },
];

const testimonials = [
  {
    name: 'María González',
    event: 'Casamiento',
    content:
      'El equipo de Veloz fue increíble. Su proceso único con múltiples fotógrafos capturó cada momento desde diferentes ángulos.',
    rating: 5,
  },
  {
    name: 'Carlos Rodríguez',
    event: 'Evento Corporativo',
    content:
      'Profesionalismo y calidad excepcional. El proceso fue transparente y el resultado superó nuestras expectativas.',
    rating: 5,
  },
  {
    name: 'Ana Silva',
    event: 'Quinceañera',
    content:
      'La atención al detalle y la creatividad del equipo hicieron que nuestro evento fuera inolvidable.',
    rating: 5,
  },
];

const faqs = [
  {
    question: '¿Cómo funciona el sistema de equipos?',
    answer:
      'Utilizamos múltiples fotógrafos y videógrafos que trabajan en conjunto para capturar cada momento desde diferentes perspectivas, asegurando que no se pierda ningún detalle importante.',
  },
  {
    question: '¿Cuánto tiempo toma la entrega?',
    answer:
      'La entrega típica es de 2-4 semanas, dependiendo del tipo de evento y la cantidad de material. Siempre te mantenemos informado del progreso.',
  },
  {
    question: '¿Qué incluye el servicio?',
    answer:
      'Nuestro servicio incluye consulta inicial, planificación, captura del evento, edición profesional y entrega digital. También ofrecemos álbumes físicos y videos editados.',
  },
  {
    question: '¿Puedo ver ejemplos de trabajos anteriores?',
    answer:
      '¡Por supuesto! Puedes ver nuestra galería de trabajos en la sección "Nuestro Trabajo" donde mostramos diferentes tipos de eventos y estilos.',
  },
];

export default function ProjectsProcessClient() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-border-64 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Nuestro Proceso
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Descubre cómo nuestro sistema único de producción basado en equipos
            transforma cada evento en una experiencia visual excepcional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Mail className="mr-2 h-5 w-5" />
                Consultar Disponibilidad
              </Button>
            </Link>
            <Link href="/projects/login">
              <Button variant="outline" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Acceso Clientes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-border-64 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nuestro Proceso en 5 Pasos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <Card key={step.id} className="relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${step.color} text-primary-foreground`}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        {step.duration}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Veloz */}
      <section className="py-16 px-4">
        <div className="max-w-border-64 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por Qué Elegir Veloz?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <Users className="h-5 w-5" />
                  </div>
                  <CardTitle>Sistema de Equipos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Múltiples fotógrafos y videógrafos trabajando en conjunto para
                  capturar cada momento desde diferentes ángulos y perspectivas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <Star className="h-5 w-5" />
                  </div>
                  <CardTitle>Calidad Profesional</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Equipos de alta gama y edición profesional para resultados que
                  superan las expectativas de nuestros clientes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent text-accent-foreground">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <CardTitle>Proceso Transparente</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comunicación clara en cada paso, desde la consulta inicial
                  hasta la entrega final del proyecto.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-border-64 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.event}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-border-64 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-border-64 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para Comenzar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Cuéntanos sobre tu evento y descubre cómo podemos hacerlo
            inolvidable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                <Mail className="mr-2 h-5 w-5" />
                Contactar Ahora
              </Button>
            </Link>
            <Link href="/projects/login">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Users className="mr-2 h-5 w-5" />
                Acceso Clientes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
