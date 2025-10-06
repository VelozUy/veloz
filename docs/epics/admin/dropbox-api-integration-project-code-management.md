# EPIC: Dropbox API Integration with Project Code Management

## Epic Summary

As part of the Veloz Admin platform, implement an integration with the Dropbox API v2 that automatically manages project folder structures, project codes, and client delivery links. This ensures consistency, reduces manual errors, and streamlines the ingestion-to-delivery workflow.

## Business Value

- Automates creation of folder structures for every project.
- Guarantees unique and consistent project codes.
- Reduces overhead by centralizing project lifecycle management.
- Provides seamless sharing of final exports with clients.
- Aligns with Veloz’s value proposition of efficiency, optimization, and agility.

## Goals

- Generate a unique project code per project.
- Create a standardized Dropbox folder tree via API.
- Persist all project metadata in Firebase Firestore.
- Allow admins to generate, revoke, and manage shared links for delivery.
- Support future extension to B2 Backblaze for archiving.

## Acceptance Criteria

1. Creating a project in the admin generates a unique `projectCode` with the format: `VX{NNN}_{slug(eventName)}_{YYYY-MM-DD}`.
2. Dropbox API automatically provisions the following folder structure under `/{projectCode}`:

   RAW/IMAGEN
   RAW/VIDEO
   SELECTED/IMAGEN
   SELECTED/VIDEO
   EDITED/IMAGEN
   EDITED/VIDEO
   EXPORT/IMAGEN
   EXPORT/VIDEO
   DOCS
   ARCHIVE

3. Firestore stores:
   - Project metadata (eventName, eventDate, projectCode).
   - Dropbox paths (root, export).
   - Audit trail.
4. Admin can:
   - Generate or fetch a shared link for `/EXPORT`.
   - Revoke an existing shared link.
   - Audit all actions.
5. API handles idempotency: re-creating folders or links does not throw errors.

## Scope & Non-Goals

- In scope: Dropbox integration, project code generation, Firestore persistence, shared link management, admin endpoints, security middleware.
- Out of scope (future epics): Archiving workflow to B2 Backblaze, file request creation for external contributors, Google Drive alternative integration.

## Technical Notes

- Use Dropbox OAuth 2 with refresh token for long-lived access.
- Support Team Space via `Dropbox-API-Select-User` header when configured.
- Ensure idempotent operations: treat `already_exists` as success, and reuse existing links when present.
- Provide structured logging and an audit trail for all operations.

## Tasks

### Task 1: Environment Setup

- [ ] Add Dropbox API credentials to `.env` (refresh token, app key, app secret).
- [ ] Implement config validation in `env.ts`.

### Task 2: Dropbox Client Wrapper

- [ ] Implement token refresh flow.
- [ ] Expose helper `dropboxFetch()` for API calls.
- [ ] Support Team Space via `Dropbox-API-Select-User` header.

### Task 3: Project Code Generation

- [ ] Implement `makeProjectCode()` using slug(eventName) + date.
- [ ] Ensure uniqueness via Firestore counter or hash fallback.
- [ ] Write unit tests.

### Task 4: Folder Tree Creation

- [ ] Implement `createProjectTree(projectCode)` to call `files/create_folder_v2` for all paths.
- [ ] Handle `already_exists` gracefully.
- [ ] Add structured logging.

### Task 5: Firestore Integration

- [ ] Create Firestore document in `projects` collection.
- [ ] Store project metadata, paths, status, and audit entry.
- [ ] Write integration test for persistence.

### Task 6: Shared Link Management

- [ ] Implement API endpoint to generate/fetch link for `/EXPORT`.
- [ ] Use `sharing/create_shared_link_with_settings`.
- [ ] If link exists, retrieve with `sharing/list_shared_links`.
- [ ] Implement revoke endpoint with `sharing/revoke_shared_link`.
- [ ] Persist link state in Firestore.
- [ ] Append audit log.

### Task 7: Security & Auth

- [ ] Add `requireAdmin()` middleware.
- [ ] Secure all API routes.

### Task 8: Documentation & Examples

- [ ] Write README with setup instructions.
- [ ] Add cURL examples for project creation, link creation, revoke.

### Task 9: Tests

- [ ] Unit tests for code generation.
- [ ] Integration tests for folder creation.
- [ ] Mock tests for link management.

## UX & Design Notes

- Error messages should be clear and actionable, not just raw API codes.
- Keep workflows aligned with common admin mental models (Jakob’s Law).
- Provide audit logs in a user‑friendly format for transparency.

## References

- Dropbox API v2 documentation.
- Firebase Firestore best practices.
- Veloz business concept: optimized segmented workflows.
- UX principle: use mental models to reduce cognitive load.
