import React from 'react';
import FAQSection from '@/components/about/FAQSection';

// Mock FAQ data for demonstration
const mockFAQs = [
  {
    id: '1',
    question: '¿Qué servicios ofrecen?',
    answer: 'Ofrecemos servicios completos de fotografía y videografía para eventos sociales, corporativos y culturales.',
    order: 1
  },
  {
    id: '2',
    question: '¿Cuánto cuestan sus servicios?',
    answer: 'Nuestros precios varían según el tipo de evento, duración y paquete seleccionado. Contáctanos para una cotización personalizada.',
    order: 2
  },
  {
    id: '3',
    question: '¿Qué equipos utilizan?',
    answer: 'Utilizamos equipos profesionales de última generación, incluyendo cámaras Canon y Sony de alta resolución.',
    order: 3
  },
  {
    id: '4',
    question: '¿Cuánto tiempo tardan en entregar?',
    answer: 'El tiempo de entrega varía según el tipo de proyecto, pero generalmente entregamos en 2-3 semanas.',
    order: 4
  },
  {
    id: '5',
    question: '¿Trabajan en todo Uruguay?',
    answer: 'Sí, cubrimos todo el territorio uruguayo y también realizamos trabajos en el exterior.',
    order: 5
  },
  {
    id: '6',
    question: '¿Incluyen edición en sus servicios?',
    answer: 'Sí, todos nuestros paquetes incluyen edición profesional y retoque de imágenes.',
    order: 6
  },
  {
    id: '7',
    question: '¿Pueden trabajar en eventos nocturnos?',
    answer: 'Absolutamente, tenemos experiencia en eventos nocturnos y disponemos de equipos especializados para condiciones de poca luz.',
    order: 7
  },
  {
    id: '8',
    question: '¿Ofrecen videos de drone?',
    answer: 'Sí, ofrecemos servicios de videografía con drone para tomas aéreas espectaculares.',
    order: 8
  }
];

export default function FAQDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-background text-foreground border-b border-border"
        style={{ height: "4rem" }}
      >
        <div className="mx-auto max-w-7xl px-16 h-full flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-semibold text-lg font-display">VELOZ</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="hover:text-primary transition-colors">Inicio</a>
            <a href="#" className="hover:text-primary transition-colors">Trabajo</a>
            <a href="#" className="hover:text-primary transition-colors">Sobre Nosotros</a>
            <a href="#" className="hover:text-primary transition-colors">Contacto</a>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: "4rem" }}>
        {/* Hero Section */}
        <div className="bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-16 py-24">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl font-display">
              FAQ Demo
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
              Demostración del nuevo sistema de FAQ con pestañas adhesivas organizadas por categorías.
            </p>
          </div>
        </div>

        {/* FAQ Section with Sticky Tabs */}
        <FAQSection 
          faqs={mockFAQs}
          title="Preguntas Frecuentes"
          locale="es"
        />

        {/* Footer */}
        <footer className="bg-background py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-16 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              ¿Tienes más preguntas?
            </h2>
            <p className="text-muted-foreground mb-8">
              Si no encontraste la respuesta que buscabas, no dudes en contactarnos.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 font-medium hover:bg-primary/90 transition-colors">
              Contactar Ahora
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
} 