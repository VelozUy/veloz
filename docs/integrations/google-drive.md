Google Drive Integration Setup

Credentials (Service Account)

- Create a Service Account in Google Cloud Console and download credentials.
- Env vars (server only):
  - `GDRIVE_SERVICE_ACCOUNT_EMAIL`
  - `GDRIVE_SERVICE_ACCOUNT_PRIVATE_KEY` (escape newlines as \n)
  - `GDRIVE_ROOT_FOLDER_ID` (Drive folder where projects are created)
  - `GDRIVE_IMPERSONATE_SUBJECT` (optional; Workspace user email for domain-wide delegation)

Access

- Add the Service Account as a member (Viewer/Contributor) to the target folder/shared drive, or enable domain-wide delegation if using Workspace.
- Scopes used: `https://www.googleapis.com/auth/drive`.

API Endpoints

- `POST /api/admin/projects`
  - Body: `{ "eventName": string, "eventDate": "YYYY-MM-DD" }`
  - Creates project folder under `GDRIVE_ROOT_FOLDER_ID` and subfolders.
  - Persists document `projects/{projectCode}` with `storage: { provider: 'gdrive', rootId, exportId }`.

- `POST /api/admin/projects/{code}/link`
  - Grants "anyone with the link (reader)" to the `EXPORT` folder and returns `webViewLink`.

- `DELETE /api/admin/projects/{code}/link`
  - Revokes the "anyone" permission on the `EXPORT` folder.

Notes

- Idempotent folder creation: existing folders are reused via search by name + parent.
- Links: Uses Drive permissions; link is `webViewLink`.
- All endpoints require Firebase ID token of an admin (owner email or `admin` claim).
