# Veloz Project Requirements

## PROJECT OVERVIEW

**Veloz** - Next.js 15 application with Firebase backend for event photography services.

## CRITICAL PROJECT CONSTRAINTS

### Theme System

- **NEVER** use hardcoded Tailwind colors: `slate-50`, `blue-600`, `text-slate-800`, `bg-background`
- **ALWAYS** use theme variables: `background`, `foreground`, `primary`, `card`, `muted`, `accent`, `border`
- Reference: `docs/THEME.md` for complete theme system
- Maintain zero border radius for modern flat design

### Firestore Data Access

- **CRITICAL**: No real-time listeners (`onSnapshot`, `addSnapshotListener`)
- Use one-time queries only (`getDocs`, `getDoc`)
- Reason: Prevents Firestore internal assertion errors
- Reduce resource usage and ensure predictable loading

### Static Generation

- Build ALL pages as static at build time
- NO dynamic content generation
- Use `generateStaticParams` for dynamic routes
- Optimize for SEO and performance

### Component Architecture

- Max file length: 500 LOC
- Organize by feature/responsibility
- Use relative imports
- Reuse existing patterns
- Avoid code duplication

## UI/UX REQUIREMENTS

### Responsive Design

- Desktop: 64px separation from viewport borders (`px-16`)
- Mobile: Smaller margins acceptable
- Test on multiple screen sizes

### Form Design

- Required inputs: Prefix placeholder with asterisk (`*Email address`)
- Use theme colors for all form elements
- Implement proper validation
- Provide clear error messages

### Typography

- **NEVER** use REDJOLA font in bold (hard to read)
- Use Roboto for body text
- Maintain consistent font hierarchy
- Follow accessibility guidelines

### Animations

- Use Framer Motion for smooth animations
- Keep animations subtle and purposeful
- Ensure animations don't interfere with functionality
- Test animation performance

## PROJECT STRUCTURE

### Essential Files

- `docs/PRD.md` - Project requirements and architecture
- `docs/THEME.md` - Theme system guide
- `docs/TASK.md` - Active development tasks
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### Key Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Code quality check
npm run type-check   # TypeScript validation
```

### Environment Setup

- Node.js 18+ required
- npm or yarn package manager
- Git for version control
- Cursor IDE with auto mode enabled
- Firebase CLI for deployment

## BRAND GUIDELINES

### Core Concepts

- Elegance, Warmth, Effectiveness, Optimization, Agility, Boldness
- Professional yet approachable design
- High-quality visual presentation
- Intuitive user experience

### Color Usage

- Use theme system exclusively
- Maintain brand consistency
- Ensure proper contrast ratios
- Follow accessibility standards

### Content Guidelines

- Professional photography focus
- Event documentation emphasis
- Client service orientation
- Quality and reliability messaging

## TECHNICAL REQUIREMENTS

### Performance

- Fast page load times
- Optimized images and assets
- Efficient data loading
- Minimal bundle size

### SEO

- Static generation for all pages
- Proper meta tags
- Structured data
- Optimized content structure

### Accessibility

- WCAG 2.1 AA compliance
- Proper contrast ratios
- Screen reader compatibility
- Keyboard navigation support

### Security

- Input validation
- Secure data handling
- Environment variable usage
- Regular security updates

## DEVELOPMENT WORKFLOW

### Task Management

- Use epic-based organization
- Reference `docs/TASK.md` for active tasks
- Update task status: [ ] → [~] → [x]
- Archive completed epics to `docs/COMPLETED.md`

### Code Quality

- TypeScript strict mode
- ESLint compliance
- Unit test coverage
- Code review process

### Documentation

- Update relevant docs when making changes
- Add inline comments for complex logic
- Maintain clear commit messages
- Reference epic files for context

---

_Veloz Project Requirements v1.0_
_Use with CURSOR_GENERIC_AI_RULES.md for complete development guidelines_
_Last updated: 2025-01-27_
