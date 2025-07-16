# EmailJS Setup Guide for Veloz Contact Forms

This guide explains how to set up EmailJS to handle contact form submissions for both the main contact form and the interactive CTA widget.

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

- `{{from_name}}` - Contact's name
- `{{from_email}}` - Contact's email
- `{{event_type}}` - Type of event
- `{{event_date}}` - Event date
- `{{message}}` - Contact message
- `{{phone}}` - Phone number (if provided)
- `{{source}}` - Form source (contact_form or widget)
- `{{to_name}}` - Your team name (Equipo Veloz)
- `{{reply_to}}` - Reply email (same as from_email)

### Auto-Reply Template (for users)

1. Create another template named "Auto-Reply" or similar
2. Use this template structure:

#### Auto-Reply Template Variables:

- `{{to_name}}` - Contact's name
- `{{to_email}}` - Contact's email
- `{{event_type}}` - Type of event
- `{{event_date}}` - Event date
- `{{message}}` - Contact message
- `{{phone}}` - Phone number (if provided)
- `{{source}}` - Form source (contact_form or widget)
- `{{from_name}}` - Your team name (Equipo Veloz)
- `{{reply_to}}` - Your admin email for replies

### Suggested Admin Email Template:

**Subject:** Nuevo contacto desde Veloz - {{event_type}}

**Body:**

```
Hola {{to_name}},

Has recibido un nuevo contacto desde el sitio web de Veloz:

📧 Información del Cliente:
• Nombre: {{from_name}}
• Email: {{from_email}}
• Teléfono: {{phone}}

🎉 Información del Evento:
• Tipo de evento: {{event_type}}
• Fecha aproximada: {{event_date}}

💬 Mensaje:
{{message}}

📋 Origen: {{source}}

---
Este mensaje fue enviado automáticamente desde el formulario de contacto de Veloz.
Para responder al cliente, usa: {{reply_to}}
```

### Suggested Auto-Reply Email Template:

**Subject:** ¡Gracias por contactarnos, {{to_name}}!

**Body:**

```
Hola {{to_name}},

¡Gracias por contactarnos! Hemos recibido tu solicitud para {{event_type}}.

📋 Resumen de tu solicitud:
• Tipo de evento: {{event_type}}
• Fecha aproximada: {{event_date}}
• Ubicación: {{message}}

📞 Próximos pasos:
Te contactaremos dentro de las próximas 24 horas para discutir los detalles de tu evento y proporcionarte una cotización personalizada.

Si tienes alguna pregunta urgente, no dudes en responder a este email o llamarnos directamente.

¡Esperamos trabajar contigo para hacer de tu evento algo extraordinario!

Saludos,
{{from_name}}
{{reply_to}}
```

4. Save the admin template and note the **Admin Template ID** (e.g., `template_admin_xyz789`)

5. Create the auto-reply template and note the **Auto-Reply Template ID** (e.g., `template_auto_reply_abc123`)

## 4. Get Public Key

1. Go to **Account** > **General**
2. Find your **Public Key** (e.g., `abc123XYZ`)

## 5. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id_here
NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID=your_auto_reply_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## 6. Test Configuration

1. Start your development server: `npm run dev`
2. Go to `/contact` page
3. Fill out and submit the contact form
4. Check your email for the message
5. Test the interactive widget by clicking the floating button

## 7. Production Deployment

1. Add the same environment variables to your Netlify site settings
2. Redeploy your site
3. Test both forms in production

## Troubleshooting

### Common Issues:

1. **"EmailJS configuration is missing"**
   - Check that all three environment variables are set
   - Restart your development server after adding variables

2. **"Failed to send email"**
   - Verify your Service ID, Template ID, and Public Key are correct
   - Check EmailJS dashboard for any service issues
   - Ensure your email service is properly connected

3. **Emails not received**
   - Check spam/junk folder
   - Verify email service is working in EmailJS dashboard
   - Test with a different email address

4. **Template variables not showing**
   - Ensure template variable names match exactly (case-sensitive)
   - Check that form fields are being passed correctly

### Support

- EmailJS Documentation: https://emailjs.com/docs/
- EmailJS Support: https://emailjs.com/support/

## Template Testing

You can test your template by using the "Send Test" feature in EmailJS dashboard with these sample values:

```json
{
  "from_name": "María García",
  "from_email": "maria@example.com",
  "event_type": "boda",
  "event_date": "2024-09-15",
  "message": "Estamos planeando nuestra boda y nos encantaría conocer más sobre sus servicios. Somos aproximadamente 100 invitados.",
  "phone": "+598 99 123 456",
  "source": "contact_form",
  "preferred_contact": "email",
  "to_name": "Equipo Veloz",
  "reply_to": "maria@example.com"
}
```

This will help you verify the template formatting before going live.
