# 📋 Veloz Project Tasks

_Last updated: 2025-01-20_

---

# 🧩 Epic-Based Task Tracking

## How to Use This File

- Every task must belong to an Epic.
- Use the format below for each Epic.
- Group tasks by priority: Critical, High, Medium, Low.
- Use status indicators: [ ] Not started, [~] In progress, [x] Completed, [!] Blocked.
- Move completed tasks to the "Completed" section of their Epic, with completion dates.
- Add new discoveries under "Discovered During the Epic".

---

### 🧱 EPIC: Code Quality & Maintenance

**Objective**: Maintain high code quality, fix linting issues, and ensure codebase health.

#### 🟥 Critical

- [x] Fix critical ESLint errors
  - **User Intent**: Resolve blocking linting errors that prevent clean builds
  - **Acceptance Criteria**:
    - No ESLint errors (only warnings remain)
    - All critical unescaped entities fixed
    - Missing dependencies in React hooks resolved
    - Unused imports cleaned up
  - **Notes**: Fixed unescaped quotes in ProjectDetailClient, missing dependencies in SocialFeed, unused imports in OurWorkContent
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟧 High

- [ ] Clean up remaining ESLint warnings
  - **User Intent**: Improve code quality by addressing all linting warnings
  - **Acceptance Criteria**:
    - All unused variables removed
    - All unused imports removed
    - All missing alt attributes added
    - All React Hook dependency issues resolved
  - **Notes**: Many warnings remain but are not blocking

#### 🟨 Medium

- [ ] Add comprehensive TypeScript types
  - **User Intent**: Improve type safety across the application
  - **Acceptance Criteria**:
    - All components have proper TypeScript interfaces
    - All functions have proper return types
    - All props are properly typed
    - No any types used

#### 🟩 Low

- [ ] Add code documentation
  - **User Intent**: Improve code maintainability with proper documentation
  - **Acceptance Criteria**:
    - All complex functions have JSDoc comments
    - All components have prop documentation
    - README files are up to date
    - Architecture decisions are documented

### ✅ Completed

- [x] Fix critical ESLint errors (2025-01-20)

---

### 🧱 EPIC: Security & Infrastructure

**Objective**: Ensure stable, secure, and reliable application infrastructure.

#### 🟥 Critical

- [x] Fix Google OAuth sign-in error
  - **User Intent**: Resolve authentication issues preventing admin access
  - **Acceptance Criteria**:
    - Admin can successfully sign in with Google OAuth
    - No CSP errors in browser console
    - Proper error handling and user feedback
  - **Notes**: Fixed CSP to allow Google APIs, added error handling and debug tools
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Fix admin page loading issues
  - **User Intent**: Ensure admin panel loads reliably without authentication errors
  - **Acceptance Criteria**:
    - Admin pages load without infinite loading states
    - Firebase initialization completes successfully
    - No console errors during page load
  - **Notes**: Improved auth initialization, CSP for Firebase Analytics
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Fix Firebase Firestore internal assertion errors
  - **User Intent**: Eliminate Firestore errors that cause application instability
  - **Acceptance Criteria**:
    - No Firestore internal assertion errors in console
    - All database operations complete successfully
    - Proper error recovery mechanisms in place
  - **Notes**: Comprehensive error handling and recovery system
  - **PO Sign-Off**: PO Approved (2025-01-07)

#### 🟧 High

- [x] Implement Content Security Policy (CSP)
  - **User Intent**: Protect against XSS attacks and unauthorized resource loading
  - **Acceptance Criteria**:
    - CSP headers properly configured
    - All legitimate resources load without violations
    - Security headers prevent common attacks
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add CSRF protection
  - **User Intent**: Prevent cross-site request forgery attacks
  - **Acceptance Criteria**:
    - All forms protected against CSRF attacks
    - Tokens properly validated on server side
    - No false positives blocking legitimate requests
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Configure security headers
  - **User Intent**: Enhance overall application security posture
  - **Acceptance Criteria**:
    - Security headers properly configured
    - No breaking changes to existing functionality
    - Headers provide protection against common attacks
  - **PO Sign-Off**: PO Approved (2025-01-08)

#### 🟨 Medium

- [x] Add rate limiting
  - **User Intent**: Prevent abuse and ensure fair resource usage
  - **Acceptance Criteria**:
    - API endpoints protected against abuse
    - Legitimate users not affected by rate limits
    - Proper error messages for rate-limited requests
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add input sanitization
  - **User Intent**: Prevent injection attacks and data corruption
  - **Acceptance Criteria**:
    - All user inputs properly sanitized
    - No XSS vulnerabilities in user-generated content
    - Sanitization doesn't break legitimate content
  - **PO Sign-Off**: PO Approved (2025-01-08)

#### 🟩 Low

- [ ] Add security monitoring
  - **User Intent**: Detect and respond to security incidents proactively
  - **Acceptance Criteria**:
    - Security events logged and monitored
    - Alerts for suspicious activity
    - Dashboard for security metrics

#### 🧠 Discovered During the Epic

- [ ] Add backup encryption
  - **User Intent**: Ensure data security in backup systems
- [ ] Add security incident response
  - **User Intent**: Establish procedures for security incident handling

### ✅ Completed

- [x] Fix Google OAuth sign-in error (2025-01-16)
- [x] Fix admin page loading issues (2025-01-16)
- [x] Fix Firebase Firestore internal assertion errors (2025-01-07)
- [x] Implement Content Security Policy (CSP) (2025-01-08)
- [x] Add CSRF protection (2025-01-08)
- [x] Configure security headers (2025-01-08)
- [x] Add rate limiting (2025-01-08)
- [x] Add input sanitization (2025-01-08)

---

### 🧱 EPIC: Interactive CTA Widget & Contact System

**Objective**: Create a comprehensive contact and engagement system with multi-step surveys and email integration.

#### 🟥 Critical

- [x] Implement interactive CTA widget
  - **User Intent**: Provide engaging way for visitors to contact Veloz
  - **Acceptance Criteria**:
    - Multi-step form with smooth transitions
    - Email integration working properly
    - Form data stored in Firestore
    - Responsive design on all devices
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Add EmailJS integration
  - **User Intent**: Enable reliable email delivery for contact form submissions
  - **Acceptance Criteria**:
    - Emails sent successfully to admin
    - Proper error handling for failed sends
    - Email templates configured correctly
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Add Firestore contact storage
  - **User Intent**: Store contact form submissions for admin review
  - **Acceptance Criteria**:
    - Contact data stored in Firestore
    - Admin can view all submissions
    - Data properly structured and searchable
  - **PO Sign-Off**: PO Approved (2025-01-16)

#### 🟧 High

- [x] Add location text field
  - **User Intent**: Capture client location for better service planning
  - **Acceptance Criteria**:
    - Location field in contact form
    - Data properly validated and stored
    - Admin can view location information
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Create services checkboxes
  - **User Intent**: Allow clients to specify which services they need
  - **Acceptance Criteria**:
    - Service checkboxes in contact form
    - Multiple selections allowed
    - Data properly stored and displayed to admin
  - **PO Sign-Off**: PO Approved (2025-01-16)

#### 🟨 Medium

- [x] Add widget analytics tracking
  - **User Intent**: Track widget usage and conversion rates
  - **Acceptance Criteria**:
    - Analytics events fired for widget interactions
    - Conversion tracking implemented
    - Data available in analytics dashboard
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Add responsive design
  - **User Intent**: Ensure widget works well on all device sizes
  - **Acceptance Criteria**:
    - Widget responsive on mobile, tablet, desktop
    - Touch-friendly interactions on mobile
    - Consistent appearance across devices
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Add accessibility features
  - **User Intent**: Make widget accessible to users with disabilities
  - **Acceptance Criteria**:
    - Keyboard navigation support
    - Screen reader compatibility
    - ARIA labels and roles properly set
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Add CSP compliance
  - **User Intent**: Ensure widget works with security policies
  - **Acceptance Criteria**:
    - No CSP violations from widget
    - All resources load properly
    - Security policies respected
  - **PO Sign-Off**: PO Approved (2025-01-16)

- [x] Add phone input field
  - **User Intent**: Allow clients to provide phone number for contact
  - **Acceptance Criteria**:
    - Phone field with proper validation
    - International format support
    - Data stored and displayed to admin
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] Create file upload component
  - **User Intent**: Allow clients to upload reference materials
  - **Acceptance Criteria**:
    - File upload functionality
    - File type validation
    - Progress indicators
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] Add file type validation
  - **User Intent**: Ensure only appropriate file types are uploaded
  - **Acceptance Criteria**:
    - Image and document formats accepted
    - Clear error messages for invalid files
    - File size limits enforced
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] Add file size validation
  - **User Intent**: Prevent oversized file uploads
  - **Acceptance Criteria**:
    - Maximum file size enforced
    - Clear error messages for oversized files
    - Progress tracking for large uploads
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] Add Zoom call checkbox
  - **User Intent**: Allow clients to request video consultation
  - **Acceptance Criteria**:
    - Zoom call option in form
    - Data properly stored
    - Admin notification for Zoom requests
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] Add communication preference toggle
  - **User Intent**: Allow clients to specify preferred contact method
  - **Acceptance Criteria**:
    - Toggle between call, WhatsApp, and email
    - Default selection (email)
    - Data properly stored and sent to admin
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] Replace zoom checkbox with communication preference option and add conditional validation
  - **User Intent**: Improve form UX by integrating zoom option into communication preferences with smart validation
  - **Acceptance Criteria**:
    - Zoom option added to communication preference buttons
    - Conditional validation based on selected communication method
    - Email requires email but not phone
    - Call/WhatsApp require phone but not email
    - Zoom requires either email or phone (at least one)
    - Form labels show required/optional status dynamically
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟩 Low

- [ ] Add form submission loading states
  - **User Intent**: Provide feedback during form submission
  - **Acceptance Criteria**:
    - Loading indicators during submission
    - Disabled form during processing
    - Success/error feedback

- [ ] Add offline form submission handling
  - **User Intent**: Allow form submission when offline
  - **Acceptance Criteria**:
    - Form data cached when offline
    - Automatic submission when connection restored
    - User notified of offline status

- [ ] Add form submission analytics
  - **User Intent**: Track form completion rates and drop-offs
  - **Acceptance Criteria**:
    - Step-by-step analytics tracking
    - Drop-off point identification
    - Conversion rate metrics

#### 🧠 Discovered During the Epic

- [ ] Add contact message export feature
  - **User Intent**: Allow admin to export contact data for external processing

### ✅ Completed

- [x] Implement interactive CTA widget (2025-01-16)
- [x] Add EmailJS integration (2025-01-16)
- [x] Add Firestore contact storage (2025-01-16)
- [x] Add location text field (2025-01-16)
- [x] Create services checkboxes (2025-01-16)
- [x] Add widget analytics tracking (2025-01-16)
- [x] Add responsive design (2025-01-16)
- [x] Add accessibility features (2025-01-16)
- [x] Add CSP compliance (2025-01-16)
- [x] Add phone input field (2025-01-20)
- [x] Create file upload component (2025-01-20)
- [x] Add file type validation (2025-01-20)
- [x] Add file size validation (2025-01-20)
- [x] Add Zoom call checkbox (2025-01-20)
- [x] Add communication preference toggle (2025-01-20)
- [x] Replace zoom checkbox with communication preference option and add conditional validation (2025-01-20)

---

### 🧱 EPIC: Analytics & Performance

**Objective**: Implement comprehensive analytics, monitoring, and performance optimization for the platform.

#### 🟥 Critical

- [x] Set up Google Analytics 4 integration
  - **User Intent**: Track website usage and user behavior
  - **Acceptance Criteria**:
    - GA4 properly configured and tracking
    - No console errors from analytics
    - Data appearing in GA4 dashboard
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Create analytics event tracking system
  - **User Intent**: Track specific user interactions and conversions
  - **Acceptance Criteria**:
    - Custom events firing properly
    - Event data structured correctly
    - Events appearing in analytics dashboard
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Create Firestore analytics collections
  - **User Intent**: Store analytics data in Firestore for custom reporting
  - **Acceptance Criteria**:
    - Analytics collections created
    - Data properly structured
    - Security rules configured
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Implement analytics service layer
  - **User Intent**: Provide consistent analytics tracking across the application
  - **Acceptance Criteria**:
    - Service layer properly implemented
    - Consistent API for tracking events
    - Error handling for analytics failures
  - **PO Sign-Off**: PO Approved (2025-01-08)

#### 🟧 High

- [x] Create analytics dashboard UI
  - **User Intent**: Provide admin with visual analytics data
  - **Acceptance Criteria**:
    - Dashboard displays key metrics
    - Data updates in real-time
    - Responsive design for all devices
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Implement real-time analytics display
  - **User Intent**: Show current analytics data to admin
  - **Acceptance Criteria**:
    - Real-time data updates
    - No performance impact on dashboard
    - Accurate data display
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Integrate analytics tracking into project pages
  - **User Intent**: Track user engagement with project content
  - **Acceptance Criteria**:
    - Page views tracked
    - Time on page measured
    - Interaction events fired
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add analytics to media interactions
  - **User Intent**: Track how users interact with media content
  - **Acceptance Criteria**:
    - Media clicks tracked
    - Video plays tracked
    - Gallery interactions monitored
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Implement CTA interaction tracking
  - **User Intent**: Track conversion rates from CTA widget
  - **Acceptance Criteria**:
    - CTA opens tracked
    - Form submissions tracked
    - Conversion funnel monitored
  - **PO Sign-Off**: PO Approved (2025-01-08)

#### 🟨 Medium

- [x] Add session tracking system
  - **User Intent**: Track user sessions for better analytics
  - **Acceptance Criteria**:
    - Session start/end tracked
    - Session duration measured
    - Cross-page session continuity
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add project-specific analytics views
  - **User Intent**: Allow admin to analyze individual project performance
  - **Acceptance Criteria**:
    - Project-specific analytics available
    - Data filtered by project
    - Performance metrics per project
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Implement analytics export functionality
  - **User Intent**: Allow admin to export analytics data for external analysis
  - **Acceptance Criteria**:
    - Data export in CSV format
    - Date range selection
    - Export includes all relevant metrics
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add analytics charts and graphs
  - **User Intent**: Visualize analytics data for better insights
  - **Acceptance Criteria**:
    - Charts display data correctly
    - Interactive charts work properly
    - Responsive design for charts
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add crew member interaction tracking
  - **User Intent**: Track which crew members generate the most interest
  - **Acceptance Criteria**:
    - Crew member clicks tracked
    - Profile views monitored
    - Engagement metrics per crew member
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Implement error tracking
  - **User Intent**: Monitor application errors for debugging
  - **Acceptance Criteria**:
    - JavaScript errors tracked
    - Error context captured
    - Error alerts configured
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add media interaction metrics
  - **User Intent**: Track detailed media engagement patterns
  - **Acceptance Criteria**:
    - Media view counts tracked
    - Interaction duration measured
    - Popular media items identified
  - **PO Sign-Off**: PO Approved (2025-01-09)

- [x] Create analytics validation schemas
  - **User Intent**: Ensure analytics data quality and consistency
  - **Acceptance Criteria**:
    - Data validation rules implemented
    - Invalid data filtered out
    - Data quality metrics available
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Implement analytics data aggregation
  - **User Intent**: Provide summarized analytics data for better performance
  - **Acceptance Criteria**:
    - Data aggregated efficiently
    - Dashboard loads quickly
    - Aggregated data accurate
  - **PO Sign-Off**: PO Approved (2025-01-08)

#### 🟩 Low

- [x] Set up analytics data retention policies
  - **User Intent**: Manage analytics data storage and compliance
  - **Acceptance Criteria**:
    - Data retention rules configured
    - Old data automatically cleaned
    - Compliance with privacy regulations
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Set up analytics alerts
  - **User Intent**: Get notified of important analytics events
  - **Acceptance Criteria**:
    - Alert thresholds configured
    - Notifications sent properly
    - Alert management interface
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [x] Add A/B testing framework
  - **User Intent**: Test different content and layouts for optimization
  - **Acceptance Criteria**:
    - A/B test framework implemented
    - Test variants tracked properly
    - Statistical significance calculated
  - **PO Sign-Off**: PO Approved (2025-01-08)

- [ ] Add analytics monitoring
  - **User Intent**: Monitor analytics system health and performance
  - **Acceptance Criteria**:
    - System health monitoring
    - Performance metrics tracked
    - Alert system for issues

#### 🧠 Discovered During the Epic

- [ ] Track social feed engagement
  - **User Intent**: Monitor engagement with social media content
- [ ] Add lead quality scoring
  - **User Intent**: Automatically score leads based on engagement

### ✅ Completed

- [x] Set up Google Analytics 4 integration (2025-01-08)
- [x] Create analytics event tracking system (2025-01-08)
- [x] Create Firestore analytics collections (2025-01-08)
- [x] Implement analytics service layer (2025-01-08)
- [x] Create analytics dashboard UI (2025-01-08)
- [x] Implement real-time analytics display (2025-01-08)
- [x] Integrate analytics tracking into project pages (2025-01-08)
- [x] Add analytics to media interactions (2025-01-08)
- [x] Implement CTA interaction tracking (2025-01-08)
- [x] Add session tracking system (2025-01-08)
- [x] Add project-specific analytics views (2025-01-08)
- [x] Implement analytics export functionality (2025-01-08)
- [x] Add analytics charts and graphs (2025-01-08)
- [x] Add crew member interaction tracking (2025-01-08)
- [x] Implement error tracking (2025-01-08)
- [x] Add media interaction metrics (2025-01-09)
- [x] Create analytics validation schemas (2025-01-08)
- [x] Implement analytics data aggregation (2025-01-08)
- [x] Set up analytics data retention policies (2025-01-08)
- [x] Set up analytics alerts (2025-01-08)
- [x] Add A/B testing framework (2025-01-08)
- [x] Add device breakdown metrics (2025-01-20)

---

### 🧱 EPIC: Enhanced User Experience & Interface

**Objective**: Improve user engagement and conversion through enhanced UI/UX features

#### 🟧 High

- [x] Add interactive project timeline
  - **User Intent**: Provide visual representation of project process and build trust
  - **Acceptance Criteria**:
    - Timeline shows project phases with dates
    - Interactive expandable details for each phase
    - Smooth animations and responsive design
    - Call-to-action for potential clients
  - **Notes**: Implemented with Framer Motion animations, responsive design, and Spanish localization
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟨 Medium

- [ ] Add before/after image comparison
  - **User Intent**: Showcase editing skills and transformation capabilities
  - **Acceptance Criteria**:
    - Slider to compare original vs edited photos
    - Smooth transition animations
    - Mobile-friendly touch interactions
    - Before/after labels and descriptions

- [ ] Add virtual event planning tool
  - **User Intent**: Help clients visualize and plan their events
  - **Acceptance Criteria**:
    - Interactive event planning interface
    - Budget calculator and timeline planner
    - Service recommendations based on event type
    - Integration with contact form

#### 🟩 Low

- [ ] Add dark mode toggle
  - **User Intent**: Improve user experience with theme preference
  - **Acceptance Criteria**:
    - Dark/light theme toggle
    - Persistent theme preference
    - Smooth theme transitions
    - All components support both themes

### ✅ Completed

- [x] Add interactive project timeline (2025-01-20)

---

# Add new Epics below this line following the template above.

---

### 🧱 EPIC: Shareable Photo Book System

**Objective**: Create beautiful, shareable digital photo books for each project to increase client satisfaction and organic traffic.

**PRD Ref**: "Client Shareables – High-Impact Post-Project Features" section in new_features.md

#### 🟩 Low Priority (Post-Launch)

- [ ] Create photo book generation system
  - **User Intent**: Automatically generate beautiful digital photo books for each project
  - **Acceptance Criteria**:
    - Automated photo book creation from project images
    - Beautiful vertical scrollable layout or flipbook animation
    - Includes project title, date, and optional client quote
    - Embedded Veloz branding on intro/final pages
    - Public URL format: `https://veloz.com.uy/album/{project-slug}`
  - **Notes**: Should be integrated into CMS for automation and personalization

- [ ] Implement photo book customization features
  - **User Intent**: Allow clients to personalize their photo books
  - **Acceptance Criteria**:
    - Client can reorder photos in their book
    - Option to hide certain photos
    - Custom title and description fields
    - Preview functionality before finalizing
  - **Notes**: Optional feature to enhance client experience

- [ ] Add photo book sharing and analytics
  - **User Intent**: Track sharing and engagement with photo books
  - **Acceptance Criteria**:
    - Social sharing buttons (WhatsApp, Instagram, Facebook)
    - Analytics tracking for book views and shares
    - Referral tracking to identify new leads from shared books
    - Print request button integration
  - **Notes**: Critical for measuring ROI of the feature

- [ ] Create admin photo book management
  - **User Intent**: Allow admin to manage and customize photo books
  - **Acceptance Criteria**:
    - Admin can select which photos to include
    - Manual curation options for premium books
    - Template selection for different book styles
    - Client access management and permissions
  - **Notes**: Should integrate with existing admin panel

#### 🧠 Discovered During the Epic

- [ ] Add photo book templates
  - **User Intent**: Provide multiple design options for different project types
- [ ] Implement photo book printing service
  - **User Intent**: Offer physical printed versions of digital books

---

### 🧱 EPIC: Anniversary Reminder System

**Objective**: Implement automated anniversary reminders to re-engage clients and encourage repeat business.

**PRD Ref**: "Client Shareables – High-Impact Post-Project Features" section in new_features.md

#### 🟩 Low Priority (Post-Launch)

- [ ] Create anniversary reminder scheduling system
  - **User Intent**: Automatically send anniversary reminders exactly one year after events
  - **Acceptance Criteria**:
    - Automated scheduling based on project completion dates
    - Email and WhatsApp message delivery
    - Personalized content with project photos
    - Link to private or public album included
  - **Notes**: Should integrate with existing email system

- [ ] Design anniversary reminder content templates
  - **User Intent**: Create emotionally engaging anniversary messages
  - **Acceptance Criteria**:
    - "Hoy hace un año viviste esto..." messaging
    - Photo collage or thumbnail inclusion
    - Clear call-to-action buttons
    - Options for "Volvé a vivirlo" and "Pedí tus impresiones"
  - **Notes**: Content should be in Spanish and emotionally resonant

- [ ] Implement anniversary reminder analytics
  - **User Intent**: Track effectiveness of anniversary reminders
  - **Acceptance Criteria**:
    - Open rates and click-through tracking
    - Conversion tracking for follow-up services
    - A/B testing for different message formats
    - ROI measurement for the feature
  - **Notes**: Critical for optimizing the feature

- [ ] Create admin anniversary management interface
  - **User Intent**: Allow admin to manage and customize anniversary reminders
  - **Acceptance Criteria**:
    - View all scheduled anniversary reminders
    - Manual override and customization options
    - Client opt-out management
    - Reminder performance dashboard
  - **Notes**: Should integrate with existing admin panel

#### 🧠 Discovered During the Epic

- [ ] Add multi-year anniversary reminders
  - **User Intent**: Send reminders for 2-year, 5-year anniversaries
- [ ] Implement anniversary social media integration
  - **User Intent**: Automatically post anniversary content to social media

---

### 🧱 EPIC: Testimonial Carousel with Client Favorites

**Objective**: Create a public testimonial system that showcases client favorites and builds social proof.

**PRD Ref**: "Client Shareables – High-Impact Post-Project Features" section in new_features.md

#### 🟩 Low Priority (Post-Launch)

- [ ] Create testimonial collection system
  - **User Intent**: Collect and organize client testimonials with their favorite photos
  - **Acceptance Criteria**:
    - Client testimonial submission form
    - Photo selection interface for clients
    - Project title and category association
    - Admin approval workflow for testimonials
  - **Notes**: Should integrate with existing contact and project systems

- [ ] Design testimonial carousel component
  - **User Intent**: Display testimonials in an engaging, shareable format
  - **Acceptance Criteria**:
    - Responsive carousel with smooth animations
    - Image + quote card format
    - Project title and category display
    - Social sharing integration
  - **Notes**: Should match existing design system

- [ ] Implement testimonial public pages
  - **User Intent**: Create dedicated pages for testimonials
  - **Acceptance Criteria**:
    - Public `/testimonios` page with all testimonials
    - Individual testimonial pages (e.g., `/testimonios/martin-y-josefa`)
    - SEO optimization for testimonial pages
    - Integration with homepage slider
  - **Notes**: Should follow existing routing patterns

- [ ] Add testimonial analytics and sharing
  - **User Intent**: Track engagement and sharing of testimonials
  - **Acceptance Criteria**:
    - View and share analytics for each testimonial
    - Social media sharing buttons
    - Client sharing tracking
    - Lead generation from testimonial traffic
  - **Notes**: Critical for measuring feature effectiveness

#### 🧠 Discovered During the Epic

- [ ] Add video testimonial support
  - **User Intent**: Allow clients to submit video testimonials
- [ ] Implement testimonial categories and filtering
  - **User Intent**: Organize testimonials by project type or service
