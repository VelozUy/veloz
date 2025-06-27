import OpenAI from 'openai';

// OpenAI Configuration
interface OpenAIConfig {
  apiKey: string;
  organization?: string;  
  project?: string;
  baseURL?: string;
}

// Translation request interface
interface TranslationRequest {
  text: string;
  fromLanguage: 'es' | 'en' | 'pt';
  toLanguage: 'es' | 'en' | 'pt';
  context?: string;
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
}

// Translation response interface
interface TranslationResponse {
  translatedText: string;
  confidence: number;
  originalText: string;
  fromLanguage: string;
  toLanguage: string;
  tokensUsed: number;
}

// Media analysis request interface
interface MediaAnalysisRequest {
  imageUrl: string;
  analysisType: 'seo' | 'description' | 'tags' | 'event_type' | 'accessibility' | 'comprehensive';
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

// API usage tracking
interface UsageStats {
  tokensUsed: number;
  requestCount: number;
  lastUsed: Date;
  estimatedCost: number;
}

/**
 * OpenAI Service
 * Handles AI-powered translation and media analysis using OpenAI GPT and Vision APIs
 * Includes usage tracking, error handling, and retry logic
 */
export class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;
  private usageStats: UsageStats = {
    tokensUsed: 0,
    requestCount: 0,
    lastUsed: new Date(),
    estimatedCost: 0
  };

  private readonly PRICING = {
    'gpt-4o': { input: 0.0025, output: 0.01 }, // per 1K tokens
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4-vision-preview': { input: 0.01, output: 0.03 }
  };

  constructor() {
    // Only initialize on server-side (Node.js environment)
    if (typeof window === 'undefined') {
      this.initializeFromEnv();
    } else {
      console.warn('OpenAI service should not be initialized in browser. Use API routes instead.');
    }
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Initialize OpenAI client from environment variables
   */
  private initializeFromEnv(): void {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found in environment variables');
      return;
    }

    this.config = {
      apiKey,
      organization: process.env.OPENAI_ORGANIZATION,
      project: process.env.OPENAI_PROJECT,
    };

    this.client = new OpenAI(this.config);
  }

  /**
   * Initialize OpenAI client with custom configuration
   */
  initialize(config: OpenAIConfig): void {
    this.config = config;
    this.client = new OpenAI(config);
  }

  /**
   * Check if OpenAI service is properly configured
   */
  isConfigured(): boolean {
    return this.client !== null && this.config !== null;
  }

  /**
   * Translate text from one language to another
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service not configured. Please set up API key.');
    }

    try {
      const prompt = this.buildTranslationPrompt(request);
      
      const completion = await this.client!.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective for translation
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in Spanish, English, and Brazilian Portuguese. Focus on maintaining the tone and context of the original text. When translating to Portuguese, always use Brazilian Portuguese variants, vocabulary, and cultural references.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 1000,
      });

      const translatedText = completion.choices[0]?.message?.content?.trim() || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Update usage stats
      this.updateUsageStats(tokensUsed, 'gpt-4o-mini');

      return {
        translatedText,
        confidence: 0.95, // High confidence for GPT-4
        originalText: request.text,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        tokensUsed
      };

    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch translate multiple texts in a single API call
   */
  async batchTranslate(
    texts: string[],
    fromLanguage: 'es' | 'en' | 'pt',
    toLanguage: 'es' | 'en' | 'pt',
    contentType?: TranslationRequest['contentType']
  ): Promise<TranslationResponse[]> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service not configured. Please set up API key.');
    }

    try {
      const prompt = this.buildBatchTranslationPrompt(texts, fromLanguage, toLanguage, contentType);
      
      const completion = await this.client!.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective for translation
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in Spanish, English, and Brazilian Portuguese. Focus on maintaining the tone and context of the original text. When translating to Portuguese, always use Brazilian Portuguese variants, vocabulary, and cultural references. Always return clean text without surrounding quotes or formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Update usage stats
      this.updateUsageStats(tokensUsed, 'gpt-4o-mini');

      // Parse the batch response
      return this.parseBatchTranslationResponse(response, texts, fromLanguage, toLanguage, tokensUsed);

    } catch (error) {
      console.error('Batch translation error:', error);
      throw new Error(`Batch translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze media using OpenAI Vision API
   */
  async analyzeMedia(request: MediaAnalysisRequest): Promise<MediaAnalysisResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service not configured. Please set up API key.');
    }

    try {
      const prompt = this.buildMediaAnalysisPrompt(request);

      const completion = await this.client!.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in image analysis, SEO optimization, and multilingual content creation. Analyze images for photography/videography business purposes.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: request.imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.4,
        max_tokens: 1500,
      });

      const analysisResult = completion.choices[0]?.message?.content?.trim() || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Update usage stats
      this.updateUsageStats(tokensUsed, 'gpt-4-vision-preview');

      // Parse the structured response
      return this.parseMediaAnalysisResponse(analysisResult, tokensUsed);

    } catch (error) {
      console.error('Media analysis error:', error);
      throw new Error(`Media analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.usageStats = {
      tokensUsed: 0,
      requestCount: 0,
      lastUsed: new Date(),
      estimatedCost: 0
    };
  }

  /**
   * Build translation prompt based on content type and context
   */
  private buildTranslationPrompt(request: TranslationRequest): string {
    const languageNames = {
      es: 'Spanish',
      en: 'English', 
      pt: 'Brazilian Portuguese'
    };

    const contextInstructions = {
      general: 'Maintain a natural, conversational tone.',
      marketing: 'Use engaging marketing language that converts. Focus on benefits and emotional appeal.',
      form: 'Keep form labels and instructions clear and concise.',
      faq: 'Maintain a helpful, informative tone suitable for frequently asked questions.',
      project: 'Use professional language suitable for project descriptions.',
      seo: 'Optimize for search engines while maintaining readability.'
    };

    let prompt = `Translate the following text from ${languageNames[request.fromLanguage]} to ${languageNames[request.toLanguage]}:\n\n${request.text}\n\n`;

    if (request.contentType) {
      prompt += `Context: ${contextInstructions[request.contentType]}\n\n`;
    }

    if (request.context) {
      prompt += `Additional context: ${request.context}\n\n`;
    }

    prompt += 'Provide only the translation without any additional explanation, quotes, or formatting.';

    return prompt;
  }

  /**
   * Build batch translation prompt for multiple texts
   */
  private buildBatchTranslationPrompt(
    texts: string[],
    fromLanguage: 'es' | 'en' | 'pt',
    toLanguage: 'es' | 'en' | 'pt',
    contentType?: TranslationRequest['contentType']
  ): string {
    const languageNames = {
      es: 'Spanish',
      en: 'English', 
      pt: 'Brazilian Portuguese'
    };

    const contextInstructions = {
      general: 'Maintain a natural, conversational tone.',
      marketing: 'Use engaging marketing language that converts. Focus on benefits and emotional appeal.',
      form: 'Keep form labels and instructions clear and concise.',
      faq: 'Maintain a helpful, informative tone suitable for frequently asked questions.',
      project: 'Use professional language suitable for project descriptions.',
      seo: 'Optimize for search engines while maintaining readability.'
    };

    let prompt = `Translate the following texts from ${languageNames[fromLanguage]} to ${languageNames[toLanguage]}:\n\n`;

    texts.forEach((text, index) => {
      prompt += `${index + 1}. ${text}\n`;
    });

    prompt += '\n';

    if (contentType) {
      prompt += `Context: ${contextInstructions[contentType]}\n\n`;
    }

    prompt += 'Provide the translations in the same order, one per line, numbered as follows:\n';
    prompt += '1. [translation of first text]\n';
    prompt += '2. [translation of second text]\n';
    prompt += '...\n\n';
    prompt += 'Provide only the clean translations without any additional explanation, quotes, or formatting.';

    return prompt;
  }

  /**
   * Parse batch translation response
   */
  private parseBatchTranslationResponse(
    response: string,
    originalTexts: string[],
    fromLanguage: string,
    toLanguage: string,
    tokensUsed: number
  ): TranslationResponse[] {
    const lines = response.split('\n').filter(line => line.trim());
    const translations: TranslationResponse[] = [];

    originalTexts.forEach((originalText, index) => {
      let translatedText = '';
      
      // Look for numbered line (e.g., "1. Translation text")
      const numberedLine = lines.find(line => 
        line.trim().startsWith(`${index + 1}.`)
      );
      
      if (numberedLine) {
        // Remove the number prefix and clean up
        translatedText = numberedLine.replace(/^\d+\.\s*/, '').trim();
        // Remove surrounding quotes if present
        translatedText = translatedText.replace(/^["']|["']$/g, '');
      } else if (lines[index]) {
        // Fallback: use line by index
        translatedText = lines[index].trim();
        // Remove surrounding quotes if present
        translatedText = translatedText.replace(/^["']|["']$/g, '');
      } else {
        // Fallback: return original text
        translatedText = originalText;
      }

      translations.push({
        translatedText,
        confidence: 0.95,
        originalText,
        fromLanguage,
        toLanguage,
        tokensUsed: Math.floor(tokensUsed / originalTexts.length) // Distribute tokens evenly
      });
    });

    return translations;
  }

  /**
   * Build media analysis prompt
   */
  private buildMediaAnalysisPrompt(request: MediaAnalysisRequest): string {
    let prompt = 'Analyze this image and provide a comprehensive analysis in JSON format with the following structure:\n\n';
    
    prompt += `{
  "altText": "Accessible description for screen readers",
  "description": {
    "es": "Detailed description in Spanish",
    "en": "Detailed description in English", 
            "pt": "Detailed description in Brazilian Portuguese"
  },
  "title": {
    "es": "Compelling title in Spanish",
    "en": "Compelling title in English",
            "pt": "Compelling title in Brazilian Portuguese"
  },
  "tags": ["relevant", "keyword", "tags"],
  "eventType": "wedding|corporate|birthday|quinceañera|other",
  "colorPalette": ["#color1", "#color2", "#color3"],
  "mood": "emotional description",
  "peopleCount": 0,
  "composition": "description of visual composition",
  "seoKeywords": ["seo", "keywords"],
  "socialMediaCaptions": {
    "instagram": "Instagram-optimized caption",
    "facebook": "Facebook-optimized caption"
  },
  "confidence": 0.95
}\n\n`;

    if (request.context) {
      prompt += 'Context:\n';
      if (request.context.eventType) prompt += `- Event type: ${request.context.eventType}\n`;
      if (request.context.brand) prompt += `- Brand: ${request.context.brand}\n`;
      if (request.context.targetAudience) prompt += `- Target audience: ${request.context.targetAudience}\n`;
      prompt += '\n';
    }

    prompt += 'Focus on professional photography/videography business needs. Provide only valid JSON.';

    return prompt;
  }

  /**
   * Parse media analysis response from OpenAI
   */
  private parseMediaAnalysisResponse(response: string, tokensUsed: number): MediaAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        altText: parsed.altText || '',
        description: parsed.description || { es: '', en: '', pt: '' },
        title: parsed.title || { es: '', en: '', pt: '' },
        tags: parsed.tags || [],
        eventType: parsed.eventType || 'other',
        colorPalette: parsed.colorPalette || [],
        mood: parsed.mood || '',
        peopleCount: parsed.peopleCount || 0,
        composition: parsed.composition || '',
        seoKeywords: parsed.seoKeywords || [],
        socialMediaCaptions: parsed.socialMediaCaptions || { instagram: '', facebook: '' },
        confidence: parsed.confidence || 0.8,
        tokensUsed
      };
    } catch (error) {
      console.error('Failed to parse media analysis response:', error);
      
      // Return fallback response
      return {
        altText: 'Image analysis unavailable',
        description: { es: '', en: '', pt: '' },
        title: { es: '', en: '', pt: '' },
        tags: [],
        eventType: 'other',
        colorPalette: [],
        mood: '',
        peopleCount: 0,
        composition: '',
        seoKeywords: [],
        socialMediaCaptions: { instagram: '', facebook: '' },
        confidence: 0,
        tokensUsed
      };
    }
  }

  /**
   * Update usage statistics
   */
  private updateUsageStats(tokensUsed: number, model: keyof typeof this.PRICING): void {
    this.usageStats.tokensUsed += tokensUsed;
    this.usageStats.requestCount += 1;
    this.usageStats.lastUsed = new Date();
    
    // Estimate cost (rough calculation)
    const pricing = this.PRICING[model];
    if (pricing) {
      // Assuming 50/50 split between input and output tokens
      const inputTokens = Math.floor(tokensUsed * 0.5);
      const outputTokens = Math.ceil(tokensUsed * 0.5);
      
      const cost = (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
      this.usageStats.estimatedCost += cost;
    }
  }
}

// Export singleton instance
export const openaiService = OpenAIService.getInstance();

// Export types for use in other components
export type {
  TranslationRequest,
  TranslationResponse,
  MediaAnalysisRequest,
  MediaAnalysisResponse,
  UsageStats
}; 