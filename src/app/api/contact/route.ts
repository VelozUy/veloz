import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: name, email, and message are required',
        },
        { status: 400 }
      );
    }

    // Send email using the email service (which will use fallback if needed)
    await emailService.sendContactForm(body);

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    console.error('Contact API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to send contact form',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return configuration status for debugging
  const status = emailService.getConfigurationStatus();

  return NextResponse.json({
    status,
    message: 'Contact API is running',
  });
}
