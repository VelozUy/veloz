🏢 Company & App Description

Veloz is a company specialized in capturing moments from events — social, corporate, cultural, and beyond — through high-quality photo and audiovisual documentation. What makes Veloz unique is its production model: it breaks down the entire workflow (client intake, shooting, curation, editing, delivery) into specialized roles, handled by different professionals. This results in faster delivery, higher quality, and better scalability than traditional freelance-only models.

The web application’s primary goal is to communicate Veloz’s professionalism and warmth through a visually elegant and intuitive experience. It enables visitors to preview the work, understand the values behind the brand, and submit a service request without friction. Internally, it includes a custom admin panel (CMS) to allow the team to update content and media easily, while supporting multiple languages.

## 🧱 Overall Architecture

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

## 🌍 Multilanguage Support

- Library: **i18next + react-i18next**
- Initial supported languages: Spanish (es), English (en), Portuguese (pt), French (fr), Chinese (zh)
- Content model in Firestore will store localized fields per entry (e.g. `title.en`, `title.es`, ...)

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

### 4. **Work With Us** (Contact Form)

- Form fields:
  - Full Name
  - Email
  - Phone (optional)
  - Event Type (dropdown)
  - Event Date (date picker)
  - Location (text field)
  - Required services (checkboxes: Photos / Videos / Both / Other)
  - Comments / Details
  - File upload (reference image or document)
  - Checkbox: "I’d like to schedule a Zoom call"
- On submit:
  - Send confirmation email to internal team
  - Optional confirmation screen/message for user

# wireframes

[ Page Title: Let's work together ]

[ Full Name ] [ Input ]
[ Email ] [ Input ]
[ Phone ] [ Optional Input ]
[ Event Type ] [ Dropdown ]
[ Event Date ] [ Date Picker ]
[ Location ] [ Input ]
[ Services Needed ] [ ☐ Photos ☐ Videos ☐ Both ☐ Other ]
[ Comments ] [ Multiline Text Area ]
[ Upload Reference ] [ File Upload ]
[ Schedule a Zoom ] [ Checkbox ]

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
    /projectMedia: [subcollection]
      - mediaId: { type: "photo|video", url: "...", caption: {...} }

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
npm run build:data   # Fetches FAQs from Firestore and generates static files
```

---

## ✉️ Contact Form Submission

- Implementation Options:
  - Use **EmailJS** (no backend needed)
  - OR custom API route using **Nodemailer** (requires SMTP credentials)
- Optional: log submissions to Firestore
- Optional: store uploaded files in Firebase Storage

---

## 🧪 Dev Utilities & Tooling

- **shadcn/ui** → High-quality components built on Radix UI with excellent accessibility
- **React Hook Form** → Performant forms with easy validation (works great with shadcn/ui)
- **Framer Motion** → transitions for modals, page entrances
- **Zod** → schema validation for forms and CMS
- **Husky** → pre-commit hooks
- **ESLint + Prettier** → code style enforcement
- **Netlify CI/CD** → auto-deploy from GitHub

---

## 📌 Next Steps

1. Design low-fidelity wireframes (Landing, FAQ, Gallery, Contact, Admin)
2. Set up Firebase project: Firestore rules, Auth providers, Storage bucket
3. Scaffold `/admin` layout with Firebase Auth and sidebar
4. Integrate Firestore reads/writes for one content type (FAQ)
5. Configure `i18next` with basic translation loading
6. Set up domain veloz.com.uy in Netlify DNS
7. Define image/video hosting strategy (Cloudinary vs Firebase Storage)
