/**
 * Netlify Function: Send Contact Email
 * Handles sending email notifications for contact form submissions
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
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Get admin users who should receive contact email notifications
 */
const getAdminEmailRecipients = async () => {
  try {
    // For Netlify Functions, we'll use environment variables for admin emails
    const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS
      ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',').map(email =>
          email.trim()
        )
      : ['info@veloz.com.uy'];

    return adminEmails.map(email => ({
      email,
      name: 'Admin',
      role: 'admin',
    }));
  } catch (error) {
    console.error('Failed to get admin email recipients', {
      error: error.message,
    });

    // Fallback to default emails
    const fallbackEmails = process.env.ADMIN_NOTIFICATION_EMAILS
      ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',').map(email =>
          email.trim()
        )
      : ['info@veloz.com.uy'];

    return fallbackEmails.map(email => ({
      email,
      name: 'Admin',
      role: 'admin',
    }));
  }
};

/**
 * Email template for contact notifications
 */
const createContactEmailTemplate = contactData => {
  const {
    name,
    email,
    message,
    phone,
    eventType,
    eventDate,
    location,
    budget,
    services,
    referral,
  } = contactData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Nueva consulta de contacto - Veloz</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #555; }
            .field-value { margin-left: 10px; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎬 Nueva Consulta de Contacto</h1>
                <p>Veloz - Fotografía y Videografía</p>
            </div>
            
            <div class="content">
                ${eventDate ? '<div class="urgent">⚡ <strong>Evento con fecha específica</strong> - Responder con prioridad</div>' : ''}
                
                <h2>Información del Cliente</h2>
                
                <div class="field">
                    <span class="field-label">👤 Nombre:</span>
                    <span class="field-value">${name}</span>
                </div>
                
                <div class="field">
                    <span class="field-label">📧 Email:</span>
                    <span class="field-value"><a href="mailto:${email}">${email}</a></span>
                </div>
                
                ${
                  phone
                    ? `
                <div class="field">
                    <span class="field-label">📱 Teléfono:</span>
                    <span class="field-value"><a href="tel:${phone}">${phone}</a></span>
                </div>
                `
                    : ''
                }
                
                ${
                  eventType
                    ? `
                <div class="field">
                    <span class="field-label">🎉 Tipo de Evento:</span>
                    <span class="field-value">${eventType}</span>
                </div>
                `
                    : ''
                }
                
                ${
                  eventDate
                    ? `
                <div class="field">
                    <span class="field-label">📅 Fecha del Evento:</span>
                    <span class="field-value">${eventDate}</span>
                </div>
                `
                    : ''
                }
                
                ${
                  location
                    ? `
                <div class="field">
                    <span class="field-label">📍 Ubicación:</span>
                    <span class="field-value">${location}</span>
                </div>
                `
                    : ''
                }
                
                ${
                  budget
                    ? `
                <div class="field">
                    <span class="field-label">💰 Presupuesto:</span>
                    <span class="field-value">${budget}</span>
                </div>
                `
                    : ''
                }
                
                ${
                  services && services.length > 0
                    ? `
                <div class="field">
                    <span class="field-label">🎬 Servicios Solicitados:</span>
                    <span class="field-value">${Array.isArray(services) ? services.join(', ') : services}</span>
                </div>
                `
                    : ''
                }
                
                ${
                  referral
                    ? `
                <div class="field">
                    <span class="field-label">👥 Referencia:</span>
                    <span class="field-value">${referral}</span>
                </div>
                `
                    : ''
                }
                
                <div class="message-box">
                    <h3>💬 Mensaje:</h3>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="mailto:${email}?subject=Re: Consulta sobre ${eventType || 'servicios'} - Veloz" 
                       style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        📧 Responder al Cliente
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Esta notificación fue enviada automáticamente desde el formulario de contacto de Veloz.</p>
                <p>Para gestionar este contacto, visita el <a href="https://veloz.com.uy/admin/communications">panel de administración</a>.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
Nueva consulta de contacto - Veloz

Información del Cliente:
- Nombre: ${name}
- Email: ${email}
${phone ? `- Teléfono: ${phone}` : ''}
${eventType ? `- Tipo de Evento: ${eventType}` : ''}
${eventDate ? `- Fecha del Evento: ${eventDate}` : ''}
${location ? `- Ubicación: ${location}` : ''}
${budget ? `- Presupuesto: ${budget}` : ''}
${services && services.length > 0 ? `- Servicios: ${Array.isArray(services) ? services.join(', ') : services}` : ''}
${referral ? `- Referencia: ${referral}` : ''}

Mensaje:
${message}

---
Responder a: ${email}
Panel de administración: https://veloz.com.uy/admin/communications
  `;

  return { html, text };
};

/**
 * Send email using Resend (primary service)
 */
const sendEmailWithResend = async (to, subject, { html, text }) => {
  if (!resend) {
    throw new Error('Resend service not configured');
  }

  try {
    const result = await resend.emails.send({
      from: 'Veloz Contacto <contacto@veloz.com.uy>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: 'info@veloz.com.uy',
    });

    console.log('Email sent successfully with Resend', {
      result,
      to: Array.isArray(to) ? to : [to],
    });

    return { success: true, service: 'resend', result };
  } catch (error) {
    console.error('Failed to send email with Resend', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send email using Nodemailer (fallback service)
 */
const sendEmailWithNodemailer = async (to, subject, { html, text }) => {
  const transporter = createNodemailerTransporter();

  if (!transporter) {
    throw new Error('Nodemailer service not configured');
  }

  try {
    const mailOptions = {
      from: '"Veloz Contacto" <contacto@veloz.com.uy>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      replyTo: 'info@veloz.com.uy',
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully with Nodemailer', {
      messageId: result.messageId,
      to: Array.isArray(to) ? to : [to],
    });

    return { success: true, service: 'nodemailer', result };
  } catch (error) {
    console.error('Failed to send email with Nodemailer', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send email with automatic fallback
 */
const sendEmailWithFallback = async (to, subject, emailContent) => {
  // Try Resend first
  try {
    return await sendEmailWithResend(to, subject, emailContent);
  } catch (resendError) {
    console.warn('Resend failed, trying Nodemailer fallback', {
      error: resendError.message,
    });

    // Fallback to Nodemailer
    try {
      return await sendEmailWithNodemailer(to, subject, emailContent);
    } catch (nodemailerError) {
      console.error('Both email services failed', {
        resendError: resendError.message,
        nodemailerError: nodemailerError.message,
      });
      throw new Error('All email services failed');
    }
  }
};

/**
 * Netlify Function handler
 */
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const contactData = JSON.parse(event.body);

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            'Missing required fields: name, email, and message are required',
        }),
      };
    }

    console.log('Processing contact form submission', {
      name: contactData.name,
      email: contactData.email,
    });

    // Get admin users who should receive email notifications
    const adminRecipients = await getAdminEmailRecipients();
    const adminEmails = adminRecipients.map(admin => admin.email);

    if (adminEmails.length === 0) {
      console.warn('No admin recipients found for contact email notifications');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'No admin recipients configured',
        }),
      };
    }

    console.log('Sending contact notifications to admins', {
      adminEmails,
      adminCount: adminRecipients.length,
    });

    // Create email content
    const emailTemplate = createContactEmailTemplate(contactData);
    const subject = `🎬 Nueva consulta${contactData.eventType ? ` - ${contactData.eventType}` : ''} - ${contactData.name}`;

    // Send notification email to each admin
    let emailResults = [];
    let lastError = null;

    for (const admin of adminRecipients) {
      try {
        const emailResult = await sendEmailWithFallback(
          [admin.email],
          subject,
          emailTemplate
        );
        emailResults.push({
          admin: admin.email,
          success: true,
          service: emailResult.service,
        });

        console.log('Email sent to admin', {
          admin: admin.email,
          service: emailResult.service,
        });
      } catch (error) {
        lastError = error;
        emailResults.push({
          admin: admin.email,
          success: false,
          error: error.message,
        });

        console.error('Failed to send email to admin', {
          admin: admin.email,
          error: error.message,
        });
      }
    }

    // Determine overall success
    const successfulSends = emailResults.filter(result => result.success);
    const overallSuccess = successfulSends.length > 0;

    console.log('Contact email notification processing completed', {
      totalAdmins: adminRecipients.length,
      successfulSends: successfulSends.length,
      overallSuccess,
    });

    if (overallSuccess) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Contact email sent successfully',
          emailResults,
          adminCount: adminRecipients.length,
          successCount: successfulSends.length,
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to send email to any admin',
          emailResults,
        }),
      };
    }
  } catch (error) {
    console.error('Failed to process contact email request', {
      error: error.message,
      stack: error.stack,
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
    };
  }
};
