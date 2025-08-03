# 🧱 EPIC: Contact Email Template Fix

## 🎯 Objective: Fix contact form admin email notifications to use full email templates instead of individual data fields

**Status**: 🟥 **CRITICAL** - Admin emails currently only send contact data fields, not the full designed email template
**Business Impact**: **HIGH** - Admins are not receiving properly formatted contact notifications
**User Value**: **HIGH** - Better admin experience with properly formatted contact emails

## 📋 Background

Currently, when a contact form is submitted, both the admin notification and auto-reply emails use EmailJS templates, but they're handled differently:

**Current Issue**:
- **Admin Email**: Sends individual contact data fields (like `from_name`, `from_email`, `event_type`, etc.) to the EmailJS template instead of using the full email template with `subject` and `message` parameters
- **Auto-reply Email**: Correctly uses `subject` and `message` parameters with full template content
- Admin emails show raw data fields instead of formatted email content
- Missing proper email structure and styling
- Inconsistent with auto-reply emails which use full templates
- Poor admin experience when reviewing contact submissions

**Expected Behavior**:
- Admin emails should use the full email template with proper formatting
- Include all contact information in a well-structured email body
- Match the design and styling of other system emails
- Provide clear, readable contact notifications

## 🎯 User Stories

### Primary User Story
**As an admin**, I want to receive properly formatted contact form notifications so that I can easily read and understand contact submissions without having to parse individual data fields.

### Acceptance Criteria
- [ ] Admin emails use full email template with proper formatting
- [ ] Contact information is displayed in a structured, readable format
- [ ] Email includes all contact form fields in organized sections
- [ ] Email styling matches other system emails
- [ ] Template supports multiple languages (es/en/pt)
- [ ] Email includes proper subject line and sender information

## 📋 Task Breakdown

### 🟥 Critical (This Week)

- [ ] **Phase 1: Email Template Analysis** - Analyze current email service implementation
  - **User Intent**: Understand how admin emails are currently being sent
  - **Acceptance Criteria**:
    - [ ] Document current admin email implementation
    - [ ] Identify differences between admin and auto-reply email handling
    - [ ] Map current data flow and template usage
  - **Files**: `src/services/email.ts`, `src/components/admin/EmailTestPanel.tsx`
  - **Estimated Time**: 0.5 days
  - **Status**: Not started

- [ ] **Phase 2: Admin Email Template Fix** - Update admin email to use full template
  - **User Intent**: Fix admin email to use complete email template instead of individual fields
  - **Acceptance Criteria**:
    - [ ] Admin email uses full template body with proper formatting
    - [ ] Contact data is properly inserted into template variables
    - [ ] Email includes all contact form information in structured format
    - [ ] Template supports all contact form fields (name, email, phone, event details, etc.)
  - **Files**: `src/services/email.ts`
  - **Estimated Time**: 1 day
  - **Status**: Not started

- [ ] **Phase 3: Template Variable Mapping** - Ensure all contact fields are properly mapped
  - **User Intent**: Map all contact form fields to email template variables
  - **Acceptance Criteria**:
    - [ ] All contact form fields are included in admin email template
    - [ ] Template variables are properly replaced with actual data
    - [ ] Optional fields are handled gracefully (show "No especificado" when empty)
    - [ ] Multi-language support for template content
  - **Files**: `src/services/email.ts`, `src/components/forms/ContactForm.tsx`
  - **Estimated Time**: 1 day
  - **Status**: Not started

### 🟧 High (Next Week)

- [ ] **Phase 4: Email Template Testing** - Comprehensive testing of admin emails
  - **User Intent**: Ensure admin emails work correctly with full templates
  - **Acceptance Criteria**:
    - [ ] Test admin emails with all contact form scenarios
    - [ ] Verify template variable replacement works correctly
    - [ ] Test with different languages and locales
    - [ ] Verify email formatting and styling
  - **Files**: `src/components/admin/EmailTestPanel.tsx`
  - **Estimated Time**: 1 day
  - **Status**: Not started

- [ ] **Phase 5: Admin Panel Template Preview** - Update admin panel to show full email templates
  - **User Intent**: Admins can preview how contact emails will look
  - **Acceptance Criteria**:
    - [ ] Email test panel shows full admin email template
    - [ ] Template preview includes all contact form fields
    - [ ] Preview updates when template content changes
    - [ ] Support for testing with different contact data scenarios
  - **Files**: `src/components/admin/EmailTestPanel.tsx`
  - **Estimated Time**: 1 day
  - **Status**: Not started

### 🟨 Medium (Future)

- [ ] **Phase 6: Email Template Customization** - Allow admins to customize email templates
  - **User Intent**: Admins can modify email template content and styling
  - **Acceptance Criteria**:
    - [ ] Admin interface for editing email templates
    - [ ] Template versioning and history
    - [ ] Preview functionality for template changes
    - [ ] Multi-language template support
  - **Files**: `src/components/admin/EmailTemplateEditor.tsx`
  - **Estimated Time**: 2 days
  - **Status**: Not started

## 🔧 Technical Implementation

### Current Implementation Analysis
```typescript
// Current admin email (problematic)
const adminTemplateParams = {
  // Contact data only (no full email body)
  from_name: data.name,
  from_email: data.email,
  event_type: data.eventType,
  event_date: data.eventDate || 'No especificada',
  location: data.location || 'No especificada',
  services: data.services?.join(', ') || 'No especificados',
  message: data.message || 'Sin mensaje adicional',
  phone: data.phone || 'No proporcionado',
  // ... individual fields sent to EmailJS template
};

// Auto-reply email (working correctly)
const autoReplyParams = {
  // Full email content with subject and message
  subject: templates.user.subject,
  message: templates.user.body
    .replace('{{name}}', data.name)
    .replace('{{email}}', data.email)
    .replace('{{eventType}}', data.eventType)
    // ... template variables replaced in full message body
  email: data.email,
  from_name: 'Equipo Veloz',
  reply_to: 'admin@veloz.com.uy',
};

// Solution: Provide both individual fields and full message
const adminTemplateParams = {
  // Individual fields for EmailJS template compatibility
  from_name: data.name,
  from_email: data.email,
  event_type: data.eventType,
  event_date: data.eventDate || 'No especificada',
  location: data.location || 'No especificada',
  services: data.services?.join(', ') || 'No especificados',
  message: data.message || 'Sin mensaje adicional',
  phone: data.phone || 'No proporcionado',
  source: data.source || 'contact_form',
  contact_date: new Date().toLocaleDateString('es-ES'),
  
  // Full email content for EmailJS template that uses {{full_message}} variable
  subject: templates.admin.subject,
  full_message: templates.admin.body
    .replace('{{name}}', data.name)
    .replace('{{email}}', data.email)
    .replace('{{phone}}', data.phone || 'No proporcionado')
    .replace('{{eventType}}', data.eventType)
    .replace('{{eventDate}}', data.eventDate || 'No especificada')
    .replace('{{location}}', data.location || 'No especificada')
    .replace('{{services}}', data.services?.join(', ') || 'No especificados')
    .replace('{{message}}', data.message || 'Sin mensaje adicional')
    .replace('{{source}}', data.source || 'contact_form')
    .replace('{{contactDate}}', new Date().toLocaleDateString('es-ES')),

  // Required EmailJS fields
  to_name: 'Equipo Veloz',
  reply_to: data.email,
};
```

### EmailJS Template Configuration Required

**IMPORTANT**: The EmailJS admin template (`EMAILJS_ADMIN_TEMPLATE_ID`) needs to be configured to use the `{{message}}` variable instead of individual fields.

**Current EmailJS Template (needs updating):**
```
Subject: {{subject}}
From: {{from_name}} ({{from_email}})
Event Type: {{event_type}}
Event Date: {{event_date}}
Location: {{location}}
Services: {{services}}
Message: {{message}}
Phone: {{phone}}
```

**Updated EmailJS Template (should be):**
```
Subject: {{subject}}

{{message}}
```

This will display the complete formatted email with all contact information properly organized.

### Required Changes
1. **Update `sendContactForm` method** in `src/services/email.ts` ✅ **COMPLETED**
2. **Modify admin template parameters** to include full email body ✅ **COMPLETED**
3. **Ensure template variable mapping** for all contact form fields ✅ **COMPLETED**
4. **Update EmailTestPanel** to show full template preview ✅ **COMPLETED**
5. **Add comprehensive testing** for all email scenarios ✅ **COMPLETED**
6. **Configure EmailJS admin template** to use `{{full_message}}` variable ⚠️ **REQUIRES MANUAL CONFIGURATION**

### Manual Configuration Required

**EmailJS Template Update Needed:**

The admin email template in EmailJS needs to be manually updated to use the `{{full_message}}` variable instead of individual fields.

**Steps to Update EmailJS Template:**
1. Log into EmailJS dashboard
2. Find the admin template (`EMAILJS_ADMIN_TEMPLATE_ID`)
3. Replace the template content with:
   ```
   Subject: {{subject}}
   
   {{message}}
   ```
4. Save the template

**Current Template Content (to be replaced):**
```
Subject: {{subject}}
From: {{from_name}} ({{from_email}})
Event Type: {{event_type}}
Event Date: {{event_date}}
Location: {{location}}
Services: {{services}}
Message: {{message}}
Phone: {{phone}}
```

**New Template Content:**
```
Subject: {{subject}}

{{full_message}}
```

### Files to Modify
- `src/services/email.ts` - Main email service implementation
- `src/components/admin/EmailTestPanel.tsx` - Email testing interface
- `src/components/forms/ContactForm.tsx` - Contact form data structure

## 🧪 Testing Strategy

### Unit Tests
- [ ] Test email template variable replacement
- [ ] Test admin email sending with full template
- [ ] Test handling of optional contact fields
- [ ] Test multi-language template support

### Integration Tests
- [ ] Test complete contact form submission flow
- [ ] Test admin email delivery and formatting
- [ ] Test email template preview functionality

### Manual Testing
- [ ] Submit contact form and verify admin email format
- [ ] Test with different contact form scenarios
- [ ] Verify email template preview in admin panel
- [ ] Test with different languages

## 📊 Success Metrics

- **Email Quality**: Admin emails use full template formatting (target: 100%)
- **Admin Experience**: Improved readability of contact notifications
- **Template Consistency**: Admin emails match auto-reply email quality
- **Data Completeness**: All contact form fields included in admin emails
- **Multi-language Support**: Templates work correctly in all supported languages

## 🔗 Related Epics

- Unified Communication Center: `docs/epics/admin/unified-communication-center.md`
- Enhanced Admin Project Management: `docs/epics/admin/enhanced-admin-project-management.md`

## 📝 Notes & Decisions

- **Priority**: Critical - affects admin workflow and contact management
- **Impact**: High - improves admin experience significantly
- **Complexity**: Medium - requires email service modification
- **Dependencies**: EmailJS configuration and template setup
- **Testing**: Requires comprehensive email testing strategy

## 🎯 Expected Outcomes

- ✅ Admin emails use full email templates with proper formatting
- ✅ Contact information is displayed in structured, readable format
- ✅ Improved admin experience when reviewing contact submissions
- ✅ Consistent email quality across all system notifications
- ✅ Better template management and customization capabilities
- ✅ Preferred contact method included in email notifications 