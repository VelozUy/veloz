import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test the Netlify function
    const functionUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8888/.netlify/functions/send-contact-email'
        : `https://${request.headers.get('host')}/.netlify/functions/send-contact-email`;

    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message from the contact form',
      phone: '+598 99 123 456',
      eventType: 'wedding',
      eventDate: '2025-06-15',
      location: 'Montevideo, Uruguay',
      budget: '$1000-2000',
      services: ['photos', 'videos'],
      referral: 'Google search',
    };

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result,
      functionUrl,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Test email error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test email configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
