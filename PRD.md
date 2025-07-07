🏢 Company & App Description

Veloz is a company specialized in capturing moments from events — social, corporate, cultural, and beyond — through high-quality photo and audiovisual documentation. What makes Veloz unique is its production model: it breaks down the entire workflow (client intake, shooting, curation, editing, delivery) into specialized roles, handled by different professionals. This results in faster delivery, higher quality, and better scalability than traditional freelance-only models.

The web application's primary goal is to communicate Veloz's professionalism and warmth through a visually elegant and intuitive experience. It enables visitors to preview the work, understand the values behind the brand, and submit a service request without friction. Internally, it includes a custom admin panel (CMS) to allow the team to update content and media easily, while supporting multiple languages.

## 🧱 Overall Architecture

- **CRITICAL RULE: No Real-Time Listeners**
  - Real-time listeners (e.g., `onSnapshot`, `addSnapshotListener`, or any persistent Firestore subscription) **MUST NOT** be used in the web app or admin app.
  - All data access must use one-time queries only (`getDocs`, `getDoc`, etc.).
  - This is to prevent Firestore internal assertion errors, reduce resource usage, and ensure predictable data loading.

- **Frontend**: Next.js 15 (App Router)
- **Hosting**: Netlify
- **Backend** (Headless style):
  - Firebase Firestore → for content data (texts, images, videos)
  - Firebase Auth → to manage admin login
  - Firebase Storage → optional for image/video uploads

## 🎨 Aesthetic Guidelines

- Core brand concepts: _Elegance, Warmth, Effectiveness, Optimization, Agility, Boldness_
- Smooth animations: **Framer Motion**
- Styling framework: **Tailwind CSS** with **shadcn/ui** components
- Icons: **Lucide Icons** (clean and customizable)
- UI Components: **shadcn/ui** → High-quality, accessible components built on Radix UI

### 🎨 Theme System & Color Consistency

**CRITICAL RULE**: All components and pages MUST use the theme color system defined in `tailwind.config.ts` and `globals.css`.

**NEVER use hard-coded Tailwind colors like:**

- ❌ `slate-50`, `slate-100`, `blue-600`, `purple-500`, etc.
- ❌ `text-slate-800`, `bg-white`, `border-gray-200`, etc.

**ALWAYS use theme variables:**

- ✅ `background`, `foreground` for main colors
- ✅ `primary`, `primary-foreground` for brand colors
- ✅ `card`, `card-foreground` for card backgrounds
- ✅ `muted`, `muted-foreground` for secondary text
- ✅ `accent`, `accent-foreground` for highlights
- ✅ `border` for borders
- ✅ `destructive`, `destructive-foreground` for error states

**Benefits:**

- Automatic light/dark mode support
- Consistent brand colors across the entire application
- Easy theme updates and maintenance
- Better accessibility with proper contrast ratios

## 🌍 Multilanguage Support ✅ COMPLETED

- **Static Localized Routes Implementation**: Build-time content generation for SEO optimization
- **Supported Languages**: Spanish (es - base), English (en), Brazilian Portuguese (pt)
- **Build-Time Data Fetching**: `scripts/build-data.js` fetches all admin-editable content from Firestore
- **Static Content Generation**: Generates `content-es.json`, `content-en.json`, `content-pt.json` in `src/data/`
- **TypeScript Integration**: Auto-generated types in `src/lib/static-content.generated.ts`
- **Content Access**: `getStaticContent()` utility function for accessing localized content
- **SEO Benefits**: All content rendered at build time for optimal search engine crawlability
- **Performance**: No client-side translation loading, faster page loads
- **Future Ready**: Foundation prepared for full locale routing (/en, /es, /pt) implementation

---

## 🧠 Website Sections

### 1. **Landing Page**

- Full-screen background carousel or video loop (showcasing real events)
- Centered logo and headline (editable via CMS)
- Primary CTA buttons:
  - `About Us` → navigates to FAQ section
  - `Our Work` → navigates to curated gallery of photos/videos
  - `Work with Us` → opens contact form page

### 2. **About Us / FAQ Page** ✅ COMPLETED

- ✅ Accordion-style expandable questions (accessible UI with shadcn/ui)
- ✅ Each item has:
  - Question (multi-language: Spanish, English, Hebrew)
  - Rich text answer (multi-language support)
  - Category system (General, Servicios, Precios, etc.)
  - Publication status (draft/published)
  - Order management for sorting
- ✅ CMS-editable FAQ items (full CRUD interface in admin panel)
- ✅ SEO optimization:
  - Server-side rendering for better crawlability
  - JSON-LD structured data for FAQ rich snippets
  - Build-time static generation for optimal performance
- ✅ Additional static content:
  - Philosophy section
  - Methodology (team-based approach with 4-step workflow)
  - Core values (6 values with icons and descriptions)

# wireframes

[ Page Title: About Us ]

[ Static Intro Text ]

[ Accordion FAQ ]

> What kind of events do you cover? [+]
> How fast is delivery? [+]
> Can I choose who captures my event? [+]

[ Section: Our Philosophy ]
[ Section: Methodology (Icons/Steps) ]
[ Section: Our Values (Icon + Text Grid) ]

### 3. **Our Work** (Gallery)

- Filterable grid by event type:
  - Weddings, Birthdays, Live Shows, Corporate, Cultural, Others
- Photo gallery:
  - Hosted on Cloudinary or Firebase Storage
  - Admin-editable entries with caption, tags, etc.
- Video embeds:
  - Vimeo, YouTube, or Mux embeds
  - Stored in CMS with metadata (title, description, language)

# wireframes

[ Page Title: Our Work ]

[ Filter Bar ]
[ All | Weddings | Birthdays | Corporate | Cultural | Others ]

[ Mixed Media Grid ]
[ 🖼️ 🎞️ 🖼️ ]
[ 🎞️ 🖼️ 🎞️ ]
[ 🖼️ 🎞️ 🖼️ ]

- Photos and videos appear side by side in a single responsive grid.
- Media supports multiple aspect ratios: 1:1, 16:9, and 9:16.
- Videos display as preview thumbnails with play icon overlay.
- All media cards have hover effects and modal/lightbox on click.

### 3.5. **Enhanced Project & Crew Features** 🆕

#### 🧩 Modular Project Presentation

Each project now supports multiple layout templates that can be selected via the CMS. This allows Veloz to present each event with its own editorial structure — no two project pages need to look the same. Layouts can include combinations like:

- **Hero full-width image/video** - Immersive opening with large media
- **2-column grid with alternating media/text** - Story-driven narrative flow
- **Vertical story flow with annotated blocks** - Timeline-style presentation
- **Custom layouts** - Admin-defined combinations for unique projects

#### 🖼️ Custom Hero Media Ratios (Per Project Page)

Each individual project page supports a custom hero section where admins can select the most suitable media type and aspect ratio to highlight the project visually. Available formats include:

- **1:1** - Square format for portrait-style content
- **16:9** - Widescreen for cinematic video content
- **4:5** - Instagram-style portrait for social media optimization
- **9:16** - Mobile-first vertical content
- **Custom ratios** - Admin-defined dimensions for unique content

This flexibility allows matching the media's original composition and storytelling goals.

#### 🎨 Visual Category Cues (Project List & Project Page)

Each project can be tagged by event type (wedding, birthday, corporate, etc.), and the UI applies subtle visual differentiation using:

- **Typography styles** - Different font weights and sizes per category
- **Accent colors** - Category-specific color schemes
- **Visual indicators** - Icons, badges, or subtle background patterns

These visual cues appear both on the `/our-work` project listing and on individual project pages, enhancing consistency while reinforcing emotional and contextual alignment with each event.

#### 👥 Crew Section Per Project

Projects include a new "Meet the Team" section where admins can assign one or more crew members. Each crew member has:

- **Name** - Full name with proper formatting
- **Role** - Professional title or specialization
- **Portrait** - Professional headshot or team photo
- **Bio** - Multilingual professional background and expertise

This humanizes the work and builds trust with potential clients by showcasing the team behind each project.

#### 📁 Centralized Crew Management in CMS

A new section in the admin panel lets you manage all crew members in one place:

- **Add/edit crew profiles** - Complete CRUD operations for team members
- **Assign them to projects** - Link crew members to specific projects
- **Upload/update portraits** - Professional photo management
- **Multilingual bios** - Support for Spanish, English, and Portuguese

#### 🔗 Instagram-like Feed

Each project page includes a manually curated feed of social-style posts:

- **Images and videos** - Behind-the-scenes content
- **Captions** - Informal, engaging descriptions
- **Timeline layout** - Chronological or curated order
- **Social integration** - Optional links to actual social media posts

This lets you add informal or behind-the-scenes content alongside the main media layout, creating a more personal connection with visitors.

### 4. **Work With Us** (Contact Form)

## Contact Form Planning for Photo & Video Service Website

### Goal

Create a contact form that:

- Is friendly and non-intrusive
- Collects just enough information to respond effectively
- Feels conversational and trustworthy

### Recommended Fields

| Field              | Type               | Required | Notes                                                            |
| ------------------ | ------------------ | -------- | ---------------------------------------------------------------- |
| Name               | Short text         | Yes      | Adds a human touch to the conversation                           |
| Email              | Email              | Yes      | Main method of contact                                           |
| Event Type         | Dropdown / Buttons | Yes      | Options: Wedding, 15th Birthday, Birthday, Corporate, Other      |
| Approx. Date       | Date or Free text  | No       | Optional – helps but not mandatory                               |
| Message / Comments | Textarea           | No       | Prompt: "Tell us about your idea, location, number of guests..." |

### Button Text Suggestions

Avoid cold "Send" buttons. Use warmer CTAs like:

- "Start the conversation"
- "Ask for a quote"
- "I want you at my event"

### Extra (Optional) Fields

Only include if useful:

- Phone (only if you plan to use it)
- How did you find us?
- Preferred contact method: Email / WhatsApp

### Microcopy for Trust

Below the form or submit button:

> "We don't share your info. We'll only reach out to help with your event."

### Design Tips

- Keep validation minimal (only name and email required)
- Friendly placeholder text to inspire the user
- Use padding, icons, and soft colors to make the form feel approachable

---

## Interactive CTA Widget (Sticky Button Micro-Survey)

### Objective

Replace the classic top navbar "Contact" link with a **floating sticky button** that opens a conversational micro-survey, guiding users toward the right action in a friendly and engaging way.

### Behavior Flow

1. **Sticky Button** (desktop & mobile):
   - Visible on all pages
   - Text: `¿En qué evento estás pensando?`
   - Position: bottom-right corner, high z-index

2. **On Click → Open Micro-Survey:**

#### Step 1: Event Type

- Options: `Boda`, `Empresarial`, `Otro`

#### Step 2: Approximate Date

- Options: `Sí` → Date selector / `No`

#### Step 3: Want to tell us more?

- Options:
  - `Sí` → Navigate to `/contacto?evento=boda&fecha=2025-09-01`
    - URL query pre-fills form
    - Focus on textarea input
  - `Quiero que me llamen` → Show phone number input + send button

3. **If "Quiero que me llamen" is selected:**
   - Show phone number field
   - Show submit button
   - Send via email or save in database/API (e.g., Firebase)

### Technical Requirements

- Component built in **React + Tailwind CSS**
- Must support **query params** on contact page to pre-fill fields
- Responsive on all screen sizes
- Accessible and performant

This component improves user interaction and encourages conversions through a conversational, low-friction approach.

---

## 🔐 Admin Panel (Custom CMS) ✅ PARTIALLY COMPLETED

- ✅ Route: `/admin` (protected by Firebase Auth)
- ✅ Layout: sidebar navigation with pages:
  - ✅ Dashboard (main admin overview)
  - ✅ User Management (invite/manage admin users)
  - ✅ Projects Management (unified project-based content)
  - ✅ Edit Homepage Content (multi-language with media uploads)
  - ✅ Manage FAQs (full CRUD with categories, translation tracking)
  - 🚧 Gallery Management (being refactored into Projects)
  - 🌍 Language Toggle for all fields (Spanish priority)
- ✅ All inputs validated with **Zod**
- ✅ Route protection via Firebase Auth context
- ✅ Firestore security rules for role-based access

# wireframes

[ Sidebar Navigation ]

- 🏠 Dashboard
- ✏️ Edit Homepage
- 🖼️ Photo Gallery
- 🎞️ Video Gallery
- ❓ FAQ Manager
- 🌍 Language Settings

[ Main Panel ]
[ List of items or edit form ]
[ + Add New | 🖊️ Edit | 🗑️ Delete ]

[ Firebase Auth logout button ]

### Firestore Structure (Current Implementation)

```
/homepage:
  - content: { headline: { es: "...", en: "..." }, logo: "...", backgroundVideo: "..." }

/adminUsers:
  - email@domain.com: { status: "active", role: "admin", invitedBy: "..." }

/projects:
  - id: "proj123"
    title: { es: "Boda María & Juan", en: "María & Juan Wedding" }
    description: { es: "...", en: "..." }
    status: "published" | "draft"
    tags: ["wedding", "outdoor"]
    coverImage: "https://..."
    layoutTemplate: "hero" | "2-column" | "vertical-story" | "custom"
    heroRatio: "1:1" | "16:9" | "4:5" | "9:16" | "custom"
    crewMembers: ["crew123", "crew456"]
    /projectMedia: [subcollection]
      - mediaId: { type: "photo|video", url: "...", caption: {...} }
    /socialFeed: [subcollection]
      - postId: { type: "image|video", url: "...", caption: {...}, order: 1 }

/crewMembers:
  - id: "crew123"
    name: { es: "María García", en: "María García" }
    role: { es: "Fotógrafa Principal", en: "Lead Photographer" }
    portrait: "https://..."
    bio: { es: "...", en: "...", pt: "..." }
    socialLinks: { instagram: "...", linkedin: "..." }
    availability: "available" | "busy" | "unavailable"
    createdAt: timestamp
    updatedAt: timestamp

/faqs:
  - id: "faq001"
    question: { es: "¿Qué tipo de eventos cubren?", en: "What events do you cover?", he: "..." }
    answer: { es: "...", en: "...", he: "..." }
    category: "General"
    order: 1
    published: true
    createdAt: timestamp
    updatedAt: timestamp
```

---

## 🔍 SEO & Performance Optimizations ✅ COMPLETED

### Build-Time Data Fetching

- ✅ **Build Script**: `scripts/build-data.js` fetches FAQ data from Firestore at build time
- ✅ **Static Generation**: FAQ content embedded in HTML for optimal SEO
- ✅ **Hybrid Approach**: Build-time data for production, runtime fetching for development
- ✅ **ISR (Incremental Static Regeneration)**: Pages revalidate every hour

### SEO Features

- ✅ **JSON-LD Structured Data**: FAQ pages include Schema.org FAQPage markup for rich snippets
- ✅ **Server-Side Rendering**: All content rendered on server for search engine crawlability
- ✅ **Meta Tags**: Proper title, description, and OpenGraph tags for all pages
- ✅ **Multi-language SEO**: Spanish-first approach with fallbacks

### Build Process Integration

```bash
npm run build        # Runs build:data then next build
npm run build:data   # Fetches all content from Firestore and generates static files
```

### Static Content Structure

The build script generates:

- `src/data/content-es.json` - Spanish content (base language)
- `src/data/content-en.json` - English translations
- `src/data/content-pt.json` - Brazilian Portuguese translations
- `src/lib/static-content.generated.ts` - TypeScript definitions

Each content file includes:

- Homepage content (headlines, CTAs, media URLs)
- FAQ items with categories and translations
- Projects data with multilingual metadata
- Build metadata and timestamps

---

## ✉️ Contact Form & Message Management System

### Current Implementation (Phase 1)

- ✅ **EmailJS Integration** - Client-side email sending for immediate functionality
- ✅ **Interactive CTA Widget** - Conversational micro-survey for lead capture
- ✅ **Contact Form** - Friendly, non-intrusive form with validation

### Enhanced Backend System (Phase 2)

- **Firestore Collection**: `contactMessages` - Store all form submissions with metadata
- **Firebase Cloud Function**: `sendContactEmail` - Server-side email handling with Resend/Nodemailer
- **Admin Contact Management**: Full CRUD interface for message management
- **Email Service Priority**: Resend (preferred) with Nodemailer fallback
- **Message Lifecycle**: Pending → Archived workflow with admin controls

### Contact Message Data Structure

```typescript
interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  eventType: string;
  eventDate?: string;
  message?: string;
  source: 'contact_form' | 'widget';
  archived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Admin Contact Management Features

- **Message List View**: All messages with pagination and sorting
- **Filtering System**:
  - Status: Pending/Archived
  - Event Type: Wedding/Corporate/etc.
  - Date Range: Custom date filtering
  - Keyword Search: Across all fields
- **Message Actions**: Archive/Unarchive, view details, export data
- **Email Integration**: Direct reply-to functionality
- **Analytics**: Contact conversion tracking and response metrics

---

## 🧪 Dev Utilities & Tooling

- **shadcn/ui** → High-quality components built on Radix UI with excellent accessibility
- **React Hook Form** → Performant forms with easy validation (works great with shadcn/ui)
- **Framer Motion** → transitions for modals, page entrances
- **Zod** → schema validation for forms and CMS
- **Husky** → pre-commit hooks
- **ESLint + Prettier** → code style enforcement
- **Netlify CI/CD** → auto-deploy from GitHub

⚠️ Important: Use shadcn/ui components whenever possible for the React frontend. Do not create custom UI components from scratch unless necessary. Assume shadcn/ui is already installed and configured. Use components like <Button>, <Input>, <Textarea>, <Label>, <Card>, <Badge>, <Tabs>, etc.

---

## 🚀 Technical Architecture Deep Dive

### Frontend Architecture

**Next.js 15 App Router Structure:**

```
src/app/
├── (public) - Public pages with static generation
├── admin/ - Protected admin panel routes
├── api/ - API routes for dynamic functionality
└── globals.css - Global styles and theme variables
```

**Component Architecture:**

- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Composition Pattern**: Reusable components with flexible props
- **Theme Integration**: All components use design system tokens
- **Accessibility First**: ARIA labels, keyboard navigation, screen reader support

### Backend Services Architecture

**Firebase Services Integration:**

- **Firestore**: Primary data store with real-time capabilities
- **Firebase Auth**: User authentication and session management
- **Firebase Storage**: Media file storage with CDN delivery
- **Firebase Functions**: Serverless backend logic (email processing, webhooks)

**Data Flow Patterns:**

- **Build-time**: Static content generation for SEO
- **Runtime**: Dynamic content updates via admin panel
- **Hybrid**: Critical content at build-time, interactive features at runtime

### API Design Principles

**RESTful Endpoints:**

- `/api/contact` - Contact form submissions
- `/api/translate` - AI-powered translation service
- `/api/analyze-media` - Media analysis and SEO optimization
- `/api/webhook/n8n` - External workflow integration

**Response Format Standardization:**

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## 🎯 Performance & Optimization Strategy

### Performance Targets

**Page Load Performance:**

- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5 seconds

**Image Optimization:**

- **WebP/AVIF Format**: Automatic format selection based on browser support
- **Responsive Images**: Multiple sizes for different screen densities
- **Lazy Loading**: Images load only when needed
- **Progressive Enhancement**: Low-quality placeholders with high-quality overlays

**API Response Times:**

- **Firestore Queries**: < 500ms for simple queries
- **Image Upload**: < 2 seconds for 5MB files
- **Translation API**: < 3 seconds for batch operations
- **Media Analysis**: < 5 seconds for image analysis

### Optimization Techniques

**Build-time Optimizations:**

- **Static Generation**: Pre-render all public pages
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Remove unused code from bundles
- **Asset Optimization**: Minification and compression

**Runtime Optimizations:**

- **Caching Strategy**: Browser and CDN caching for static assets
- **Database Indexing**: Optimized Firestore queries with proper indexes
- **Image CDN**: Cloudinary for automatic image optimization
- **Service Worker**: Offline support and caching for critical resources

**Monitoring & Analytics:**

- **Core Web Vitals**: Real-time performance monitoring
- **Error Tracking**: Sentry integration for error monitoring
- **User Analytics**: Privacy-compliant usage tracking
- **Performance Budgets**: Automated performance regression detection

---

## 🧪 Testing Strategy & Quality Assurance

### Testing Pyramid

**Unit Tests (70% of test coverage):**

- **Component Testing**: React Testing Library for UI components
- **Utility Functions**: Jest for pure functions and helpers
- **Validation Schemas**: Zod schema testing with edge cases
- **Service Layer**: Firebase service mocking and testing

**Integration Tests (20% of test coverage):**

- **API Endpoints**: End-to-end API testing
- **Database Operations**: Firestore integration testing
- **Authentication Flow**: Login/logout and session management
- **Form Submissions**: Contact form and admin form testing

**E2E Tests (10% of test coverage):**

- **Critical User Journeys**: Homepage → Contact → Admin workflow
- **Cross-browser Testing**: Chrome, Firefox, Safari compatibility
- **Mobile Testing**: Responsive design and touch interactions
- **Accessibility Testing**: Screen reader and keyboard navigation

### Test Implementation

**Testing Framework Setup:**

```typescript
// Jest configuration with Next.js 15 support
// React Testing Library for component testing
// Firebase emulators for integration testing
// Playwright for E2E testing
```

**Test Data Management:**

- **Mock Data**: Consistent test data across all test types
- **Database Seeding**: Automated test data setup and cleanup
- **Environment Isolation**: Separate test environment from production
- **Test Utilities**: Reusable test helpers and assertions

**Quality Gates:**

- **Code Coverage**: Minimum 80% coverage for critical paths
- **Performance Regression**: Automated performance testing
- **Accessibility Compliance**: WCAG 2.1 AA standards
- **Security Scanning**: Automated vulnerability detection

---

## 🔒 Security & Compliance Requirements

### Authentication & Authorization

**Firebase Auth Implementation:**

- **Multi-factor Authentication**: Optional 2FA for admin users
- **Session Management**: Secure session tokens with expiration
- **Role-based Access**: Admin vs Editor permissions
- **Login Attempt Limiting**: Rate limiting for failed login attempts

**Data Protection:**

- **Input Validation**: Zod schemas for all user inputs
- **XSS Prevention**: Content Security Policy (CSP) headers
- **CSRF Protection**: Token-based CSRF protection
- **SQL Injection Prevention**: Parameterized queries (Firestore)

### Privacy & Compliance

**Data Privacy:**

- **GDPR Compliance**: User consent and data portability
- **Data Minimization**: Only collect necessary user data
- **Data Retention**: Automatic cleanup of old contact messages
- **User Rights**: Right to access, modify, and delete personal data

**Security Headers:**

```http
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### Infrastructure Security

**Firebase Security Rules:**

```javascript
// Firestore security rules with role-based access
// Storage rules for media upload protection
// Auth rules for user management
```

**Environment Security:**

- **Environment Variables**: Secure storage of API keys and secrets
- **Secret Management**: No hardcoded credentials in code
- **Network Security**: HTTPS-only communication
- **Error Handling**: No sensitive data in error messages

---

## 🚀 Deployment & DevOps Procedures

### CI/CD Pipeline

**Netlify Deployment Process:**

1. **Code Push**: Automatic deployment on main branch push
2. **Build Process**: `npm run build` with environment variables
3. **Static Generation**: Build-time data fetching from Firestore
4. **Asset Optimization**: Automatic image and code optimization
5. **Deployment**: Zero-downtime deployment with rollback capability

**Environment Management:**

```bash
# Development
npm run dev          # Local development server
npm run build:dev    # Development build with mock data

# Staging
npm run build:staging # Staging build with staging Firebase
npm run test:e2e     # E2E tests against staging

# Production
npm run build        # Production build with live data
npm run test:all     # Full test suite before deployment
```

### Monitoring & Alerting

**Performance Monitoring:**

- **Core Web Vitals**: Real-time performance tracking
- **Error Tracking**: Sentry integration for error monitoring
- **Uptime Monitoring**: 99.9% uptime target with alerting
- **Resource Usage**: Memory and CPU monitoring

**Deployment Safety:**

- **Pre-deployment Tests**: Automated testing before deployment
- **Rollback Strategy**: Quick rollback to previous version
- **Feature Flags**: Gradual feature rollout capability
- **Health Checks**: Automated health check endpoints

### Backup & Recovery Strategy

**Data Backup Procedures:**

- **Firestore Exports**: Daily automated backups to Google Cloud Storage
- **Media Assets**: CDN backup with multiple geographic locations
- **Configuration**: Version-controlled configuration files
- **Documentation**: Comprehensive deployment and recovery documentation

**Disaster Recovery:**

- **Recovery Time Objective (RTO)**: 4 hours maximum downtime
- **Recovery Point Objective (RPO)**: 24 hours maximum data loss
- **Backup Testing**: Monthly backup restoration testing
- **Incident Response**: Documented incident response procedures

---

## 📊 Monitoring & Analytics Strategy

### Performance Monitoring

**Real-time Metrics:**

- **Page Load Times**: FCP, LCP, CLS, TTI tracking
- **API Response Times**: Endpoint performance monitoring
- **Error Rates**: 4xx and 5xx error tracking
- **User Experience**: Core Web Vitals compliance

**Infrastructure Monitoring:**

- **Firebase Usage**: Firestore read/write operations
- **Storage Usage**: Media file storage and CDN performance
- **Function Performance**: Firebase Functions execution times
- **Cost Monitoring**: API usage and cost tracking

### User Analytics

**Privacy-compliant Analytics:**

- **Page Views**: Anonymous page view tracking
- **User Journeys**: Conversion funnel analysis
- **Feature Usage**: Admin panel usage analytics
- **Performance Impact**: User experience correlation

**Business Metrics:**

- **Contact Form Conversions**: Lead generation tracking
- **Content Engagement**: FAQ and gallery interaction rates
- **Admin Productivity**: Content management efficiency
- **SEO Performance**: Search engine ranking tracking

### Alerting & Notifications

**Critical Alerts:**

- **Service Downtime**: Immediate notification for outages
- **Error Spikes**: Unusual error rate increases
- **Performance Degradation**: Core Web Vitals below thresholds
- **Security Incidents**: Suspicious activity detection

**Operational Alerts:**

- **Backup Failures**: Automated backup process failures
- **Storage Limits**: Approaching storage capacity limits
- **Cost Thresholds**: API usage cost alerts
- **Deployment Issues**: Failed deployment notifications

---

## 📌 Next Steps

1. Design low-fidelity wireframes (Landing, FAQ, Gallery, Contact, Admin)
2. Set up Firebase project: Firestore rules, Auth providers, Storage bucket
3. Scaffold `/admin` layout with Firebase Auth and sidebar
4. Integrate Firestore reads/writes for one content type (FAQ)
5. Configure `i18next` with basic translation loading
6. Set up domain veloz.com.uy in Netlify DNS
7. Define image/video hosting strategy (Cloudinary vs Firebase Storage)
