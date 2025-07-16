# 🔄 Veloz Project Workflow

_Last updated: January 2025_

This document outlines the Agile development workflow used for the Veloz project, including task management, refinement processes, and quality assurance procedures.

---

## 🧩 Epic-Based Structure

### Epic Organization

All tasks must belong to an Epic. Each Epic includes:

- **Clear name** - Descriptive title that captures the feature area
- **Objective** - Goal or outcome the Epic aims to achieve
- **Tasks grouped by priority** - Organized by critical, high, medium, low priority
- **Discovered During Epic** - Tasks found while working on the Epic
- **Completed Tasks** - Finished tasks with completion dates

### Epic Format

```markdown
### 🧱 EPIC: [Epic Name]

**Objective**: [Clear goal or outcome]

#### 🟥 Critical

- [ ] [Task Title]
  - File: [fileName.ts]
  - Notes: [Optional context]

#### 🟧 High

- [ ] [Task Title]
  - File: [fileName.ts]
  - Notes: [Optional context]

#### 🟨 Medium

- [ ] [Task Title]
  - File: [fileName.ts]
  - Notes: [Optional context]

#### 🟩 Low

- [ ] [Task Title]
  - File: [fileName.ts]
  - Notes: [Optional context]

#### 🧠 Discovered During the Epic

- [ ] [Task Title]
  - File: [fileName.ts]
  - Notes: [Optional context]

### ✅ Completed

- [x] [Task Title] (YYYY-MM-DD)
```

---

## 📋 Task Status System

### Status Indicators

- **[ ]** - Not started
- **[~]** - In progress
- **[x]** - Completed
- **[!]** - Blocked

### Priority Levels

- **🟥 Critical** - Must be completed immediately, blocking other work
- **🟧 High** - Important for current sprint or milestone
- **🟨 Medium** - Should be completed soon, but not urgent
- **🟩 Low** - Nice to have, can be deferred

---

## 🔁 Agile Process for Tasks (Backlog → Done)

Each task must go through this process:

### 1. 🧽 Refine

**Purpose**: Ensure the task is clear and actionable before development begins.

**Activities**:

- Confirm that the task is clear and well-defined
- Ask clarifying questions if there is ambiguity
- Confirm the affected files or modules
- Check if there is related code to reuse
- Estimate complexity and effort
- Identify dependencies and blockers

**Questions to Ask**:

- What is the specific outcome we want?
- Which files/modules will be affected?
- Are there existing patterns or components to follow?
- What are the acceptance criteria?
- Are there any dependencies or blockers?

### 2. 📝 Write in `TASK.md`

**Purpose**: Document the task in the project's task tracking system.

**Required Information**:

- Epic name and objective
- Priority level (Critical/High/Medium/Low)
- Affected file/module
- State: `[~] In progress`
- Clear description and acceptance criteria
- Notes or context if needed

**If the task is too large**:

- Break into smaller sub-tasks
- Create a parent task with subtasks
- Ensure each subtask is independently testable

### 3. 🔨 Develop

**Purpose**: Implement the feature or fix according to project standards.

**Guidelines**:

- Follow project rules and structure from `PRD.md`
- Avoid unintended side-effects
- Add `# Reason:` comments when logic isn't obvious
- Use existing design patterns and components
- Maintain code quality and consistency
- Write self-documenting code with clear variable/function names

**Quality Standards**:

- Max file length: 500 LOC (split if longer)
- Prefer relative imports within packages
- Reuse existing code before creating new components
- Avoid duplication and commented-out code
- Use existing design/architecture patterns

### 4. 🧪 Test

**Purpose**: Ensure the implementation works correctly and doesn't break existing functionality.

**Testing Requirements**:

- Write or update unit tests for all new code
- Cover expected case, edge case, and failure case
- Include assertions to catch unexpected behavior early
- Tests go in `/tests`, mirroring app structure
- Use mock data only in tests, never in dev or production
- Confirm all tests pass before proceeding

**Test Coverage**:

- Unit tests for utility functions and components
- Integration tests for API endpoints and database operations
- E2E tests for critical user journeys
- Performance tests for new features that may impact speed

### 5. 🔍 PO Review

**Purpose**: Get Product Owner approval before closing the task.

**Review Process**:

- Submit the implementation for PO review
- The PO will:
  - Verify that requirements were met
  - Confirm completeness and quality
  - Check for any missed edge cases
  - Validate against business objectives
  - Add more tasks or corrections if necessary
- Only after approval, proceed to close

**Review Checklist**:

- [ ] Requirements fully implemented
- [ ] Code quality meets project standards
- [ ] Tests are comprehensive and passing
- [ ] No breaking changes to existing functionality
- [ ] Documentation updated if needed
- [ ] Performance impact assessed
- [ ] Security considerations addressed

### 6. ✅ Close

**Purpose**: Mark the task as complete and update project documentation.

**Activities**:

- Mark as `[x]` in `TASK.md` and move to "Completed" section
- Add completion date
- Add new tasks discovered during the work under "Discovered During Epic"
- Link or mention affected files when relevant
- Update any related documentation
- Archive or remove any temporary files created during development

---

## 💬 Handling Feedback and User Requests

### User Feedback or Bugs

**Immediate Actions**:

- Add as a note or sub-task under the relevant existing task
- Track under "Discovered During Epic" section
- Prioritize based on severity and impact
- Update task status to reflect new requirements

**Process**:

1. **Identify** - Which Epic does this feedback relate to?
2. **Assess** - Is this a bug, enhancement, or new feature?
3. **Prioritize** - How urgent is this feedback?
4. **Document** - Add to appropriate Epic in `TASK.md`
5. **Plan** - Determine if this affects current work or future planning

### New Feature Requests

**Process**:

- Add to `BACKLOG.md` under a relevant or new Epic
- If no Epic exists, create a draft Epic with objective and pending tasks
- Evaluate business impact and technical feasibility
- Prioritize against existing backlog items

**Backlog Management**:

- Review backlog monthly for prioritization
- Move high-impact items to active Epics
- Remove outdated or no-longer-relevant items
- Add new ideas as they emerge from user feedback or market research

### Direct User Requests

**When a user explicitly asks to work on something**:

- Mark the task as **top priority** in `TASK.md`
- Move from backlog into the active Epic section
- Make it the next focus of development unless blocked
- Update task status to `[~] In progress`

---

## 🛠️ Code Quality & Best Practices

### Development Standards

**Code Quality**:

- Prioritize simple, explicit solutions over cleverness
- Split logic into small methods (≤10 lines preferred)
- Use named constants for hardcoded values
- Think of edge cases, performance, and security at all times
- Follow the coding style of the project

**Documentation**:

- Update `README.md` when new features, dependencies, or setup steps change
- Comment non-obvious logic with `# Reason:` for intent
- Let code speak for itself; comments explain why, not what
- Use clear variable/function names over short ambiguous ones

**Security & Safety**:

- Never overwrite secrets without confirmation
- Never delete or modify code unless it is part of a tracked task
- Only use real, verified libraries/packages
- Follow security best practices for all new features

### AI Collaboration Rules

**Guidelines**:

- Only modify what's requested or clearly necessary
- Avoid introducing new tech/patterns unless strictly needed
- Don't modify formatting or whitespace unnecessarily
- Make file edits in single updates, not step-by-step changes
- Never remove or comment unrelated code
- Provide actual file links, not context copies

**Prohibited Practices**:

- No ad-hoc scripts in production code
- No stubs, fake logic, or data in dev/prod
- Avoid cleverness when clarity works
- Don't assume missing context - ask questions if uncertain

---

## 📊 Project Management Tools

### File Organization

```
/docs
  - PRD.md          # Product Requirements Document
  - TASK.md          # Active tasks organized by Epics
  - BACKLOG.md       # Unprioritized ideas and future features
  - WORKFLOW.md      # This document - Agile process guide

/src                 # Source code
/tests               # Test files
README.md            # Project overview and setup
```

### Task Tracking

**Primary Tools**:

- `TASK.md` - Active tasks and Epics
- `BACKLOG.md` - Future ideas and unprioritized features
- `PRD.md` - Project requirements and architecture

**Status Updates**:

- Update task status immediately when work begins
- Add completion dates when tasks are finished
- Document discoveries and new tasks as they emerge
- Keep Epic objectives and priorities current

---

## 🎯 Quality Gates

### Definition of Done

A task is considered complete when:

1. **Requirements Met** - All acceptance criteria satisfied
2. **Code Quality** - Follows project standards and best practices
3. **Testing Complete** - Unit, integration, and E2E tests passing
4. **Documentation Updated** - README, comments, and docs current
5. **PO Approval** - Product Owner has reviewed and approved
6. **No Breaking Changes** - Existing functionality remains intact
7. **Performance Acceptable** - No significant performance regressions
8. **Security Reviewed** - Security implications considered and addressed

### Review Checklist

Before marking any task as complete:

- [ ] All acceptance criteria met
- [ ] Code follows project standards
- [ ] Tests written and passing
- [ ] No linting errors
- [ ] Performance impact assessed
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] PO review completed
- [ ] No breaking changes to existing functionality

---

## 📈 Continuous Improvement

### Process Refinement

**Regular Reviews**:

- Monthly Epic retrospectives
- Quarterly process improvements
- Annual workflow optimization

**Feedback Collection**:

- Track process pain points
- Identify bottlenecks and inefficiencies
- Gather team feedback on workflow effectiveness
- Measure task completion rates and quality

**Adaptation**:

- Update workflow based on team feedback
- Refine processes based on project needs
- Incorporate lessons learned into future planning
- Maintain flexibility while ensuring consistency

---

## 🚨 Emergency Procedures

### Critical Issues

**Immediate Response**:

1. **Assess Impact** - How critical is the issue?
2. **Communicate** - Notify relevant stakeholders
3. **Prioritize** - Move to top of current Epic or create new Critical Epic
4. **Fix** - Implement solution following normal development process
5. **Verify** - Ensure fix resolves the issue completely
6. **Document** - Update task and add to lessons learned

### Blocked Tasks

**When a task is blocked**:

1. **Identify Blocker** - What is preventing progress?
2. **Escalate** - Bring to team attention immediately
3. **Plan Workaround** - Can work continue on other tasks?
4. **Update Status** - Mark as `[!] Blocked` in `TASK.md`
5. **Track Resolution** - Monitor blocker until resolved
6. **Resume Work** - Continue when blocker is cleared

---

This workflow ensures consistent, high-quality development while maintaining flexibility for project-specific needs. Regular review and refinement of this process helps the team work more efficiently and deliver better results.
