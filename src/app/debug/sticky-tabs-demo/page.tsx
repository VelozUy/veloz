import React from 'react';
import StickyTabs from '@/components/ui/sticky-section-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlaceholderSvg = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 60 60"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Placeholder Logo"
    className="text-muted-foreground"
  >
    <path
      d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.5 35.5 20 40H40C40 51.0457 31.0457 60 20 60C8.95431 60 0 51.0457 0 40C0 28.9543 9.5 22 20 20H0Z"
      fill="currentColor"
    ></path>
    <path
      d="M40 60C51.7324 55.0977 60 43.5117 60 30C60 16.4883 51.7324 4.90234 40 0V60Z"
      fill="currentColor"
    ></path>
  </svg>
);

const PlaceholderContent: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-8">
    <PlaceholderSvg />
    <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground max-w-xl">{description}</p>
  </div>
);

const ProcessStep: React.FC<{
  title: string;
  description: string;
  features: string[];
  imageUrl?: string;
}> = ({ title, description, features, imageUrl }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground text-lg leading-relaxed">
        {description}
      </p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="relative">
      {imageUrl ? (
        <div className="aspect-video bg-muted rounded-none border border-border flex items-center justify-center">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-none border border-border flex items-center justify-center">
          <PlaceholderSvg />
        </div>
      )}
    </div>
  </div>
);

export default function StickyTabsDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-background text-foreground border-b border-border"
        style={{ height: '4rem' }}
      >
        <div className="mx-auto max-w-7xl px-16 h-full flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-semibold text-lg font-display">VELOZ</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="hover:text-primary transition-colors">
              Inicio
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Trabajo
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Sobre Nosotros
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '4rem' }}>
        {/* Hero Section */}
        <div className="bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-16 py-24">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl font-display">
              Nuestro Proceso
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
              Descubre cómo transformamos tus eventos en momentos inolvidables a
              través de nuestro proceso especializado y profesional.
            </p>
          </div>
        </div>

        {/* Sticky Tabs Section */}
        <StickyTabs
          mainNavHeight="4rem"
          rootClassName="bg-background text-foreground"
          navSpacerClassName="border-b border-border bg-background"
          sectionClassName="bg-muted"
          stickyHeaderContainerClassName="shadow-lg"
          headerContentWrapperClassName="border-b border-t border-border bg-background"
          headerContentLayoutClassName="mx-auto max-w-7xl px-16 py-5"
          titleClassName="my-0 text-2xl font-medium leading-none md:text-3xl lg:text-4xl"
          contentLayoutClassName="mx-auto max-w-7xl px-16 py-8"
        >
          <StickyTabs.Item title="Paso 1: Consulta Inicial" id="consulta">
            <ProcessStep
              title="Entendemos tus necesidades"
              description="Comenzamos con una consulta detallada para comprender completamente tu visión, objetivos y requisitos específicos para el evento."
              features={[
                'Análisis de objetivos y público objetivo',
                'Definición de estilo y tono visual',
                'Evaluación de logística y ubicación',
                'Presupuesto y cronograma inicial',
              ]}
            />
          </StickyTabs.Item>

          <StickyTabs.Item
            title="Paso 2: Planificación Estratégica"
            id="planificacion"
          >
            <ProcessStep
              title="Desarrollamos la estrategia"
              description="Creamos un plan detallado que incluye cronogramas, equipos especializados y todos los elementos necesarios para capturar momentos únicos."
              features={[
                'Asignación de equipo especializado',
                'Cronograma detallado de producción',
                'Selección de equipos y técnicas',
                'Coordinación con proveedores',
              ]}
            />
          </StickyTabs.Item>

          <StickyTabs.Item title="Paso 3: Producción" id="produccion">
            <ProcessStep
              title="Capturamos los momentos"
              description="Nuestro equipo de profesionales especializados trabaja en conjunto para documentar cada aspecto importante de tu evento."
              features={[
                'Fotografía profesional de alta calidad',
                'Video documental y cinematográfico',
                'Cobertura completa del evento',
                'Captura de momentos espontáneos',
              ]}
            />
          </StickyTabs.Item>

          <StickyTabs.Item title="Paso 4: Post-Producción" id="post-produccion">
            <ProcessStep
              title="Perfeccionamos el material"
              description="Nuestros editores especializados transforman el material capturado en piezas visuales impactantes y profesionales."
              features={[
                'Edición y retoque profesional',
                'Colorización y corrección de color',
                'Montaje de video y audio',
                'Selección de mejores tomas',
              ]}
            />
          </StickyTabs.Item>

          <StickyTabs.Item title="Paso 5: Entrega" id="entrega">
            <ProcessStep
              title="Entregamos tu proyecto"
              description="Proporcionamos el material final en formatos optimizados, listos para uso en tus canales de comunicación."
              features={[
                'Entrega en múltiples formatos',
                'Archivos optimizados para web y print',
                'Derechos de uso completos',
                'Soporte post-entrega',
              ]}
            />
          </StickyTabs.Item>
        </StickyTabs>

        {/* Footer */}
        <footer className="bg-background py-8 border-t border-border">
          <div className="mx-auto max-w-7xl px-16 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              ¿Comenzamos?
            </h2>
            <p className="text-muted-foreground mb-8">
              Contáctanos para discutir cómo podemos hacer de tu próximo evento
              algo extraordinario.
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
