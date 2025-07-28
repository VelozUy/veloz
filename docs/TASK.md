# 📋 Veloz Project Tasks - Active Epics

_Last updated: 2025-07-25_

---

## 🧩 Epic-Based Task Tracking

### How to Use This File

- This file contains only **active epics** (2-3 at a time)
- Each epic references a detailed file in `docs/epics/`
- For full context, check the referenced epic file
- Completed epics are moved to `docs/COMPLETED.md`
- Future epics are in `docs/BACKLOG.md`

---

## 🎯 **ACTIVE EPICS**

### 🧱 EPIC: Enhanced Admin Project Management

**Reference**: `docs/epics/admin/enhanced-admin-project-management.md`
**Objective**: Improve admin project management with advanced features and better UX
**Status**: Active (Week 2 of 4)
**Business Impact**: HIGH
**User Value**: HIGH

#### 🟥 Critical (This Week)

- [x] Project contact tab system implementation
  - File: `src/app/admin/projects/[id]/page.tsx`
  - Notes: See epic file for full context
  - Estimated Time: 3 days
  - Status: ✅ **COMPLETED** - Contact tab added to project edit page with full CRUD functionality

#### 🟧 High (Next Week)

- [ ] Admin contacts page redesign
  - File: `src/app/admin/contacts/page.tsx`
  - Notes: See epic file for full context
  - Estimated Time: 2 days

### 🧱 EPIC: Crew Media Assignment System

**Reference**: `docs/epics/admin/crew-media-assignment-system.md`
**Objective**: Implement system for assigning media to crew members
**Status**: Active (Week 1 of 3)
**Business Impact**: HIGH
**User Value**: MEDIUM

#### 🟥 Critical (This Week)

- [ ] Media assignment interface
  - File: `src/components/admin/CrewMediaAssignment.tsx`
  - Notes: See epic file for full context
  - Estimated Time: 2.5 days

#### 🟧 High (Next Week)

- [ ] Assignment validation and error handling
  - File: `src/lib/crew-media-validation.ts`
  - Notes: See epic file for full context
  - Estimated Time: 1.5 days

### 🧱 EPIC: Default Project Tasks System

**Reference**: `docs/epics/admin/default-project-tasks-system.md`
**Objective**: Implement system for default project tasks and templates
**Status**: Active (Week 1 of 2)
**Business Impact**: MEDIUM
**User Value**: HIGH

#### 🟥 Critical (This Week)

- [ ] Default task templates implementation
  - File: `src/components/admin/DefaultTaskTemplates.tsx`
  - Notes: See epic file for full context
  - Estimated Time: 2 days

---

## 📊 **Epic Status Summary**

| Status                 | Count | Epics                                                                           |
| ---------------------- | ----- | ------------------------------------------------------------------------------- |
| 🔴 **CRITICAL**        | 3     | Enhanced Admin Project Management, Crew Media Assignment, Default Project Tasks |
| ⭐ **HIGH PRIORITY**   | 3     | Ready to start when current epics complete                                      |
| 🟧 **MEDIUM PRIORITY** | 7     | Future development                                                              |
| ✅ **COMPLETED**       | 9     | Archived in `docs/COMPLETED.md`                                                 |

**Total Active Epics**: 3

---

## 🔗 **Quick Navigation**

- **Completed Epics**: `docs/COMPLETED.md`
- **Future Epics**: `docs/BACKLOG.md`
- **Epic Templates**: `docs/epic-templates/epic-template.md`

---

## 📝 **Notes**

- Keep this file under 500 lines
- Move completed epics to `docs/COMPLETED.md` immediately
- Use reference system for detailed context
- Rotate active epics based on priority and business impact
