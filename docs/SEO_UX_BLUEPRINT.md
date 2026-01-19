# SEO + UX Improvement Blueprint

Purpose: guide incremental fixes to Lighthouse issues while preserving `/en` and `/pt`. Each task has a status and must follow the guardrails:

- Before completing a task: run lint + tests (see checklist per task).
- After completing a task: commit the code with a clear Conventional Commit message.

Status values: `pending`, `in_progress`, `done`

## Global Guardrails

- Do not remove `/en` or `/pt` routes.
- Each task must ensure `npm run lint` and `npm run type-check` pass.
- Run relevant tests (`npm test` or specific ones) before marking `done`.
- Commit after each task is completed.

## Task List

### 1) Stabilize locale routing for `/en` and `/pt`

Status: done
Goal: All locale routes return 200 and are linked properly.
Checklist:

- Implement or fix locale routing for `/en` and `/pt`, plus `/about`, `/contact`, `/our-work`.
- Ensure locale links/prefetches only point to valid routes.
- Validate all locale URLs return 200.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
- `npm test` (or targeted tests for routing)
  Commit after done:
- Example: `fix(i18n): stabilize en/pt routing`

### 2) Remove hardcoded CSS link causing MIME errors

Status: done
Goal: Eliminate console errors from invalid CSS URL.
Checklist:

- Remove the manual link to `/_next/static/css/app/layout.css` in `src/app/layout.tsx`.
- Confirm CSS is injected only via Next build.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
  Commit after done:
- Example: `fix(app): remove invalid css link`

### 3) SEO foundations for multi-locale

Status: done
Goal: Strong SEO signals across locales.
Checklist:

- Add `hreflang` tags for `es`, `en`, `pt` with self-referencing alternates.
- Ensure unique title/description per locale.
- Add canonical URLs per locale.
- Generate/update locale-aware sitemaps and `robots.txt`.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
- `npm test` (or relevant sitemap/metadata tests)
  Commit after done:
- Example: `feat(seo): add hreflang and locale canonicals`

### 4) Remove redirect penalty on home

Status: done
Goal: Avoid Lighthouse redirect waste on the home page.
Checklist:

- Ensure Lighthouse hits the final URL directly (no locale redirect loops).
- Align canonical and internal links to the final URL.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
  Commit after done:
- Example: `fix(seo): eliminate home redirect chain`

### 5) LCP optimization for hero image

Status: done
Goal: Reduce LCP below 2.5s by prioritizing the hero image.
Checklist:

- Add `priority` / `fetchpriority="high"` to LCP `Image`.
- Ensure `sizes` is accurate and image payload is optimized.
- Confirm LCP asset is served efficiently.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
  Commit after done:
- Example: `perf(images): prioritize hero LCP asset`

### 6) Reduce unused JS on home

Status: done
Goal: Reduce `unused-javascript` findings and bundle weight.
Checklist:

- Add bundle analysis and identify heavy modules.
- Move non-critical components to `next/dynamic`.
- Defer non-critical scripts.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
- `npm test` (or relevant tests for dynamic imports)
  Commit after done:
- Example: `perf(js): reduce home bundle weight`

### 7) Reduce render-blocking CSS

Status: done
Goal: Minimize render-blocking CSS on home.
Checklist:

- Keep global CSS minimal; move page-specific styles local.
- Ensure Tailwind purge is effective.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
  Commit after done:
- Example: `perf(css): reduce render-blocking styles`

### 8) Improve caching headers for fonts/static assets

Status: done
Goal: Increase cache lifetimes for fonts and favicon.
Checklist:

- Add `Cache-Control: public, max-age=31536000, immutable` for fonts and `favicon.svg`.
- Verify headers via deployment config (Next/Netlify).
  Required checks before done:
- `npm run lint`
- `npm run type-check`
  Commit after done:
- Example: `perf(cache): extend static asset caching`

### 9) Source maps policy

Status: done
Goal: Decide if production source maps are shipped.
Checklist:

- If enabled, set `productionBrowserSourceMaps`.
- If disabled, document the decision.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
  Commit after done:
- Example: `chore(build): set prod source map policy`

### 10) Clean up unused preconnects

Status: done
Goal: Keep only relevant preconnect hints.
Checklist:

- Remove unused `rel=preconnect` entries that do not serve critical assets.
- Keep 2-4 essential origins.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
  Commit after done:
- Example: `perf(head): prune unused preconnects`

### 11) Verification and Lighthouse re-run

Status: done
Goal: Confirm improvements and track scores.
Checklist:

- Run Lighthouse without extensions and confirm `errors-in-console` is clean.
- Verify `/en` and `/pt` return 200.
- Confirm LCP improvements and no redirect waste.
  Required checks before done:
- `npm run lint`
- `npm run type-check`
- `npm test`
  Commit after done:
- Example: `chore(lighthouse): re-run audit and document results`
