Project Agent Guide (Codex CLI)

Purpose

- Define consistent assistant behavior for this repo while keeping context lean.
- Load extra rules only when needed; avoid auto-loading large files.

Context Loading Policy

- Default context: only this file.
- Load on demand by task type (use these file references when relevant):
  - UI/UX rules: `.cursor/rules/design.mdc:1`
  - Backlog/process guide: `Untitled-2:1`
  - Active tasks: `docs/TASK.md:1` (if present)
  - Backlog: `docs/BACKLOG.md:1` (if present)
  - Requirements/spec: `docs/VELOZ_PROJECT_REQUIREMENTS.md:1` (when feature scope or acceptance criteria are unclear)
- Do not auto-load entire folders; reference only the files above as needed.

Persona & Interaction Style

- Concise, direct, and friendly; prioritize actionable guidance.
- Ask before running destructive actions or making wide refactors.
- Prefer minimal diffs; follow existing patterns and style.

Execution Rules (Codex CLI)

- Search: use `rg` (ripgrep), e.g., `rg -n -S "pattern" path/`.
- Edits: use `apply_patch` with focused changes.
- Planning: use `update_plan` for multi-step or ambiguous work.
- Scripts: run via shell (e.g., `npm run test|lint|type-check`).
- Do not commit or create branches unless explicitly requested.

UI/UX Quick Rules (load `.cursor/rules/design.mdc:1` for full details)

- Visual hierarchy: typographic scale; consistent design tokens; avoid hardcoded colors.
- Accessibility: WCAG 2.1 AA contrast; semantic HTML; keyboard navigable; clear focus states; descriptive `alt`.
- Responsive: mobile-first; CSS Grid/Flexbox; fluid units; sensible breakpoints.
- Performance: optimize images (Next.js Image where applicable), lazy-load non-critical media, code-split where helpful.
- Feedback: clear loading and error states; unobtrusive animations; consistent components.

Process Conventions (load `Untitled-2:1` for full details)

- Files and limits: keep `docs/TASK.md` ≤ 500 lines; `docs/BACKLOG.md` ≤ 1000 lines; archive completed epics promptly.
- Status markers: `[ ]` not started, `[~]` in progress, `[x]` completed, `[!]` blocked, `[>]` moved, `[?]` needs clarification.
- Epic hygiene: only 2–3 active epics in `docs/TASK.md`; move completed items to `docs/COMPLETED.md`.

Quality Gates

- Tests: add/update unit tests for changed logic when applicable; run `npm test` if available.
- Type safety: run `npm run type-check` (TypeScript projects).
- Linting: run `npm run lint`; fix critical issues tied to the change.
- A11y: verify keyboard access and focus states; ensure alt text and ARIA where needed.
- Perf: prefer smaller, composable components; avoid unnecessary re-renders; lazy-load expensive parts.

File & Code Conventions

- Keep files small and cohesive (aim ≤ 500 LOC); split when appropriate.
- Use clear naming; avoid one-letter variables; reuse existing utilities.
- Follow existing directory structure and import style; prefer relative imports when consistent with the codebase.
- Never include secrets; do not overwrite secret values.

Security & Safety

- Avoid introducing new dependencies unless necessary and approved.
- Never remove unrelated code or change behavior outside the task scope.
- For potentially destructive actions (e.g., file deletions, resets), pause and confirm first.

How To Work With This Guide

- Start with AGENTS.md only. Bring in:
  - `.cursor/rules/design.mdc:1` for UI or design-related tasks.
  - `Untitled-2:1` for backlog/process conventions or task hygiene.
  - `docs/TASK.md:1` / `docs/BACKLOG.md:1` / `docs/VELOZ_PROJECT_REQUIREMENTS.md:1` when the task explicitly references them.
- Keep output succinct; use bullets; show file paths and line anchors when citing sources.
