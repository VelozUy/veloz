import { BaseFirebaseService } from './base-firebase-service';
import {
  aboutContentSchema,
  AboutContentData,
  AboutPhilosophyPointData,
  AboutMethodologyStepData,
  AboutValueData,
} from '@/lib/validation-schemas';
import type { ApiResponse } from '@/types';

export class AboutContentService extends BaseFirebaseService {
  constructor() {
    super('aboutContent', {
      validationSchema: aboutContentSchema,
      cacheConfig: {
        enabled: true,
        ttl: 10 * 60 * 1000, // 10 minutes for about content
        maxSize: 50,
      },
    });
  }

  /**
   * Get about content with fallback to default if not found
   */
  async getAboutContent(): Promise<ApiResponse<AboutContentData | null>> {
    try {
      const response = await this.getAll<AboutContentData>({ useCache: true });

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
      const existingResponse = await this.getAll<AboutContentData>();

      if (
        existingResponse.success &&
        existingResponse.data &&
        existingResponse.data.length > 0
      ) {
        // Update existing content
        const existingContent = existingResponse.data[0];
        const updateResponse = await this.update<AboutContentData>(
          existingContent.id!,
          data as Partial<Omit<AboutContentData, 'id' | 'createdAt'>>
        );

        if (updateResponse.success) {
          // Invalidate cache and return updated content
          this.invalidateCache();
          const updatedResponse = await this.getById<AboutContentData>(
            existingContent.id!
          );
          if (updatedResponse.success && updatedResponse.data) {
            return { success: true, data: updatedResponse.data };
          }
        }

        return {
          success: false,
          error: 'Failed to update about content',
        };
      } else {
        // Create new content
        const createResponse = await this.create<AboutContentData>(data);

        if (createResponse.success && createResponse.data) {
          // Invalidate cache and return new content
          this.invalidateCache();
          const newResponse = await this.getById<AboutContentData>(
            createResponse.data
          );
          if (newResponse.success && newResponse.data) {
            return { success: true, data: newResponse.data };
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
    section: 'philosophy' | 'methodology' | 'values',
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

      const updateResponse = await this.update<AboutContentData>(
        existingResponse.data.id!,
        updateData as Partial<Omit<AboutContentData, 'id' | 'createdAt'>>
      );

      if (updateResponse.success) {
        this.invalidateCache();
      }

      return updateResponse;
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
    title: AboutContentData['title'],
    subtitle: AboutContentData['subtitle']
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const updateResponse = await this.update<AboutContentData>(
        existingResponse.data.id!,
        { title, subtitle } as Partial<
          Omit<AboutContentData, 'id' | 'createdAt'>
        >
      );

      if (updateResponse.success) {
        this.invalidateCache();
      }

      return updateResponse;
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
    seoTitle?: AboutContentData['seoTitle'],
    seoDescription?: AboutContentData['seoDescription']
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
      if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
      if (seoDescription !== undefined)
        updateData.seoDescription = seoDescription;

      const updateResponse = await this.update<AboutContentData>(
        existingResponse.data.id!,
        updateData
      );

      if (updateResponse.success) {
        this.invalidateCache();
      }

      return updateResponse;
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

  /**
   * Add a new value to the values section
   */
  async addValue(
    newValue: Omit<AboutValueData, 'order'>
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentValues = existingResponse.data.values.items || [];
      const maxOrder = Math.max(...currentValues.map(v => v.order), -1);

      const valueWithOrder: AboutValueData = {
        ...newValue,
        order: maxOrder + 1,
      };

      const updatedValues = {
        ...existingResponse.data.values,
        items: [...currentValues, valueWithOrder],
      };

      const updateResponse = await this.updateSection('values', updatedValues);
      return updateResponse;
    } catch (error) {
      console.error('Error adding value:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing value
   */
  async updateValue(
    id: string,
    updatedValue: Partial<Omit<AboutValueData, 'id'>>
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentValues = existingResponse.data.values.items || [];
      const valueIndex = currentValues.findIndex(v => v.id === id);

      if (valueIndex === -1) {
        return {
          success: false,
          error: 'Value not found.',
        };
      }

      const updatedValues = {
        ...existingResponse.data.values,
        items: currentValues.map((value, index) =>
          index === valueIndex ? { ...value, ...updatedValue } : value
        ),
      };

      const updateResponse = await this.updateSection('values', updatedValues);
      return updateResponse;
    } catch (error) {
      console.error('Error updating value:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a value
   */
  async deleteValue(id: string): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentValues = existingResponse.data.values.items || [];
      const filteredValues = currentValues.filter(v => v.id !== id);

      if (filteredValues.length === currentValues.length) {
        return {
          success: false,
          error: 'Value not found.',
        };
      }

      const updatedValues = {
        ...existingResponse.data.values,
        items: filteredValues,
      };

      const updateResponse = await this.updateSection('values', updatedValues);
      return updateResponse;
    } catch (error) {
      console.error('Error deleting value:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reorder values
   */
  async reorderValues(valueIds: string[]): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentValues = existingResponse.data.values.items || [];

      // Create a map for quick lookup
      const valueMap = new Map(currentValues.map(v => [v.id, v]));

      // Reorder values and update order numbers
      const reorderedValues = valueIds
        .map(id => valueMap.get(id))
        .filter((value): value is AboutValueData => value !== undefined)
        .map((value, index) => ({ ...value, order: index }));

      const updatedValues = {
        ...existingResponse.data.values,
        items: reorderedValues,
      };

      const updateResponse = await this.updateSection('values', updatedValues);
      return updateResponse;
    } catch (error) {
      console.error('Error reordering values:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // === Philosophy Points Management ===

  /**
   * Add a new philosophy point
   */
  async addPhilosophyPoint(
    newPoint: Omit<AboutPhilosophyPointData, 'order'>
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentPoints = existingResponse.data.philosophy.items || [];
      const maxOrder = Math.max(...currentPoints.map(p => p.order), -1);

      const pointWithOrder: AboutPhilosophyPointData = {
        ...newPoint,
        order: maxOrder + 1,
      };

      const updatedPhilosophy = {
        ...existingResponse.data.philosophy,
        items: [...currentPoints, pointWithOrder],
      };

      const updateResponse = await this.updateSection(
        'philosophy',
        updatedPhilosophy
      );
      return updateResponse;
    } catch (error) {
      console.error('Error adding philosophy point:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing philosophy point
   */
  async updatePhilosophyPoint(
    id: string,
    updatedPoint: Partial<Omit<AboutPhilosophyPointData, 'id'>>
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentPoints = existingResponse.data.philosophy.items || [];
      const pointIndex = currentPoints.findIndex(p => p.id === id);

      if (pointIndex === -1) {
        return {
          success: false,
          error: 'Philosophy point not found.',
        };
      }

      const updatedPhilosophy = {
        ...existingResponse.data.philosophy,
        items: currentPoints.map((point, index) =>
          index === pointIndex ? { ...point, ...updatedPoint } : point
        ),
      };

      const updateResponse = await this.updateSection(
        'philosophy',
        updatedPhilosophy
      );
      return updateResponse;
    } catch (error) {
      console.error('Error updating philosophy point:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a philosophy point
   */
  async deletePhilosophyPoint(id: string): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentPoints = existingResponse.data.philosophy.items || [];
      const filteredPoints = currentPoints.filter(p => p.id !== id);

      if (filteredPoints.length === currentPoints.length) {
        return {
          success: false,
          error: 'Philosophy point not found.',
        };
      }

      const updatedPhilosophy = {
        ...existingResponse.data.philosophy,
        items: filteredPoints,
      };

      const updateResponse = await this.updateSection(
        'philosophy',
        updatedPhilosophy
      );
      return updateResponse;
    } catch (error) {
      console.error('Error deleting philosophy point:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reorder philosophy points
   */
  async reorderPhilosophyPoints(
    pointIds: string[]
  ): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getAboutContent();

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: 'About content not found. Please create content first.',
        };
      }

      const currentPoints = existingResponse.data.philosophy.items || [];

      // Create a map for quick lookup
      const pointMap = new Map(currentPoints.map(p => [p.id, p]));

      // Reorder points and update order numbers
      const reorderedPoints = pointIds
        .map(id => pointMap.get(id))
        .filter(
          (point): point is AboutPhilosophyPointData => point !== undefined
        )
        .map((point, index) => ({ ...point, order: index }));

      const updatedPhilosophy = {
        ...existingResponse.data.philosophy,
        items: reorderedPoints,
      };

      const updateResponse = await this.updateSection(
        'philosophy',
        updatedPhilosophy
      );
      return updateResponse;
    } catch (error) {
      console.error('Error reordering philosophy points:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

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

      const currentSteps = existingResponse.data.methodology.items || [];
      const maxOrder = Math.max(...currentSteps.map(s => s.order), -1);

      const stepWithOrder: AboutMethodologyStepData = {
        ...newStep,
        order: maxOrder + 1,
      };

      const updatedMethodology = {
        ...existingResponse.data.methodology,
        items: [...currentSteps, stepWithOrder],
      };

      const updateResponse = await this.updateSection(
        'methodology',
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

      const currentSteps = existingResponse.data.methodology.items || [];
      const stepIndex = currentSteps.findIndex(s => s.id === id);

      if (stepIndex === -1) {
        return {
          success: false,
          error: 'Methodology step not found.',
        };
      }

      const updatedMethodology = {
        ...existingResponse.data.methodology,
        items: currentSteps.map((step, index) =>
          index === stepIndex ? { ...step, ...updatedStep } : step
        ),
      };

      const updateResponse = await this.updateSection(
        'methodology',
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

      const currentSteps = existingResponse.data.methodology.items || [];
      const filteredSteps = currentSteps.filter(s => s.id !== id);

      if (filteredSteps.length === currentSteps.length) {
        return {
          success: false,
          error: 'Methodology step not found.',
        };
      }

      const updatedMethodology = {
        ...existingResponse.data.methodology,
        items: filteredSteps,
      };

      const updateResponse = await this.updateSection(
        'methodology',
        updatedMethodology
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

      const currentSteps = existingResponse.data.methodology.items || [];

      // Create a map for quick lookup
      const stepMap = new Map(currentSteps.map(s => [s.id, s]));

      // Reorder steps and update order numbers
      const reorderedSteps = stepIds
        .map(id => stepMap.get(id))
        .filter((step): step is AboutMethodologyStepData => step !== undefined)
        .map((step, index) => ({ ...step, order: index }));

      const updatedMethodology = {
        ...existingResponse.data.methodology,
        items: reorderedSteps,
      };

      const updateResponse = await this.updateSection(
        'methodology',
        updatedMethodology
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
      title: {
        es: 'Sobre Nosotros',
        en: 'About Us',
        pt: 'Sobre Nós',
      },
      subtitle: {
        es: 'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.',
        en: 'We are a passionate team dedicated to capturing the most important moments of your life with excellence, warmth and agility.',
        pt: 'Somos uma equipe apaixonada dedicada a capturar os momentos mais importantes da sua vida com excelência, carinho e agilidade.',
      },
      philosophy: {
        title: {
          es: 'Nuestra Filosofía',
          en: 'Our Philosophy',
          pt: 'Nossa Filosofia',
        },
        items: [
          {
            id: 'unique-events',
            title: {
              es: 'Eventos Únicos',
              en: 'Unique Events',
              pt: 'Eventos Únicos',
            },
            description: {
              es: 'Creemos que cada evento es único y merece ser documentado con la máxima dedicación.',
              en: 'We believe that every event is unique and deserves to be documented with maximum dedication.',
              pt: 'Acreditamos que cada evento é único e merece ser documentado com máxima dedicação.',
            },
            order: 0,
          },
          {
            id: 'storytelling',
            title: {
              es: 'Narración Visual',
              en: 'Visual Storytelling',
              pt: 'Narrativa Visual',
            },
            description: {
              es: 'Nuestro enfoque no es solo capturar imágenes, sino contar historias que perduren en el tiempo.',
              en: 'Our approach is not just to capture images, but to tell stories that endure over time.',
              pt: 'Nossa abordagem não é apenas capturar imagens, mas contar histórias que perduram no tempo.',
            },
            order: 1,
          },
        ],
      },
      methodology: {
        title: {
          es: 'Nuestra Metodología',
          en: 'Our Methodology',
          pt: 'Nossa Metodologia',
        },
        items: [
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
          },
        ],
      },
      values: {
        title: {
          es: 'Nuestros Valores',
          en: 'Our Values',
          pt: 'Nossos Valores',
        },
        items: [
          {
            id: 'passion',
            title: {
              es: 'Pasión',
              en: 'Passion',
              pt: 'Paixão',
            },
            description: {
              es: 'Amamos lo que hacemos y se refleja en cada imagen que capturamos.',
              en: 'We love what we do and it shows in every image we capture.',
              pt: 'Amamos o que fazemos e isso se reflete em cada imagem que capturamos.',
            },
            order: 0,
          },
          {
            id: 'teamwork',
            title: {
              es: 'Trabajo en Equipo',
              en: 'Teamwork',
              pt: 'Trabalho em Equipe',
            },
            description: {
              es: 'Nuestro modelo colaborativo nos permite cubrir cada momento importante.',
              en: 'Our collaborative model allows us to cover every important moment.',
              pt: 'Nosso modelo colaborativo nos permite cobrir cada momento importante.',
            },
            order: 1,
          },
          {
            id: 'quality',
            title: {
              es: 'Calidad Técnica',
              en: 'Technical Quality',
              pt: 'Qualidade Técnica',
            },
            description: {
              es: 'Utilizamos equipos profesionales y técnicas avanzadas para resultados excepcionales.',
              en: 'We use professional equipment and advanced techniques for exceptional results.',
              pt: 'Utilizamos equipamentos profissionais e técnicas avançadas para resultados excepcionais.',
            },
            order: 2,
          },
          {
            id: 'agility',
            title: {
              es: 'Agilidad',
              en: 'Agility',
              pt: 'Agilidade',
            },
            description: {
              es: 'Nos adaptamos rápidamente a cualquier situación para no perder ningún momento.',
              en: 'We adapt quickly to any situation to never miss a moment.',
              pt: 'Nos adaptamos rapidamente a qualquer situação para não perder nenhum momento.',
            },
            order: 3,
          },
          {
            id: 'excellence',
            title: {
              es: 'Excelencia',
              en: 'Excellence',
              pt: 'Excelência',
            },
            description: {
              es: 'Buscamos la perfección en cada proyecto, superando las expectativas.',
              en: 'We strive for perfection in every project, exceeding expectations.',
              pt: 'Buscamos a perfeição em cada projeto, superando expectativas.',
            },
            order: 4,
          },
          {
            id: 'trust',
            title: {
              es: 'Confianza',
              en: 'Trust',
              pt: 'Confiança',
            },
            description: {
              es: 'Construimos relaciones duraderas basadas en la transparencia y profesionalismo.',
              en: 'We build lasting relationships based on transparency and professionalism.',
              pt: 'Construímos relacionamentos duradouros baseados na transparência e profissionalismo.',
            },
            order: 5,
          },
        ],
      },
      faq: {
        title: {
          es: 'Preguntas Frecuentes',
          en: 'Frequently Asked Questions',
          pt: 'Perguntas Frequentes',
        },
      },
    };
  }
}

// Export singleton instance
export const aboutContentService = new AboutContentService();
