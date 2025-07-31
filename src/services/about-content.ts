import { BaseFirebaseService } from './base-firebase-service';
import {
  aboutContentSchema,
  AboutContentData,
  AboutMethodologyStepData,
} from '@/lib/validation-schemas';
import type { ApiResponse } from '@/types';

export class AboutContentService extends BaseFirebaseService<AboutContentData> {
  validationSchema = aboutContentSchema;
  constructor() {
    super('aboutContent');
    this.cacheConfig = {
      enabled: true,
      ttl: 10 * 60 * 1000, // 10 minutes for about content
      maxSize: 50,
    };
  }

  /**
   * Get about content with fallback to default if not found
   */
  async getAboutContent(): Promise<ApiResponse<AboutContentData | null>> {
    try {
      const response: ApiResponse<AboutContentData[]> = await this.getAll();

      if (response.success && response.data && response.data.length > 0) {
        return { success: true, data: response.data[0] };
      }

      // Return null if no content exists - admin needs to create it
      return { success: true, data: null };
    } catch (error) {
      console.error('Error fetching about content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create or update about content (upsert operation since there should only be one)
   */
  async upsertAboutContent(
    data: Omit<AboutContentData, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<AboutContentData>> {
    try {
      // Check if content already exists
      const existingResponse = await this.getAll();

      if (
        existingResponse.success &&
        existingResponse.data &&
        existingResponse.data.length > 0
      ) {
        // Update existing content
        const existingContent = existingResponse.data[0];
        if (
          existingContent &&
          typeof existingContent === 'object' &&
          'id' in existingContent &&
          typeof existingContent.id === 'string'
        ) {
          const updateResponse = await this.update(
            existingContent.id,
            data as Partial<Omit<AboutContentData, 'id' | 'createdAt'>>
          );

          if (updateResponse.success) {
            // Invalidate cache and return updated content
            this.invalidateCache();
            const updatedResponse = await this.getById(existingContent.id);
            if (updatedResponse.success && updatedResponse.data) {
              const parsed = aboutContentSchema.safeParse(updatedResponse.data);
              if (parsed.success) {
                return { success: true, data: parsed.data };
              } else {
                return {
                  success: false,
                  error: 'Fetched about content after update is invalid',
                };
              }
            } else {
              return {
                success: false,
                error: 'Failed to fetch about content after update',
              };
            }
          }
        }
        return {
          success: false,
          error: 'Failed to update about content',
        };
      } else {
        // Create new content
        const createResponse = await this.create(
          data as Omit<AboutContentData, 'id'>
        );

        if (
          createResponse.success &&
          createResponse.data &&
          typeof createResponse.data === 'object' &&
          'id' in createResponse.data &&
          typeof (createResponse.data as AboutContentData).id === 'string'
        ) {
          // Invalidate cache and return new content
          this.invalidateCache();
          const newId = (createResponse.data as AboutContentData).id;
          if (typeof newId === 'string') {
            const newResponse = await this.getById(newId);
            if (newResponse.success && newResponse.data) {
              const parsed = aboutContentSchema.safeParse(newResponse.data);
              if (parsed.success) {
                return { success: true, data: parsed.data };
              } else {
                return {
                  success: false,
                  error: 'Fetched about content after create is invalid',
                };
              }
            } else {
              return {
                success: false,
                error: 'Failed to fetch about content after create',
              };
            }
          }
        }

        return {
          success: false,
          error: 'Failed to create about content',
        };
      }
    } catch (error) {
      console.error('Error upserting about content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update specific section of about content
   */
  async updateSection(
    section: 'methodologySteps',
    sectionData: Partial<AboutContentData[typeof section]>
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const updateData = {
        [section]: {
          ...existingResponse.data[section],
          ...sectionData,
        },
      };

      const updateResponse = await this.update(
        existingResponse.data.id!,
        updateData as Partial<Omit<AboutContentData, 'id' | 'createdAt'>>
      );

      if (updateResponse.success) {
        this.invalidateCache();
        return { success: true };
      } else {
        return {
          success: false,
          error: updateResponse.error || 'Failed to update section',
        };
      }
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update main content (title and subtitle)
   */
  async updateMainContent(
    title: AboutContentData['heroTitle'],
    subtitle: AboutContentData['heroSubtitle']
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const updateResponse = await this.update(existingResponse.data.id!, {
        title,
        subtitle,
      } as Partial<Omit<AboutContentData, 'id' | 'createdAt'>>);

      if (updateResponse.success) {
        this.invalidateCache();
        return { success: true };
      } else {
        return {
          success: false,
          error: updateResponse.error || 'Failed to update main content',
        };
      }
    } catch (error) {
      console.error('Error updating main content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update SEO content
   */
  async updateSEOContent(
    seoTitle?: string,
    seoDescription?: string
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const updateData: Partial<Omit<AboutContentData, 'id' | 'createdAt'>> =
        {};
      if (seoTitle !== undefined || seoDescription !== undefined) {
        updateData.seo = {
          keywords: existingResponse.data.seo?.keywords || [],
          ...(seoTitle !== undefined && { title: seoTitle }),
          ...(seoDescription !== undefined && { description: seoDescription }),
        };
      }

      const updateResponse = await this.update(
        existingResponse.data.id!,
        updateData
      );

      if (updateResponse.success) {
        this.invalidateCache();
        return { success: true };
      } else {
        return {
          success: false,
          error: updateResponse.error || 'Failed to update SEO content',
        };
      }
    } catch (error) {
      console.error('Error updating SEO content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if about content exists
   */
  async hasContent(): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getAboutContent();
      return {
        success: true,
        data: response.success && response.data !== null,
      };
    } catch (error) {
      console.error('Error checking if about content exists:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // === Philosophy Points Management ===

  // === Methodology Steps Management ===

  /**
   * Add a new methodology step
   */
  async addMethodologyStep(
    newStep: Omit<AboutMethodologyStepData, 'order'>
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentSteps = existingResponse.data.methodologySteps || [];
      const maxOrder = Math.max(
        ...currentSteps.map((s: AboutMethodologyStepData) => s.order || 0),
        -1
      );

      const stepWithOrder: AboutMethodologyStepData = {
        ...newStep,
        order: maxOrder + 1,
      };

      const updatedMethodology = [...currentSteps, stepWithOrder];

      const updateResponse = await this.updateSection(
        'methodologySteps',
        updatedMethodology
      );
      return updateResponse;
    } catch (error) {
      console.error('Error adding methodology step:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing methodology step
   */
  async updateMethodologyStep(
    id: string,
    updatedStep: Partial<Omit<AboutMethodologyStepData, 'id'>>
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentSteps = existingResponse.data.methodologySteps || [];
      const stepIndex = currentSteps.findIndex(
        (s: AboutMethodologyStepData) => s.id === id
      );

      if (stepIndex === -1) {
        return {
          success: false,
          error: 'Methodology step not found.',
        };
      }

      const updatedMethodology = currentSteps.map(
        (step: AboutMethodologyStepData, index: number) =>
          index === stepIndex ? { ...step, ...updatedStep } : step
      );

      const updateResponse = await this.updateSection(
        'methodologySteps',
        updatedMethodology
      );
      return updateResponse;
    } catch (error) {
      console.error('Error updating methodology step:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a methodology step
   */
  async deleteMethodologyStep(id: string): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentSteps = existingResponse.data.methodologySteps || [];
      const filteredSteps = currentSteps.filter(
        (s: AboutMethodologyStepData) => s.id !== id
      );

      if (filteredSteps.length === currentSteps.length) {
        return {
          success: false,
          error: 'Methodology step not found.',
        };
      }

      const updateResponse = await this.updateSection(
        'methodologySteps',
        filteredSteps
      );
      return updateResponse;
    } catch (error) {
      console.error('Error deleting methodology step:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reorder methodology steps
   */
  async reorderMethodologySteps(stepIds: string[]): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentSteps = existingResponse.data.methodologySteps || [];

      // Create a map for quick lookup
      const stepMap = new Map(
        currentSteps.map((s: AboutMethodologyStepData) => [s.id, s])
      );

      // Reorder steps and update order numbers
      const reorderedSteps = stepIds
        .map(id => stepMap.get(id))
        .filter((step): step is AboutMethodologyStepData => step !== undefined)
        .map((step: AboutMethodologyStepData, index: number) => ({
          ...step,
          order: index,
        }));

      const updateResponse = await this.updateSection(
        'methodologySteps',
        reorderedSteps
      );
      return updateResponse;
    } catch (error) {
      console.error('Error reordering methodology steps:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get default about content structure for initialization
   */
  getDefaultAboutContent(): Omit<
    AboutContentData,
    'id' | 'createdAt' | 'updatedAt'
  > {
    return {
      heroTitle: { es: 'Veloz', en: 'Veloz', pt: 'Veloz' },
      heroSubtitle: { es: '', en: '', pt: '' },
      heroDescription: { es: '', en: '', pt: '' },
      heroImage: '',
      storyTitle: { es: '', en: '', pt: '' },
      storyContent: { es: '', en: '', pt: '' },
      storyImage: '',
      philosophyTitle: {
        es: 'Nuestra Filosofía',
        en: 'Our Philosophy',
        pt: 'Nossa Filosofia',
      },
      philosophyContent: {
        es: `# Nuestra Filosofía

En **Veloz**, creemos que cada momento es único e irrepetible. Nuestra filosofía se basa en tres pilares fundamentales:

## Eventos Únicos
Cada evento tiene su propia historia, su propia energía y sus propios momentos especiales. Nos dedicamos a capturar la esencia única de cada celebración.

## Narración Visual
No solo tomamos fotografías; contamos historias. Cada imagen es una página en el libro de tu evento, diseñada para transportarte de vuelta a esos momentos especiales.

## Excelencia en el Detalle
Nos enfocamos en los pequeños detalles que hacen grande tu evento. Desde la decoración hasta las expresiones de alegría, todo merece ser inmortalizado.`,
        en: `# Our Philosophy

At **Veloz**, we believe that every moment is unique and irreplaceable. Our philosophy is based on three fundamental pillars:

## Unique Events
Every event has its own story, its own energy, and its own special moments. We dedicate ourselves to capturing the unique essence of each celebration.

## Visual Storytelling
We don't just take photographs; we tell stories. Each image is a page in the book of your event, designed to transport you back to those special moments.

## Excellence in Detail
We focus on the small details that make your event great. From decoration to expressions of joy, everything deserves to be immortalized.`,
        pt: `# Nossa Filosofia

Na **Veloz**, acreditamos que cada momento é único e irrepetível. Nossa filosofia é baseada em três pilares fundamentais:

## Eventos Únicos
Cada evento tem sua própria história, sua própria energia e seus próprios momentos especiais. Nos dedicamos a capturar a essência única de cada celebração.

## Narrativa Visual
Não apenas tiramos fotografias; contamos histórias. Cada imagem é uma página no livro do seu evento, projetada para transportá-lo de volta a esses momentos especiais.

## Excelência no Detalhe
Nos concentramos nos pequenos detalhes que tornam seu evento grandioso. Da decoração às expressões de alegria, tudo merece ser imortalizado.`,
      },
      methodologyTitle: { es: '', en: '', pt: '' },
      methodologyDescription: { es: '', en: '', pt: '' },
      methodologySteps: [
        {
          id: 'planning',
          title: {
            es: 'Planificación',
            en: 'Planning',
            pt: 'Planejamento',
          },
          description: {
            es: 'Estudiamos cada detalle del evento para anticipar los momentos clave.',
            en: 'We study every detail of the event to anticipate key moments.',
            pt: 'Estudamos cada detalhe do evento para antecipar os momentos-chave.',
          },
          order: 0,
          stepNumber: 0,
        },
        {
          id: 'coverage',
          title: {
            es: 'Cobertura Integral',
            en: 'Comprehensive Coverage',
            pt: 'Cobertura Integral',
          },
          description: {
            es: 'Nuestro equipo se distribuye estratégicamente para no perder ningún momento.',
            en: 'Our team is strategically distributed to not miss any moment.',
            pt: 'Nossa equipe se distribui estrategicamente para não perder nenhum momento.',
          },
          order: 1,
          stepNumber: 1,
        },
        {
          id: 'capture',
          title: {
            es: 'Captura Profesional',
            en: 'Professional Capture',
            pt: 'Captura Profissional',
          },
          description: {
            es: 'Utilizamos técnicas avanzadas y equipos de última generación.',
            en: 'We use advanced techniques and state-of-the-art equipment.',
            pt: 'Utilizamos técnicas avançadas e equipamentos de última geração.',
          },
          order: 2,
          stepNumber: 2,
        },
        {
          id: 'postproduction',
          title: {
            es: 'Post-Producción',
            en: 'Post-Production',
            pt: 'Pós-Produção',
          },
          description: {
            es: 'Editamos cuidadosamente cada imagen y video para lograr resultados excepcionales.',
            en: 'We carefully edit every image and video to achieve exceptional results.',
            pt: 'Editamos cuidadosamente cada imagem e vídeo para alcançar resultados excepcionais.',
          },
          order: 3,
          stepNumber: 3,
        },
      ],
      teamTitle: { es: '', en: '', pt: '' },
      teamDescription: { es: '', en: '', pt: '' },
      ctaTitle: { es: '', en: '', pt: '' },
      ctaDescription: { es: '', en: '', pt: '' },
      ctaButtonText: { es: '', en: '', pt: '' },
      ctaButtonUrl: '',
      seo: { title: '', description: '', keywords: [] },
      lastModifiedBy: '',
    };
  }
}

// Export singleton instance
export const aboutContentService = new AboutContentService();
