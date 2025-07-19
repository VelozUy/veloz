# Gallery Page Migration to shadcn/ui Components

## Overview

This document outlines the complete migration plan to refactor the `/gallery` page to use only shadcn/ui components and blocks, removing all custom components. This will ensure consistency, maintainability, and better integration with the design system.

## Current Architecture Analysis

### Current Components Used

- `StaticGalleryContent` (custom)
- `InfiniteScrollingGallery` (custom)
- `GalleryFilter` (custom)
- `MediaLightbox` (custom)
- `InteractiveCTAWidget` (custom)

### Current UI Components

- `Badge` (shadcn)
- `Button` (shadcn)
- `Dialog` (shadcn)
- `Image` (Next.js)
- `Link` (Next.js)

## Migration Plan

### Phase 1: Component Analysis and Replacement Mapping

#### 1.1 Replace Custom Components with shadcn Blocks

| Custom Component           | shadcn Block Replacement       | Notes                                 |
| -------------------------- | ------------------------------ | ------------------------------------- |
| `StaticGalleryContent`     | `Card` + `Tabs` + `ScrollArea` | Main container with project cards     |
| `InfiniteScrollingGallery` | `ScrollArea` + `Card`          | Horizontal scrolling project showcase |
| `GalleryFilter`            | `Button` + `Badge`             | Filter buttons with counts            |
| `MediaLightbox`            | `Dialog` + `Carousel`          | Modal with media carousel             |
| `InteractiveCTAWidget`     | `Card` + `Form` + `Calendar`   | Contact form widget                   |

#### 1.2 shadcn Components to Install

```bash
# Core components
npx shadcn@latest add card
npx shadcn@latest add tabs
npx shadcn@latest add scroll-area
npx shadcn@latest add carousel
npx shadcn@latest add form
npx shadcn@latest add calendar
npx shadcn@latest add badge
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add hover-card
```

### Phase 2: New Gallery Page Structure

#### 2.1 Main Gallery Page (`src/app/gallery/page.tsx`)

```tsx
import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import { GalleryContent } from '@/components/gallery/GalleryContent';
import { ContactWidget } from '@/components/gallery/ContactWidget';

export const metadata: Metadata = {
  title: 'Nuestro Trabajo | Veloz Fotografía y Videografía',
  description:
    'Explora nuestro portafolio de bodas, eventos corporativos, cumpleaños y más.',
  // ... rest of metadata
};

export default function GalleryPage() {
  const content = getStaticContent('es');

  return (
    <div className="min-h-screen bg-background">
      <GalleryContent content={content} />
      <ContactWidget />
    </div>
  );
}
```

#### 2.2 Gallery Content Component (`src/components/gallery/GalleryContent.tsx`)

```tsx
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Heart, Calendar, MapPin, Play, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { LocalizedContent } from '@/lib/static-content.generated';

interface GalleryContentProps {
  content: LocalizedContent;
}

export function GalleryContent({ content }: GalleryContentProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Transform content to projects
  const projects = useMemo(() => {
    if (!content.content.projects) return [];
    return content.content.projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (
        new Date(b.eventDate || 0).getTime() -
        new Date(a.eventDate || 0).getTime()
      );
    });
  }, [content]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter(project => project.eventType === activeFilter);
  }, [projects, activeFilter]);

  // Get unique event types
  const eventTypes = useMemo(() => {
    const types = new Set(projects.map(p => p.eventType).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [projects]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Nuestro Trabajo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explora nuestra colección de proyectos pasados. Cada imagen y video
          cuenta una historia única.
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={setActiveFilter}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {eventTypes.map(type => (
            <TabsTrigger
              key={type}
              value={type}
              className="flex items-center gap-2"
            >
              {type === 'all' ? 'Todos' : type}
              <Badge variant="secondary" className="ml-1">
                {type === 'all'
                  ? projects.length
                  : projects.filter(p => p.eventType === type).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card
            key={project.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader className="p-0">
              <div className="relative aspect-video">
                {project.media.find(m => m.featured) ? (
                  <Image
                    src={project.media.find(m => m.featured)!.url}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No media</span>
                  </div>
                )}
                {project.featured && (
                  <Badge className="absolute top-2 left-2">
                    <Heart className="w-3 h-3 mr-1" />
                    Destacado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                {project.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </span>
                )}
                {project.eventDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.eventDate).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
              <Button
                onClick={() => setSelectedProject(project.id)}
                className="w-full"
              >
                Ver Proyecto
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Detail Dialog */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedProject &&
                projects.find(p => p.id === selectedProject)?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              {/* Project Media Carousel */}
              <Carousel className="w-full">
                <CarouselContent>
                  {projects
                    .find(p => p.id === selectedProject)
                    ?.media.map((media, index) => (
                      <CarouselItem key={media.id}>
                        <div className="relative aspect-video">
                          {media.type === 'video' ? (
                            <video
                              src={media.url}
                              className="w-full h-full object-cover rounded"
                              controls
                              autoPlay
                            />
                          ) : (
                            <Image
                              src={media.url}
                              alt={`${projects.find(p => p.id === selectedProject)?.title} - ${index + 1}`}
                              fill
                              className="object-cover rounded"
                            />
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>

              {/* Project Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {projects.find(p => p.id === selectedProject)?.title}
                </h3>
                <p className="text-muted-foreground">
                  {projects.find(p => p.id === selectedProject)?.description}
                </p>
                <div className="flex items-center gap-2">
                  {projects.find(p => p.id === selectedProject)?.eventType && (
                    <Badge variant="secondary">
                      {projects.find(p => p.id === selectedProject)?.eventType}
                    </Badge>
                  )}
                  {projects.find(p => p.id === selectedProject)?.featured && (
                    <Badge>
                      <Heart className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

#### 2.3 Contact Widget Component (`src/components/gallery/ContactWidget.tsx`)

```tsx
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

export function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            Contactar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contacta con nosotros</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="phone">Teléfono</Label>
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
              <Label htmlFor="eventType">Tipo de evento</Label>
              <Select
                value={formData.eventType}
                onValueChange={value =>
                  setFormData({ ...formData, eventType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Boda</SelectItem>
                  <SelectItem value="corporate">Corporativo</SelectItem>
                  <SelectItem value="birthday">Cumpleaños</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha del evento</Label>
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
              <Label htmlFor="message">Mensaje</Label>
              <textarea
                id="message"
                className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none"
                value={formData.message}
                onChange={e =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Cuéntanos sobre tu proyecto..."
              />
            </div>
            <Button type="submit" className="w-full">
              Enviar mensaje
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### Phase 3: Component Removal

#### 3.1 Files to Delete

```bash
# Remove custom gallery components
rm src/components/gallery/StaticGalleryContent.tsx
rm src/components/gallery/InfiniteScrollingGallery.tsx
rm src/components/gallery/GalleryFilter.tsx
rm src/components/gallery/MediaLightbox.tsx
rm src/components/gallery/MediaCard.tsx
rm src/components/gallery/GalleryContent.tsx

# Remove custom layout components
rm src/components/layout/InteractiveCTAWidget.tsx

# Remove test files
rm src/components/gallery/__tests__/InfiniteScrollingGallery.test.tsx
rm src/components/layout/__tests__/InteractiveCTAWidget.test.tsx
```

#### 3.2 Update Index Files

Update `src/components/gallery/index.ts`:

```ts
// Gallery Components
export { GalleryContent } from './GalleryContent';
export { ContactWidget } from './ContactWidget';
```

Update `src/components/layout/index.ts`:

```ts
// Layout Components
export { default as Hero } from './hero';
export { default as Navigation } from './navigation';
export { default as ConditionalNavigation } from './ConditionalNavigation';
export { default as PageLayout } from './PageLayout';
export { WidgetWrapper } from './WidgetWrapper';
```

### Phase 4: Testing and Validation

#### 4.1 Create New Tests

```tsx
// src/components/gallery/__tests__/GalleryContent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryContent } from '../GalleryContent';

const mockContent = {
  locale: 'es',
  content: {
    projects: [
      {
        id: '1',
        title: 'Test Project',
        description: 'Test description',
        eventType: 'Wedding',
        featured: true,
        media: [
          {
            id: 'media-1',
            type: 'photo',
            url: 'https://example.com/image.jpg',
            featured: true,
          },
        ],
      },
    ],
  },
};

describe('GalleryContent', () => {
  it('renders projects correctly', () => {
    render(<GalleryContent content={mockContent} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('opens project dialog when view button is clicked', () => {
    render(<GalleryContent content={mockContent} />);
    fireEvent.click(screen.getByText('Ver Proyecto'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

```tsx
// src/components/gallery/__tests__/ContactWidget.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactWidget } from '../ContactWidget';

describe('ContactWidget', () => {
  it('opens contact dialog when button is clicked', () => {
    render(<ContactWidget />);
    fireEvent.click(screen.getByText('Contactar'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('submits form correctly', () => {
    render(<ContactWidget />);
    fireEvent.click(screen.getByText('Contactar'));

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' },
    });

    fireEvent.click(screen.getByText('Enviar mensaje'));
    // Add assertions for form submission
  });
});
```

### Phase 5: Performance Optimization

#### 5.1 Add Loading States

```tsx
// Add loading skeleton to GalleryContent
import { Skeleton } from '@/components/ui/skeleton';

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="p-0">
            <Skeleton className="aspect-video w-full" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### 5.2 Add Error Boundaries

```tsx
// src/components/gallery/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GalleryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Algo salió mal al cargar la galería.
            </p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

### Phase 6: Accessibility Improvements

#### 6.1 Add ARIA Labels and Roles

```tsx
// Update GalleryContent with proper accessibility
<Dialog
  open={!!selectedProject}
  onOpenChange={() => setSelectedProject(null)}
  aria-label="Detalles del proyecto"
>
  <DialogContent
    className="max-w-4xl max-h-[90vh] overflow-hidden"
    aria-describedby="project-description"
  >
    {/* ... content ... */}
  </DialogContent>
</Dialog>
```

#### 6.2 Add Keyboard Navigation

```tsx
// Add keyboard navigation to carousel
<Carousel
  className="w-full"
  opts={{
    align: 'start',
    loop: true,
  }}
>
  {/* ... carousel content ... */}
</Carousel>
```

### Phase 7: Final Steps

#### 7.1 Update Dependencies

```bash
# Remove unused dependencies
npm uninstall @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-tabs
```

#### 7.2 Update TypeScript Types

```tsx
// src/types/gallery.ts
export interface GalleryProject {
  id: string;
  title: string;
  description: string;
  eventType?: string;
  location?: string;
  eventDate: string;
  featured: boolean;
  media: GalleryMedia[];
}

export interface GalleryMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  featured?: boolean;
  description?: Record<string, string>;
}
```

#### 7.3 Update Build Configuration

```json
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-image-domain.com'],
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
};
```

## Migration Checklist

- [ ] Install all required shadcn components
- [ ] Create new GalleryContent component
- [ ] Create new ContactWidget component
- [ ] Update gallery page to use new components
- [ ] Remove all custom components
- [ ] Update index files
- [ ] Create new test files
- [ ] Add loading states and error boundaries
- [ ] Implement accessibility improvements
- [ ] Update TypeScript types
- [ ] Test all functionality
- [ ] Update documentation
- [ ] Deploy and verify

## Benefits of Migration

1. **Consistency**: All components follow shadcn design system
2. **Maintainability**: Standardized component library
3. **Performance**: Optimized shadcn components
4. **Accessibility**: Built-in accessibility features
5. **Type Safety**: Better TypeScript integration
6. **Documentation**: Comprehensive shadcn documentation
7. **Community**: Active shadcn community support

## Rollback Plan

If issues arise during migration:

1. Keep original components in a backup branch
2. Implement changes incrementally
3. Test thoroughly at each step
4. Maintain feature parity throughout migration
5. Document any breaking changes

## Timeline

- **Phase 1-2**: 2-3 days (Component creation)
- **Phase 3**: 1 day (Cleanup)
- **Phase 4**: 1-2 days (Testing)
- **Phase 5-6**: 1 day (Optimization)
- **Phase 7**: 1 day (Finalization)

**Total Estimated Time**: 6-8 days
