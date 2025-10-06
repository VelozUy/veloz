# Quality Gates

## Pre-PR Gates

- Lint clean: `npm run lint`
- Type checks pass: `npm run type-check`
- Unit tests green (or failing tests acknowledged): `npm run test:unit`
- Integration tests green for touched areas: `npm run test:integration`

## Pre-Release Gates

- All critical tests green (unit + integration)
- E2E happy-paths pass: `npm run e2e` (home, our-work, contact)
- Manual checklist completed with no unresolved P1 issues
- Lighthouse performance posture acceptable for key pages

## Severity Levels

- P1: Blocks core user flows; must fix before merge/release
- P2: Degraded UX; fix soon or add TODO with owner/date
- P3: Minor; track in backlog

## Reporting

- Include test scope, environment, and any waivers in PR description
- Link to relevant epic in `docs/epics/...`
