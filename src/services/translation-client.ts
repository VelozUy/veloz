/**
 * Client-side Translation Service
 * Calls API routes instead of OpenAI directly for security
 */

export interface TranslationRequest {
  text: string;
  fromLanguage: 'es' | 'en' | 'pt';
  toLanguage: 'es' | 'en' | 'pt';
  context?: string;
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
  originalText: string;
  fromLanguage: string;
  toLanguage: string;
  tokensUsed: number;
}

export interface BatchTranslationRequest {
  texts: string[];
  fromLanguage: 'es' | 'en' | 'pt';
  toLanguage: 'es' | 'en' | 'pt';
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Client-side translation service that calls API routes
 */
export class TranslationClientService {
  private static instance: TranslationClientService;

  public static getInstance(): TranslationClientService {
    if (!TranslationClientService.instance) {
      TranslationClientService.instance = new TranslationClientService();
    }
    return TranslationClientService.instance;
  }

  /**
   * Translate a single text
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: ApiResponse<TranslationResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Translation failed');
      }

      return result.data!;
    } catch (error) {
      console.error('Translation API call failed:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async batchTranslate(request: BatchTranslationRequest): Promise<TranslationResponse[]> {
    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: ApiResponse<TranslationResponse[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Batch translation failed');
      }

      return result.data!;
    } catch (error) {
      console.error('Batch translation API call failed:', error);
      throw new Error(`Batch translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if translation service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('/api/translate', {
        method: 'GET',
      });
      
      // Even if it returns method not allowed, the service is available
      return response.status === 405;
    } catch (error) {
      console.error('Translation service unavailable:', error);
      return false;
    }
  }
}

// Export singleton instance
export const translationClientService = TranslationClientService.getInstance(); 