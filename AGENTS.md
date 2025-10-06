# Repository Guidelines

## Project Structure & Module Organization

- Next.js App Router lives in `src/app`; shared UI sits in `src/components`, with Tailwind tokens and Radix primitives.
- Core logic and data helpers live in `src/lib`, `src/data`, `src/services`, and `src/hooks`; static assets land in `public/`.
- Jest specs live under `src/__tests__` (unit, integration) while Playwright end-to-end suites are in `tests/e2e/`.
- Server-side utilities and background tasks reside in `functions/`; workflow docs stay in `docs/` (see `docs/WORKFLOW.md`).

## Build, Test, and Development Commands

- `npm run dev` launches the Next dev server on `http://localhost:3000`.
- `npm run build` runs `scripts/build-production.js`; use `build:dev`, `build:data`, or `build:split-content` for targeted rebuilds.
- `npm run lint` / `npm run lint:fix` execute ESLint via Next; `npm run format` / `format:check` wrap Prettier.
- `npm run type-check` runs `tsc --noEmit`.
- `npm test`, `npm run test:integration`, and `npm run test:coverage` keep Jest suites green; `npm run e2e` drives Playwright.

## Coding Style & Naming Conventions

- TypeScript-first codebase; prefer functional React components in PascalCase (`FeatureCard`).
- Follow Tailwind utility patterns and design tokens; avoid hardcoded color values.
- Keep modules focused (<500 LOC); colocate hooks under `src/hooks` and service clients in `src/services`.
- Formatting is governed by Prettier (2-space indent); lint-staged runs `eslint --fix`, `prettier --write`, and `npm run theme:check` before commits.

## Testing Guidelines

- Use Jest + Testing Library for unit/integration; mirror source paths and suffix files with `.test.ts(x)`.
- Capture edge cases (happy, error, boundary) and update snapshots when UI shifts.
- Playwright specs belong in `tests/e2e`; run `npx playwright install` once per machine and gate UI changes with `npm run e2e` when relevant.
- Verify coverage parity for touched modules via `npm run test:coverage` before opening a PR.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`type(scope): summary`) as seen in recent history (`perf(seo): …`).
- Group related changes; explain intent, risks, and rollout notes in the body when work is non-trivial.
- Reference the corresponding item in `docs/TASK.md`, include acceptance-criteria verification, and attach UI diffs (screenshots or video) for visual updates.
- Confirm lint, type-check, and relevant tests locally; call out skipped checks with rationale if unavoidable.

## Security & Configuration Tips

- Never commit secrets—bootstrap env files with `npm run setup:env`.
- Use `scripts/clear-cache.js` before profiling performance or reproducing cache-sensitive bugs.
- Document any new dependency in the PR description and justify why it is required.
