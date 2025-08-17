'use client';

import { useState } from 'react';
import { getStaticContent } from '@/lib/utils';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import GallerySearch from '@/components/search/GallerySearch';
import OptimizedContactForm from '@/components/forms/OptimizedContactForm';
import { getBackgroundClasses } from '@/lib/background-utils';
import { cn } from '@/lib/utils';

export default function UXEnhancementsDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  // Get static content for proper translations
  const content = getStaticContent('es');
  const heroClasses = getBackgroundClasses('hero');
  const sectionClasses = getBackgroundClasses('content');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  // Cast translations to expected type for OptimizedContactForm
  const translations = content.translations as {
    contact: {
      title: string;
      subtitle: string;
      form: {
        title: string;
        name: { label: string; placeholder: string };
        email: { label: string; placeholder: string };
        phone: { label: string; placeholder: string; optional: string };
        eventType: {
          label: string;
          placeholder: string;
          options: {
            corporate: string;
            product: string;
            birthday: string;
            wedding: string;
            concert: string;
            exhibition: string;
            other: string;
          };
        };
        eventDate: { label: string; optional: string; help: string };
        location: { label: string; placeholder: string };
        attendees: {
          label: string;
          placeholder: string;
          options: {
            '0-20': string;
            '21-50': string;
            '51-100': string;
            '100+': string;
          };
        };
        services: {
          label: string;
          placeholder: string;
          options: {
            photography: string;
            video: string;
            drone: string;
            studio: string;
            other: string;
          };
        };
        contactMethod: {
          label: string;
          placeholder: string;
          options: {
            whatsapp: string;
            email: string;
            call: string;
          };
        };
        company: { label: string; placeholder: string; optional: string };
        message: { label: string; optional: string; placeholder: string };
        submit: { button: string; loading: string };
        privacy: { line1: string; line2: string };
        progress: { step1: string; step2: string; step3: string };
      };
      success: { title: string; message: string; action: string };
      trust: {
        response: { title: string; description: string };
        commitment: { title: string; description: string };
      };
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Theme */}
      <section
        className={cn(
          'py-16 md:py-24 px-4 sm:px-8 lg:px-16',
          heroClasses.background
        )}
      >
        <div className="max-w-border-64 mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-title font-bold uppercase tracking-wide leading-tight text-foreground">
              UX Enhancements Demo
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-muted-foreground">
              Showcasing new navigation and user experience components with
              proper theme implementation
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb Section */}
      <section className="py-8 px-4 sm:px-8 lg:px-16 border-b border-border">
        <div className="max-w-border-64 mx-auto">
          <Breadcrumb
            items={[
              { name: 'Debug', href: '/debug' },
              {
                name: 'UX Enhancements Demo',
                href: '/debug/ux-enhancements-demo',
                current: true,
              },
            ]}
          />
        </div>
      </section>

      {/* Search Section with Theme */}
      <section
        className={cn(
          'py-16 md:py-24 px-4 sm:px-8 lg:px-16',
          sectionClasses.background
        )}
      >
        <div className="max-w-border-64 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-subtitle font-bold mb-6 text-foreground uppercase tracking-wide">
              Gallery Search Component
            </h2>
            <div className="w-32 h-1 bg-primary rounded-full mx-auto"></div>
          </div>

          <div className="max-w-md mx-auto">
            <GallerySearch
              onSearch={handleSearch}
              placeholder="Search gallery items..."
            />
            {searchQuery && (
              <p className="mt-4 text-muted-foreground text-center">
                Search query:{' '}
                <span className="font-medium text-foreground">
                  {searchQuery}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Optimized Contact Form Section */}
      <section
        className={cn(
          'py-16 md:py-24 px-4 sm:px-8 lg:px-16',
          sectionClasses.background
        )}
      >
        <div className="max-w-border-64 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-subtitle font-bold mb-6 text-foreground uppercase tracking-wide">
              Optimized Contact Form
            </h2>
            <div className="w-32 h-1 bg-primary rounded-full mx-auto mb-8"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Multi-step form with progress indicators and conversion-focused UX
            </p>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {showContactForm ? 'Hide Contact Form' : 'Show Contact Form'}
            </button>
          </div>

          {showContactForm && (
            <div className="mt-12">
              <OptimizedContactForm translations={translations} locale="es" />
            </div>
          )}
        </div>
      </section>

      {/* Content Sections for Scroll Testing with Theme */}
      <div className="px-4 sm:px-8 lg:px-16 space-y-16">
        {Array.from({ length: 10 }, (_, i) => (
          <section
            key={i}
            className={cn(
              'py-16 md:py-24',
              i % 2 === 0 ? sectionClasses.background : 'bg-background'
            )}
          >
            <div className="max-w-border-64 mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-subtitle font-bold mb-4 text-foreground uppercase tracking-wide">
                  Section {i + 1} - Scroll Testing
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  This section contains sample content to demonstrate scroll
                  behavior and navigation functionality.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, j) => (
                  <div
                    key={j}
                    className={cn(
                      'p-6 rounded-lg border transition-all duration-300 hover:shadow-lg',
                      'bg-card text-card-foreground border-border',
                      'hover:border-primary/20'
                    )}
                  >
                    <h4 className="font-subtitle font-semibold mb-3 text-foreground">
                      Item {j + 1}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sample content for demonstration purposes. This card shows
                      how the theme colors and typography work together to
                      create a cohesive design.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
