/**
 * Netlify Function: Test Email
 * Test function to verify email functionality
 */

const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Initialize email services with environment variables
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Nodemailer configuration (fallback)
const createNodemailerTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Netlify Function handler
 */
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get test email from query parameter or use default
    const testEmail = event.queryStringParameters?.email || 'info@veloz.com.uy';

    // Test email content
    const testContactData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message from the contact form.',
      phone: '+598 99 123 456',
      eventType: 'wedding',
      eventDate: '2025-06-15',
      location: 'Montevideo, Uruguay',
      budget: '$1000-2000',
      services: ['photos', 'videos'],
      referral: 'Google search',
    };

    // Create email template
    const emailTemplate = {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Test Email - Veloz</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1>🎬 Test Email</h1>
                <p>This is a test email to verify the email functionality is working correctly.</p>
                <h2>Test Data:</h2>
                <ul>
                    <li><strong>Name:</strong> ${testContactData.name}</li>
                    <li><strong>Email:</strong> ${testContactData.email}</li>
                    <li><strong>Event Type:</strong> ${testContactData.eventType}</li>
                    <li><strong>Event Date:</strong> ${testContactData.eventDate}</li>
                    <li><strong>Location:</strong> ${testContactData.location}</li>
                </ul>
                <p><strong>Message:</strong> ${testContactData.message}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    This email was sent from the Netlify Function test endpoint.
                    Timestamp: ${new Date().toISOString()}
                </p>
            </div>
        </body>
        </html>
      `,
      text: `
Test Email - Veloz

This is a test email to verify the email functionality is working correctly.

Test Data:
- Name: ${testContactData.name}
- Email: ${testContactData.email}
- Event Type: ${testContactData.eventType}
- Event Date: ${testContactData.eventDate}
- Location: ${testContactData.location}

Message: ${testContactData.message}

---
This email was sent from the Netlify Function test endpoint.
Timestamp: ${new Date().toISOString()}
      `,
    };

    const subject = '🎬 TEST - Nueva consulta - Test User';

    // Try to send email
    let emailResult = null;
    let error = null;

    // Try Resend first
    if (resend) {
      try {
        const result = await resend.emails.send({
          from: 'Veloz Contacto <contacto@veloz.com.uy>',
          to: [testEmail],
          subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          replyTo: 'info@veloz.com.uy',
        });

        emailResult = { success: true, service: 'resend', result };
        console.log('Test email sent successfully with Resend', { result });
      } catch (resendError) {
        console.error('Failed to send test email with Resend', {
          error: resendError.message,
        });
        error = resendError;
      }
    }

    // Fallback to Nodemailer if Resend failed or not configured
    if (!emailResult && !resend) {
      const transporter = createNodemailerTransporter();
      if (transporter) {
        try {
          const result = await transporter.sendMail({
            from: '"Veloz Contacto" <contacto@veloz.com.uy>',
            to: testEmail,
            subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            replyTo: 'info@veloz.com.uy',
          });

          emailResult = { success: true, service: 'nodemailer', result };
          console.log('Test email sent successfully with Nodemailer', {
            result,
          });
        } catch (nodemailerError) {
          console.error('Failed to send test email with Nodemailer', {
            error: nodemailerError.message,
          });
          error = nodemailerError;
        }
      }
    }

    // Return results
    if (emailResult) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Test email sent successfully',
          service: emailResult.service,
          to: testEmail,
          timestamp: new Date().toISOString(),
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to send test email',
          details: error ? error.message : 'No email service configured',
          services: {
            resendConfigured: !!resend,
            nodemailerConfigured: !!createNodemailerTransporter(),
          },
          timestamp: new Date().toISOString(),
        }),
      };
    }
  } catch (error) {
    console.error('Failed to process test email request', {
      error: error.message,
      stack: error.stack,
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
