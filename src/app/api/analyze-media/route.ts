import { NextRequest, NextResponse } from 'next/server';
import { openaiService } from '@/services/openai';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.mediaUrl || typeof body.mediaUrl !== 'string') {
      return NextResponse.json(
        { error: 'mediaUrl is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.mediaType || typeof body.mediaType !== 'string') {
      return NextResponse.json(
        { error: 'mediaType is required and must be "photo" or "video"' },
        { status: 400 }
      );
    }

    const validMediaTypes = ['photo', 'video'];
    if (!validMediaTypes.includes(body.mediaType)) {
      return NextResponse.json(
        {
          error: `mediaType must be one of: ${validMediaTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!body.analysisType || typeof body.analysisType !== 'string') {
      return NextResponse.json(
        { error: 'analysisType is required and must be a string' },
        { status: 400 }
      );
    }

    const validAnalysisTypes = [
      'seo',
      'description',
      'tags',
      'event_type',
      'accessibility',
      'comprehensive',
    ];
    if (!validAnalysisTypes.includes(body.analysisType)) {
      return NextResponse.json(
        {
          error: `analysisType must be one of: ${validAnalysisTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.mediaUrl);
    } catch {
      return NextResponse.json(
        { error: 'mediaUrl must be a valid URL' },
        { status: 400 }
      );
    }

    // Prepare analysis request
    const analysisRequest: MediaAnalysisRequest = {
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
      analysisType: body.analysisType,
      context: body.context || {},
    };

    // Check if OpenAI service is configured
    if (!openaiService.isConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI service not configured' },
        { status: 500 }
      );
    }

    // Perform analysis
    const result = await openaiService.analyzeMedia(analysisRequest);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Media analysis API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Media analysis failed',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
