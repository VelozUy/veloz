# Agile Workflow for AI-Assisted Development

This document defines the official workflow for task management, development, and collaboration in AI-supported projects.

## Task Lifecycle (Backlog → Completion)

### 1. Refine

- Ensure the task is clear and well-defined
- Ask clarifying questions if needed
- Identify affected areas or related code to reuse

### 2. Register in `TASK.md`

- Add the task under the corresponding Epic
- Include:
  - Epic name
  - Priority level
  - Task state: `[~] In progress`
  - Metadata:
    - User Intent
    - Acceptance Criteria
    - (Optional) Prompt Used
    - (Optional) Blocked By / Depends On
    - (Optional) PRD Reference (e.g. heading or anchor)

### 3. Develop

- Follow project conventions defined in `cursor rules.md`
- Keep changes modular and reasoned
- Add inline `# Reason:` comments for non-obvious decisions

### 4. Test

- Add or update unit tests for:
  - Expected case
  - Edge case
  - Failure case
- Validate the full test suite

### 5. PO Review

- Submit for Product Owner review before closure
- PO must verify:
  - Requirements are fully met
  - Functionality and user intent are satisfied
  - Quality and security are acceptable
- PO must explicitly approve in `TASK.md`:
  - `PO Approved (YYYY-MM-DD)`

### 6. Close

- Mark task as `[x]` and move to the Completed section of `TASK.md`
- If new tasks emerge during implementation, list them under "Discovered During Epic"

---

## Handling User Feedback & Feature Requests

- **Feedback/Bugs**: Add to existing task (note or sub-task) and mark under "Discovered During Epic"
- **New Requests**:
  - Add to `BACKLOG.md` under the proper or new Epic
  - Create new Epic if needed with objective and placeholder tasks
- **If the user explicitly requests to work on something**, mark it as top priority in `TASK.md` and begin work

---

## Supporting Files Required

- `PRD.md`: Source of truth for requirements
- `TASK.md`: Active development and task state
- `BACKLOG.md`: Repository of all pending and future work

---

## Task Status Markers

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked

This workflow complements the rules and standards outlined in `cursor rules.md`.
Treat this file as your operational reference for working with tasks, AI prompts, and delivery.
