# Email System Documentation

## Overview

The Veloz application now includes a comprehensive email system that sends **full email content** to EmailJS with **multi-language support**. This system handles both admin notifications and user auto-replies based on the selected language.

## Features

### ✅ Multi-Language Support

- **Spanish (es)** - Default language
- **English (en)** - Full translation
- **Portuguese (pt)** - Full translation

### ✅ Two Email Types

1. **Admin Notification** - Sent to your team with contact form details
2. **User Auto-Reply** - Sent to users confirming their submission

### ✅ Full Email Content

- Complete email templates with subject and body
- Professional formatting with clear sections
- Language-specific content and tone

## Email Templates

### Admin Notification Email

**Purpose**: Notify your team about new contact form submissions

**Content Includes**:

- Contact information (name, email, phone)
- Event details (type, date, location, services)
- Original message from user
- Source information and contact date
- Professional formatting

**Language**: Always in **Spanish** (admin team language)

**Template**: Configured in EmailJS with full email content

### User Auto-Reply Email

**Purpose**: Confirm receipt and set expectations

**Content Includes**:

- Thank you message
- Summary of their request
- Next steps information
- Contact information for urgent questions
- Professional and welcoming tone

**Languages**:

- **Spanish**: "Gracias por contactarnos - Veloz"
- **English**: "Thank you for contacting us - Veloz"
- **Portuguese**: "Obrigado por nos contatar - Veloz"

## Technical Implementation

### Email Service (`src/services/email.ts`)

The email service provides:

```typescript
interface ContactFormData {
  name: string;
  email: string;
  eventType: string;
  eventDate?: string;
  location?: string;
  services?: string[];
  message?: string;
  phone?: string;
  source?: 'contact_form' | 'widget';
  locale?: string; // NEW: Language support
}
```

### Key Functions

1. **`sendContactForm(data)`** - Main function to send emails
2. **`testConfiguration()`** - Test EmailJS setup
3. **`getEmailTemplates(locale)`** - Get templates for specific language

### Template Variables

The system sends these variables to EmailJS:

**Admin Template** (Spanish only):

- `{{from_name}}`, `{{from_email}}` - Contact info
- `{{event_type}}`, `{{event_date}}`, `{{location}}` - Event details
- `{{services}}`, `{{phone}}`, `{{source}}` - Additional info
- `{{message}}` - Contact message
- `{{contact_date}}` - Submission date

**User Template** (Multi-language):

- `{{subject}}` - Email subject
- `{{message}}` - Full email body
- `{{email}}`, `{{name}}` - Recipient info
- `{{event_type}}`, `{{event_date}}`, `{{location}}` - Event details
- `{{services}}`, `{{user_message}}` - Request details

## Usage

### In Contact Forms

```typescript
import { emailService } from '@/services/email';

// Send contact form with locale
await emailService.sendContactForm({
  name: 'John Doe',
  email: 'john@example.com',
  eventType: 'Wedding',
  eventDate: '2024-09-15',
  location: 'Montevideo',
  services: ['Photography', 'Video'],
  message: 'We would like to discuss our wedding...',
  phone: '+598 99 123 456',
  source: 'contact_form',
  locale: 'en', // Language selection
});
```

### Testing

Use the admin panel's Email Test Panel to:

- Test configuration
- Send test emails
- Preview templates in different languages
- Verify EmailJS setup

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id
NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID=your_auto_reply_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### EmailJS Templates

**Admin Template Setup**:

- **To Email**: Your admin email(s)
- **From Name**: Veloz Contact System
- **Reply To**: `{{reply_to}}`
- **Content**: Use `{{subject}}` and `{{message}}` variables

**User Template Setup**:

- **To Email**: `{{email}}`
- **From Name**: `{{from_name}}`
- **Reply To**: `{{reply_to}}`
- **Content**: Use `{{subject}}` and `{{message}}` variables

## Language Detection

The system automatically detects the language based on:

1. **Form locale prop** - Passed from the contact form
2. **URL locale** - From the current page URL
3. **Default fallback** - Spanish (es)

## Error Handling

The system includes comprehensive error handling:

- **Configuration errors** - Missing environment variables
- **Network errors** - EmailJS connectivity issues
- **Template errors** - Invalid template IDs
- **Service errors** - EmailJS service issues

### Error Recovery

- Auto-reply failures don't prevent admin notifications
- Detailed error logging for debugging
- User-friendly error messages
- Graceful degradation

## Security

- EmailJS public key is safe for client-side use
- Template IDs and service IDs are also safe
- Sensitive information configured in EmailJS templates
- All content properly sanitized

## Performance

- Asynchronous email sending
- File uploads happen before email sending
- Non-blocking user experience
- Efficient template processing

## Maintenance

### Regular Tasks

1. **Monitor EmailJS usage** - Check monthly limits
2. **Review email templates** - Update content as needed
3. **Test email delivery** - Verify both email types work
4. **Update contact information** - Keep admin emails current

### Troubleshooting

1. **Check environment variables** - Verify all are set
2. **Test EmailJS configuration** - Use admin panel
3. **Review EmailJS logs** - Check for specific errors
4. **Verify template variables** - Ensure proper formatting

## Future Enhancements

Potential improvements:

- **Email tracking** - Track open rates and clicks
- **Template customization** - Admin-editable templates (see epic in backlog)
- **Email scheduling** - Delayed sending options
- **Advanced filtering** - Spam protection
- **Analytics integration** - Email performance metrics

## Admin-Editable Templates

**Status**: Epic added to backlog for future development

**Epic**: "Editable User Email Templates" - Allows admins to edit user auto-reply email templates through the admin panel without requiring code changes or EmailJS template updates.

**Features Planned**:

- Multi-language template editing interface
- Template storage in Firestore
- Dynamic variable replacement system
- Template testing and validation
- Version control and history

---

**Note**: This email system provides full control over content and language while maintaining the reliability and security of EmailJS's infrastructure.
