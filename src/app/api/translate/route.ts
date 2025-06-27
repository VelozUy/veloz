import { NextRequest, NextResponse } from 'next/server';
import { openaiService } from '@/services/openai';

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI service is configured
    if (!openaiService.isConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI service not configured. Please set up API key.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, fromLanguage, toLanguage, contentType, context } = body;

    // Validate request data
    if (!text || !fromLanguage || !toLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: text, fromLanguage, toLanguage' },
        { status: 400 }
      );
    }

    if (!['es', 'en', 'pt'].includes(fromLanguage) || !['es', 'en', 'pt'].includes(toLanguage)) {
      return NextResponse.json(
        { error: 'Invalid language codes. Supported: es, en, pt' },
        { status: 400 }
      );
    }

    if (fromLanguage === toLanguage) {
      return NextResponse.json(
        { error: 'Source and target languages cannot be the same' },
        { status: 400 }
      );
    }

    // Call OpenAI translation service
    const translationResponse = await openaiService.translateText({
      text,
      fromLanguage: fromLanguage as 'es' | 'en' | 'pt',
      toLanguage: toLanguage as 'es' | 'en' | 'pt',
      contentType: contentType || 'general',
      context,
    });

    return NextResponse.json({
      success: true,
      data: translationResponse,
    });

  } catch (error) {
    console.error('Translation API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Translation failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
} 