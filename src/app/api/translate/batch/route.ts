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
    const { texts, fromLanguage, toLanguage, contentType } = body;

    // Validate request data
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: texts (must be non-empty array)' },
        { status: 400 }
      );
    }

    if (!fromLanguage || !toLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: fromLanguage, toLanguage' },
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

    // Call OpenAI batch translation service
    const translationResponses = await openaiService.batchTranslate(
      texts,
      fromLanguage as 'es' | 'en' | 'pt',
      toLanguage as 'es' | 'en' | 'pt',
      contentType || 'general'
    );

    return NextResponse.json({
      success: true,
      data: translationResponses,
    });

  } catch (error) {
    console.error('Batch translation API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Batch translation failed',
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