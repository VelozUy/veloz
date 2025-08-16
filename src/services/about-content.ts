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
        const rawData = response.data[0];

        // Apply validation transformation to ensure proper data structure
        const validationResult = aboutContentSchema.safeParse(rawData);
        if (validationResult.success) {
          return { success: true, data: validationResult.data };
        } else {
          return { success: true, data: rawData };
        }
      }

      // Return null if no content exists - admin needs to create it
      return { success: true, data: null };
    } catch (error) {
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
      // Validate the data first
      const validationResult = aboutContentSchema.safeParse(data);
      if (!validationResult.success) {
        return {
          success: false,
          error: `Validation failed: ${validationResult.error.message}`,
        };
      }

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

            // Use the same method as getAboutContent to ensure consistency
            const updatedResponse = await this.getAboutContent();
            if (updatedResponse.success && updatedResponse.data) {
              return { success: true, data: updatedResponse.data };
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

          // Use the same method as getAboutContent to ensure consistency
          const newResponse = await this.getAboutContent();
          if (newResponse.success && newResponse.data) {
            return { success: true, data: newResponse.data };
          } else {
            return {
              success: false,
              error: 'Failed to fetch about content after create',
            };
          }
        }

        return {
          success: false,
          error: 'Failed to create about content',
        };
      }
    } catch (error) {
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
      philosophyItems: [
        {
          id: 'quality',
          title: {
            es: 'Calidad',
            en: 'Quality',
            pt: 'Qualidade',
          },
          description: {
            es: 'Porque cada persona que nos elige merece lo mejor, desde el primer clic hasta la entrega final.',
            en: 'Because every person who chooses us deserves the best, from the first click to the final delivery.',
            pt: 'Porque cada pessoa que nos escolhe merece o melhor, desde o primeiro clique até a entrega final.',
          },
          order: 0,
        },
        {
          id: 'sensitivity',
          title: {
            es: 'Sensibilidad',
            en: 'Sensitivity',
            pt: 'Sensibilidade',
          },
          description: {
            es: 'Porque en cada evento hay historias reales, personas que sienten, viven y confían en que sepamos capturar eso irrepetible.',
            en: 'Because in every event there are real stories, people who feel, live and trust that we know how to capture that irreplaceable moment.',
            pt: 'Porque em cada evento há histórias reais, pessoas que sentem, vivem e confiam que sabemos capturar esse momento irrepetível.',
          },
          order: 1,
        },
        {
          id: 'speed',
          title: {
            es: 'Velocidad',
            en: 'Speed',
            pt: 'Velocidade',
          },
          description: {
            es: 'Porque entendemos que el tiempo importa y las historias no esperan. Respondemos con agilidad y con la responsabilidad de estar cuando se nos necesita.',
            en: "Because we understand that time matters and stories don't wait. We respond with agility and with the responsibility of being there when we are needed.",
            pt: 'Porque entendemos que o tempo importa e as histórias não esperam. Respondemos com agilidade e com a responsabilidade de estar lá quando somos necessários.',
          },
          order: 2,
        },
      ],
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
