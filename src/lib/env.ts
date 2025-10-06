// Centralized environment validation for server-side features
// Only validate the Dropbox-related envs when accessed

export type DropboxEnv = {
  appKey: string;
  appSecret: string;
  refreshToken: string;
  teamMemberId?: string;
};

export function getDropboxEnv(): DropboxEnv {
  const appKey = process.env.DROPBOX_APP_KEY || '';
  const appSecret = process.env.DROPBOX_APP_SECRET || '';
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN || '';
  const teamMemberId = process.env.DROPBOX_TEAM_MEMBER_ID;

  const missing: string[] = [];
  if (!appKey) missing.push('DROPBOX_APP_KEY');
  if (!appSecret) missing.push('DROPBOX_APP_SECRET');
  if (!refreshToken) missing.push('DROPBOX_REFRESH_TOKEN');

  if (missing.length > 0) {
    throw new Error(
      `Missing Dropbox environment variables: ${missing.join(', ')}`
    );
  }

  return { appKey, appSecret, refreshToken, teamMemberId };
}

export type GoogleDriveEnv = {
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  rootFolderId: string;
  impersonateSubject?: string;
};

export function getGoogleDriveEnv(): GoogleDriveEnv {
  const serviceAccountEmail = process.env.GDRIVE_SERVICE_ACCOUNT_EMAIL || '';
  const serviceAccountPrivateKey = (
    process.env.GDRIVE_SERVICE_ACCOUNT_PRIVATE_KEY || ''
  ).replace(/\\n/g, '\n');
  const rootFolderId = process.env.GDRIVE_ROOT_FOLDER_ID || '';
  const impersonateSubject =
    process.env.GDRIVE_IMPERSONATE_SUBJECT || undefined;

  const missing: string[] = [];
  if (!serviceAccountEmail) missing.push('GDRIVE_SERVICE_ACCOUNT_EMAIL');
  if (!serviceAccountPrivateKey)
    missing.push('GDRIVE_SERVICE_ACCOUNT_PRIVATE_KEY');
  if (!rootFolderId) missing.push('GDRIVE_ROOT_FOLDER_ID');
  if (missing.length) {
    throw new Error(`Missing Google Drive env vars: ${missing.join(', ')}`);
  }
  return {
    serviceAccountEmail,
    serviceAccountPrivateKey,
    rootFolderId,
    impersonateSubject,
  };
}
