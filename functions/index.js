/**
 * Contact Email Cloud Functions for Veloz
 * Handles sending email notifications when new contact messages are received
 * Includes admin email preferences and fallback email services
 */

const functions = require('firebase-functions');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get Firebase Functions configuration
const config = functions.config();

// Initialize email services with safe API key handling
const resend = config.resend?.api_key
  ? new Resend(config.resend.api_key)
  : null;

// Nodemailer configuration (fallback)
const createNodemailerTransporter = () => {
  if (!config.smtp?.host || !config.smtp?.user || !config.smtp?.pass) {
    return null;
  }

  return nodemailer.createTransporter({
    host: config.smtp.host,
    port: parseInt(config.smtp.port) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
};

/**
 * Get admin users who should receive contact email notifications
 */
const getAdminEmailRecipients = async () => {
  try {
    const adminUsersRef = admin.firestore().collection('adminUsers');
    const snapshot = await adminUsersRef
      .where('isActive', '==', true)
      .where('emailNotifications.contactMessages', '==', true)
      .get();

    const recipients = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.email && userData.emailNotifications?.contactMessages) {
        recipients.push({
          email: userData.email,
          name: userData.name || userData.displayName || 'Admin',
          role: userData.role || 'admin',
        });
      }
    });

    // Fallback to default admin email if no admins have notifications enabled
    if (recipients.length === 0) {
      const fallbackEmails = config.admin?.notification_emails
        ? config.admin.notification_emails.split(',').map(email => email.trim())
        : ['info@veloz.com.uy'];

      return fallbackEmails.map(email => ({
        email,
        name: 'Admin',
        role: 'admin',
      }));
    }

    return recipients;
  } catch (error) {
    functions.logger.error('Failed to get admin email recipients', {
      error: error.message,
    });

    // Fallback to default emails
    const fallbackEmails = config.admin?.notification_emails
      ? config.admin.notification_emails.split(',').map(email => email.trim())
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

    functions.logger.info('Email sent successfully with Resend', {
      result,
      to: Array.isArray(to) ? to : [to],
    });

    return { success: true, service: 'resend', result };
  } catch (error) {
    functions.logger.error('Failed to send email with Resend', {
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

    functions.logger.info('Email sent successfully with Nodemailer', {
      messageId: result.messageId,
      to: Array.isArray(to) ? to : [to],
    });

    return { success: true, service: 'nodemailer', result };
  } catch (error) {
    functions.logger.error('Failed to send email with Nodemailer', {
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
    functions.logger.warn('Resend failed, trying Nodemailer fallback', {
      error: resendError.message,
    });

    // Fallback to Nodemailer
    try {
      return await sendEmailWithNodemailer(to, subject, emailContent);
    } catch (nodemailerError) {
      functions.logger.error('Both email services failed', {
        resendError: resendError.message,
        nodemailerError: nodemailerError.message,
      });
      throw new Error('All email services failed');
    }
  }
};

/**
 * Cloud Function: Send contact email notification
 * Triggers when a new document is created in the contactMessages collection
 */
exports.sendContactEmail = onDocumentCreated(
  'contactMessages/{messageId}',
  async event => {
    const snapshot = event.data;
    const messageId = event.params.messageId;

    if (!snapshot.exists) {
      functions.logger.error('No data associated with the event');
      return;
    }

    const contactData = snapshot.data();

    functions.logger.info('Processing new contact message', {
      messageId,
      name: contactData.name,
      email: contactData.email,
    });

    try {
      // Validate required fields
      if (!contactData.name || !contactData.email || !contactData.message) {
        functions.logger.error('Missing required contact data', {
          messageId,
          contactData,
        });
        return;
      }

      // Get admin users who should receive email notifications
      const adminRecipients = await getAdminEmailRecipients();
      const adminEmails = adminRecipients.map(admin => admin.email);

      if (adminEmails.length === 0) {
        functions.logger.warn(
          'No admin recipients found for contact email notifications'
        );
        return;
      }

      functions.logger.info('Sending contact notifications to admins', {
        messageId,
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

          functions.logger.info('Email sent to admin', {
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

          functions.logger.error('Failed to send email to admin', {
            admin: admin.email,
            error: error.message,
          });
        }
      }

      // Determine overall success
      const successfulSends = emailResults.filter(result => result.success);
      const overallSuccess = successfulSends.length > 0;

      // Update the contact message with email status
      await admin
        .firestore()
        .collection('contactMessages')
        .doc(messageId)
        .update({
          emailSent: overallSuccess,
          emailSentAt: overallSuccess
            ? admin.firestore.FieldValue.serverTimestamp()
            : null,
          emailResults: emailResults,
          emailError: overallSuccess
            ? null
            : lastError
              ? lastError.message
              : 'Failed to send to any admin',
          emailErrorAt: overallSuccess
            ? null
            : admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      functions.logger.info('Contact email notification processing completed', {
        messageId,
        totalAdmins: adminRecipients.length,
        successfulSends: successfulSends.length,
        overallSuccess,
      });

      return {
        success: overallSuccess,
        messageId,
        emailResults,
        adminCount: adminRecipients.length,
        successCount: successfulSends.length,
      };
    } catch (error) {
      functions.logger.error('Failed to send contact email notification', {
        messageId,
        error: error.message,
        stack: error.stack,
      });

      // Update the contact message with error status
      try {
        await admin
          .firestore()
          .collection('contactMessages')
          .doc(messageId)
          .update({
            emailSent: false,
            emailError: error.message,
            emailErrorAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (updateError) {
        functions.logger.error(
          'Failed to update contact message with error status',
          {
            messageId,
            updateError: updateError.message,
          }
        );
      }

      throw error;
    }
  }
);

/**
 * Manual trigger for testing contact emails
 */
exports.testContactEmail = functions.https.onRequest(async (req, res) => {
  try {
    // Test contact data
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

    const emailTemplate = createContactEmailTemplate(testContactData);
    const subject = '🎬 TEST - Nueva consulta - Test User';

    // Get admin recipients or use query parameter
    let testEmails;
    if (req.query.email) {
      testEmails = [req.query.email];
    } else {
      const adminRecipients = await getAdminEmailRecipients();
      testEmails = adminRecipients.map(admin => admin.email);
    }

    if (testEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          'No test email recipients found. Pass ?email=your@email.com or configure admin users.',
      });
    }

    const result = await sendEmailWithFallback(
      testEmails,
      subject,
      emailTemplate
    );

    res.json({
      success: true,
      message: 'Test email sent successfully',
      service: result.service,
      to: testEmails,
    });
  } catch (error) {
    functions.logger.error('Failed to send test email', {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Health check function
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    functions: ['sendContactEmail', 'testContactEmail', 'healthCheck'],
    services: {
      hasResendKey: !!config.resend?.api_key,
      hasSmtpConfig: !!(config.smtp?.host && config.smtp?.user),
      hasAdminEmails: !!config.admin?.notification_emails,
      resendConfigured: !!resend,
      nodemailerConfigured: !!createNodemailerTransporter(),
    },
  });
});
