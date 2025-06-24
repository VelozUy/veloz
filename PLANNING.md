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

### 2. **About Us / FAQ Page**

- Accordion-style expandable questions (accessible UI)
- Each item has:
  - Question
  - Rich text answer
- CMS-editable FAQ items
- Additional static content:
  - Philosophy
  - Methodology (team-based approach)
  - Core values (editable, per language)

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

## 🔐 Admin Panel (Custom CMS)

- Route: `/admin` (protected by Firebase Auth)
- Layout: sidebar navigation with pages:
  - ✏️ Edit Homepage Texts (by language)
  - 🖼️ Manage Photo Gallery (CRUD)
  - 🎞️ Manage Video Gallery (CRUD)
  - ❓ Manage FAQs (sortable list)
  - 🌍 Language Toggle for all fields
- All inputs validated with **Zod**
- Route protection via middleware/guards

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

### Firestore Structure (Example)

```
/pages/home:
  headline: { es: "Capturamos lo irrepetible", en: "We capture the unrepeatable" }
/faqs:
  - id: "faq001"
    question: { en: "What kind of events do you cover?", es: "¿Qué tipo de eventos cubren?" }
    answer: {...}
/gallery/photos:
  - id: "img123"
    url: "..."
    tags: ["wedding"]
/gallery/videos:
  - id: "vid123"
    embedUrl: "https://vimeo.com/..."
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
