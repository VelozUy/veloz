// Client-side media analysis service
// This service calls our secure API routes instead of OpenAI directly

// Media analysis request interface
interface MediaAnalysisRequest {
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  analysisType:
    | 'seo'
    | 'description'
    | 'tags'
    | 'event_type'
    | 'accessibility'
    | 'comprehensive';
  context?: {
    eventType?: string;
    brand?: string;
    targetAudience?: string;
  };
}

// Media analysis response interface
interface MediaAnalysisResponse {
  altText: string;
  description: {
    es: string;
    en: string;
    pt: string;
  };
  title: {
    es: string;
    en: string;
    pt: string;
  };
  tags: string[];
  eventType: 'wedding' | 'corporate' | 'birthday' | 'quinceañera' | 'other';
  colorPalette: string[];
  mood: string;
  peopleCount: number;
  composition: string;
  seoKeywords: string[];
  socialMediaCaptions: {
    instagram: string;
    facebook: string;
  };
  confidence: number;
  tokensUsed: number;
}

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Client-side media analysis service
 * Calls secure API routes instead of OpenAI directly to protect API keys
 */
export class MediaAnalysisClientService {
  private static instance: MediaAnalysisClientService;

  public static getInstance(): MediaAnalysisClientService {
    if (!MediaAnalysisClientService.instance) {
      MediaAnalysisClientService.instance = new MediaAnalysisClientService();
    }
    return MediaAnalysisClientService.instance;
  }

  /**
   * Check if the service is available (always true for client service)
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Analyze media using the secure API route
   */
  async analyzeMedia(
    request: MediaAnalysisRequest
  ): Promise<MediaAnalysisResponse> {
    try {
      const response = await fetch('/api/analyze-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: ApiResponse<MediaAnalysisResponse> = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Media analysis failed');
      }

      return result.data;
    } catch (error) {
      console.error('Media analysis client error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to analyze media'
      );
    }
  }

  /**
   * Analyze media for SEO (convenience method)
   */
  async analyzeSEO(
    mediaUrl: string,
    mediaType: 'photo' | 'video',
    context?: MediaAnalysisRequest['context']
  ): Promise<MediaAnalysisResponse> {
    return this.analyzeMedia({
      mediaUrl,
      mediaType,
      analysisType: 'comprehensive',
      context: {
        brand: 'Veloz Photography',
        targetAudience: 'Event photography clients',
        ...context,
      },
    });
  }

  /**
   * Batch analyze multiple images (sequential to avoid rate limits)
   */
  async batchAnalyze(
    requests: MediaAnalysisRequest[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<MediaAnalysisResponse[]> {
    const results: MediaAnalysisResponse[] = [];

    for (let i = 0; i < requests.length; i++) {
      try {
        const result = await this.analyzeMedia(requests[i]);
        results.push(result);
        onProgress?.(i + 1, requests.length);

        // Add small delay to avoid rate limiting
        if (i < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to analyze image ${i + 1}:`, error);
        // Continue with other images even if one fails
        onProgress?.(i + 1, requests.length);
      }
    }

    return results;
  }
}

// Export singleton instance
export const mediaAnalysisClientService =
  MediaAnalysisClientService.getInstance();
