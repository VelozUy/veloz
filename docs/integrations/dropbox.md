Dropbox Integration Setup

- Required env vars in `.env.local` (server only):
  - `DROPBOX_APP_KEY`
  - `DROPBOX_APP_SECRET`
  - `DROPBOX_REFRESH_TOKEN`
  - `DROPBOX_TEAM_MEMBER_ID` (optional, for Team Space member context)

- Firebase Admin (for secured API routes):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (use `\n` for newlines)
  - `NEXT_PUBLIC_OWNER_EMAIL` (email treated as admin)

API Endpoints

- `POST /api/admin/projects`
  - Auth: Bearer Firebase ID token of admin
  - Body: `{ "eventName": string, "eventDate": "YYYY-MM-DD" }`
  - Creates unique project code, provisions Dropbox tree, persists Firestore

- `POST /api/admin/projects/{code}/link`
  - Auth: Bearer Firebase ID token of admin
  - Gets or creates public shared link for `/EXPORT`

- `DELETE /api/admin/projects/{code}/link`
  - Auth: Bearer Firebase ID token of admin
  - Revokes existing shared link and updates Firestore

Notes

- Idempotent folder creation: `already_exists` is treated as success.
- Shared links: if one exists, it is reused.
- Audit trail entries are appended in the `projects/{code}` document.
