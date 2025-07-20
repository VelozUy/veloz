# Veloz - Professional Event Photography & Videography

A modern Next.js website for Veloz, a professional event photography and videography service that captures the unrepeatable through a unique team-based production model.

## ✨ Features

- **Modern Next.js 15** with App Router and TypeScript
- **Responsive Design** with Tailwind CSS and modern OKLCH color system
- **Component Library** using shadcn/ui with Radix UI primitives
- **Firebase Integration** for content management and file storage
- **Professional Landing Page** with video/image backgrounds and smooth animations
- **Comprehensive About/FAQ Page** with accordion-style questions
- **SEO Optimized** with proper meta tags and structured data
- **Accessibility First** with WCAG compliance and keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for backend services)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd veloz
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the environment template
   cp .env.example .env.local

   # Edit .env.local with your Firebase configuration
   # See ENVIRONMENT.md for detailed instructions
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build & Deploy

### Local Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Netlify Deployment

This project is optimized for Netlify deployment with automatic builds from Git.

#### Setup Steps:

1. **Connect Repository**
   - Create a Netlify account
   - Connect your Git repository
   - Netlify will auto-detect Next.js settings

2. **Configure Environment Variables**
   In your Netlify dashboard, add these environment variables:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NEXT_PUBLIC_OWNER_EMAIL=your_email@example.com
   ```

3. **Deploy**
   - Push to your main branch
   - Netlify will automatically build and deploy
   - Your site will be available at `https://your-site-name.netlify.app`

#### Build Configuration

The project includes a `netlify.toml` file with optimized settings:

- Next.js plugin for proper routing
- Security headers
- Static asset caching
- Performance optimizations

## 🛠️ Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── about/          # About/FAQ page
│   ├── contact/        # Contact form page
│   ├── gallery/        # Photo/video gallery
│   └── admin/          # Admin panel (CMS)
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── layout/        # Layout components (Hero, Navigation)
│   ├── forms/         # Form components
│   └── gallery/       # Gallery components
├── lib/               # Utility libraries
├── hooks/             # Custom React hooks
├── services/          # API and Firebase services
├── types/             # TypeScript type definitions
└── constants/         # App constants
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checks
```

### Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

## 🎨 Styling & Theme System

- **Tailwind CSS 4** for utility-first styling
- **NEW_THEME_2.css** with OKLCH Color System for modern, accessible colors
- **shadcn/ui** for consistent component design
- **Framer Motion** for smooth animations
- **Responsive Design** with mobile-first approach
- **WCAG AA Compliant** with built-in accessibility testing
- **Light/Dark Mode Support** with seamless theme switching

### Theme System

- **CSS Custom Properties**: All colors defined as semantic variables
- **OKLCH Color Space**: Modern color space for superior accuracy
- **Accessibility First**: WCAG AA compliance built-in
- **Performance Optimized**: Minimal bundle impact with instant theme switching

See [Theme System Guide](docs/THEME_SYSTEM_GUIDE.md) for detailed usage guidelines.

## 🔥 Firebase Setup

The project uses Firebase for:

- **Firestore** - Content management database
- **Storage** - Image and video file storage
- **Authentication** - Google OAuth for admin panel access

### Admin Panel Access

- **Owner Access**: Set your email in `NEXT_PUBLIC_OWNER_EMAIL` for permanent access
- **User Invitations**: Only invited users can access the admin panel
- **Google OAuth**: All users must sign in with Google accounts
- **User Management**: Invite and manage admin users at `/admin/users`

See `ENVIRONMENT.md` for detailed Firebase configuration instructions.

## 📋 Project Status

This project follows a structured Agile development approach with Epic-based task management. See our documentation for:

- 📋 **[Active Tasks](docs/TASK.md)** - Current work organized by Epics
- 📚 **[Project Requirements](docs/PRD.md)** - Architecture, goals, and constraints
- 🔄 **[Development Workflow](docs/WORKFLOW.md)** - Agile process and quality gates
- 📝 **[Feature Backlog](docs/BACKLOG.md)** - Future ideas and unprioritized features

### Current Status:

- ✅ Completed features
- 🚧 Current work in progress
- 📋 Upcoming tasks
- 🎯 Project roadmap

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Veloz. All rights reserved.

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.
