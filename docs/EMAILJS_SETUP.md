# EmailJS Setup Guide for Veloz Contact Forms

This guide explains how to set up EmailJS to handle contact form submissions for both the main contact form and the interactive CTA widget with **full email content** and **multi-language support**.

## 1. Create EmailJS Account

1. Go to [EmailJS.com](https://emailjs.com) and create a free account
2. Verify your email address

## 2. Add Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down the **Service ID** (e.g., `service_abc123`)

## 3. Create Email Templates

You'll need to create **two templates**: one for admin notifications and one for auto-replies to users.

### Admin Template (for your team)

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Name it "Admin Notification" or similar
4. Use this template structure:

#### Admin Template Variables:

The template will receive these variables from the application:

**Required Variables:**

- `{{from_name}}` - Contact's name
- `{{from_email}}` - Contact's email
- `{{event_type}}` - Type of event
- `{{event_date}}` - Event date
- `{{location}}` - Event location
- `{{services}}` - Requested services
- `{{message}}` - Contact message
- `{{phone}}` - Phone number (if provided)
- `{{source}}` - Form source (contact_form or widget)
- `{{to_name}}` - Your team name (Equipo Veloz)
- `{{reply_to}}` - Reply email (same as from_email)
- `{{contact_date}}` - Date when contact was submitted

**Template Configuration:**

- **To Email**: Your admin email(s) - you can add multiple emails separated by commas
- **From Name**: Veloz Contact System
- **Reply To**: `{{reply_to}}`

**Template Content:**

```
Subject: Nueva solicitud de contacto - {{event_type}}

Hola {{to_name}},

Has recibido una nueva solicitud de contacto desde el sitio web:

**Información del contacto:**
- Nombre: {{from_name}}
- Email: {{from_email}}
- Teléfono: {{phone}}

**Detalles del evento:**
- Tipo de evento: {{event_type}}
- Fecha: {{event_date}}
- Ubicación: {{location}}
- Servicios solicitados: {{services}}

**Mensaje:**
{{message}}

**Información adicional:**
- Fuente: {{source}}
- Fecha de contacto: {{contact_date}}

Por favor, responde a este contacto lo antes posible.

Saludos,
Sistema de Contacto Veloz
```

### Auto-Reply Template (for users)

1. Create another template named "Auto-Reply" or similar
2. Use this template structure:

#### Auto-Reply Template Variables:

**Required Variables:**

- `{{subject}}` - Email subject line
- `{{message}}` - Full email body content
- `{{email}}` - Contact's email (recipient)
- `{{name}}` - Contact's name
- `{{to_email}}` - Contact's email (recipient)
- `{{to_name}}` - Contact's name
- `{{event_type}}` - Type of event
- `{{event_date}}` - Event date
- `{{location}}` - Event location
- `{{services}}` - Requested services
- `{{user_message}}` - Original message from user
- `{{phone}}` - Phone number (if provided)
- `{{source}}` - Form source (contact_form or widget)
- `{{from_name}}` - Your team name (Equipo Veloz)
- `{{reply_to}}` - Your admin email for replies

**Template Configuration:**

- **To Email**: `{{email}}`
- **From Name**: `{{from_name}}`
- **Reply To**: `{{reply_to}}`

**Template Content:**

```
Subject: {{subject}}

{{message}}
```

## 4. Environment Variables Setup

Add these environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id_here
NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID=your_auto_reply_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## 5. Multi-Language Email Content

The application now sends **full email content** to EmailJS with language-specific templates:

### Spanish (es) - Default

- **Admin Subject**: "Nueva solicitud de contacto - Veloz"
- **User Subject**: "Gracias por contactarnos - Veloz"

### English (en)

- **Admin Subject**: "New contact request - Veloz"
- **User Subject**: "Thank you for contacting us - Veloz"

### Portuguese (pt)

- **Admin Subject**: "Nova solicitação de contato - Veloz"
- **User Subject**: "Obrigado por nos contatar - Veloz"

## 6. Email Content Structure

### Admin Notification Email

The admin email includes:

- Contact information (name, email, phone)
- Event details (type, date, location, services)
- Original message from user
- Source information and contact date
- Professional formatting with clear sections

### User Auto-Reply Email

The user receives:

- Thank you message
- Summary of their request
- Next steps information
- Contact information for urgent questions
- Professional and welcoming tone

## 7. Testing Your Setup

1. **Test Configuration**: Use the admin panel to test EmailJS configuration
2. **Test Form Submission**: Submit a test contact form
3. **Check Both Emails**: Verify both admin notification and user auto-reply are sent
4. **Test Different Languages**: Test with different locale settings

## 8. Troubleshooting

### Common Issues:

1. **"EmailJS configuration is missing"**
   - Check that all environment variables are set
   - Verify the variable names match exactly

2. **"Invalid template" error**
   - Verify template IDs are correct
   - Check that templates exist in your EmailJS account

3. **"Invalid service" error**
   - Verify service ID is correct
   - Check that email service is properly configured

4. **Auto-reply not sending**
   - Check that auto-reply template ID is set
   - Verify user email is not the widget email
   - Check EmailJS logs for specific errors

### Debug Information:

The application logs detailed information about:

- EmailJS configuration status
- Template parameters being sent
- Success/failure of each email
- Specific error messages

## 9. Security Considerations

- EmailJS public key is safe to expose in client-side code
- Template IDs and service IDs are also safe for client-side use
- Sensitive information (like admin emails) is configured in EmailJS templates, not in code
- All email content is properly sanitized before sending

## 10. Performance Notes

- Emails are sent asynchronously
- File uploads happen before email sending
- Auto-reply failures don't prevent admin notification
- Comprehensive error handling and logging
- User-friendly error messages

## 11. Maintenance

- Monitor EmailJS usage limits
- Review email templates periodically
- Update contact information as needed
- Test email delivery regularly
- Keep environment variables secure

---

**Note**: This setup provides full control over email content and language while maintaining the security and reliability of EmailJS's infrastructure.
