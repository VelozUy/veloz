# Manual Testing Checklist

## Smoke Checks

- App starts without errors: `npm run dev` and visit `/`
- Core pages load: `/`, `/our-work`, `/about`, `/contact`
- No 404s for critical assets (fonts, CSS, images)

## Navigation & Routing

- Header/nav links work on desktop and mobile
- Back/forward navigation preserves state where expected
- Locale links resolve to valid pages

## Forms & Validation

- Contact form validates email/phone per contact method
- Required fields show clear errors with focus
- Submission disables inputs and shows loading state
- Success and error toasts/messages appear appropriately

## Accessibility

- Keyboard-only navigation covers all interactive controls
- Visible focus states on links/buttons/inputs
- Images have descriptive alt text; decorative images use empty alt
- Color contrast meets WCAG 2.1 AA (spot-check key components)

## Media & Gallery

- Homepage gallery loads progressively and animates smoothly
- Our Work grid renders 50 images without jank
- Lightbox opens and closes with ESC and click

## Performance (Spot Checks)

- LCP image loads quickly on homepage (under ~2.5s on fast network)
- No long main-thread stalls (>200ms) during initial render

## Admin (If applicable)

- Communications tabs render and switch without errors
- Templates tab loads and basic actions respond

## Regression Catchers

- No console errors in devtools
- No unexpected layout shifts on initial load
- Responsive layouts at 375px, 768px, 1024px, 1440px

---

How to use: Run before major releases, record findings in the epic file, and convert regressions into tasks.
