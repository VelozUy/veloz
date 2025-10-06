import { getGoogleAccessToken } from './token';
import { getGoogleDriveEnv } from '@/lib/env';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

async function driveFetch<T = any>(
  path: string,
  init: { method?: string; body?: any; query?: Record<string, string> }
): Promise<T> {
  const { impersonateSubject } = getGoogleDriveEnv();
  const accessToken = await getGoogleAccessToken(
    [DRIVE_SCOPE],
    impersonateSubject
  );
  const qs = new URLSearchParams({
    supportsAllDrives: 'true',
    ...(init.query || {}),
  }).toString();
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}?${qs}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API error ${res.status}: ${text}`);
  }
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function findFolderByName(
  name: string,
  parentId: string
): Promise<string | null> {
  const q = [
    `name='${name.replace(/'/g, "\\'")}'`,
    "mimeType='application/vnd.google-apps.folder'",
    `'${parentId}' in parents`,
    'trashed=false',
  ].join(' and ');
  const res = await driveFetch<{ files: Array<{ id: string }> }>('files', {
    query: { q, fields: 'files(id)' },
  });
  return res.files?.[0]?.id || null;
}

export async function ensureFolder(
  name: string,
  parentId: string
): Promise<string> {
  const existing = await findFolderByName(name, parentId);
  if (existing) return existing;
  const created = await driveFetch<{ id: string }>('files', {
    method: 'POST',
    body: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    query: { fields: 'id' },
  });
  return created.id;
}

export const PROJECT_SUBFOLDERS = [
  'RAW/IMAGEN',
  'RAW/VIDEO',
  'SELECTED/IMAGEN',
  'SELECTED/VIDEO',
  'EDITED/IMAGEN',
  'EDITED/VIDEO',
  'EXPORT/IMAGEN',
  'EXPORT/VIDEO',
  'DOCS',
  'ARCHIVE',
];

export type ProjectTreeResult = { rootId: string; exportId: string };

export async function createProjectTreeDrive(
  projectCode: string
): Promise<ProjectTreeResult> {
  const { rootFolderId } = getGoogleDriveEnv();
  const projectRootId = await ensureFolder(projectCode, rootFolderId);

  // Ensure first-level folders and nested children
  const cache = new Map<string, string>();
  cache.set('', projectRootId);
  for (const sub of PROJECT_SUBFOLDERS) {
    const parts = sub.split('/');
    let parent = projectRootId;
    let pathAccum = '';
    for (const p of parts) {
      pathAccum = pathAccum ? `${pathAccum}/${p}` : p;
      const key = pathAccum;
      if (!cache.has(key)) {
        const id = await ensureFolder(p, parent);
        cache.set(key, id);
        parent = id;
      } else {
        parent = cache.get(key)!;
      }
    }
  }

  const exportId = cache.get('EXPORT')!;
  return { rootId: projectRootId, exportId };
}

export async function getOrCreateExportLinkDrive(
  exportFolderId: string
): Promise<{ url: string }> {
  // Check existing permissions
  const file = await driveFetch<{
    permissions?: Array<{ id: string; type: string; role: string }>;
    webViewLink?: string;
  }>(`files/${exportFolderId}`, {
    query: { fields: 'permissions(id,type,role),webViewLink' },
  });

  const hasAnyone = file.permissions?.some(
    p => p.type === 'anyone' && p.role === 'reader'
  );
  if (!hasAnyone) {
    await driveFetch(`files/${exportFolderId}/permissions`, {
      method: 'POST',
      body: { role: 'reader', type: 'anyone', allowFileDiscovery: false },
    });
  }
  // Retrieve view link
  const updated = await driveFetch<{ webViewLink: string }>(
    `files/${exportFolderId}`,
    {
      query: { fields: 'webViewLink' },
    }
  );
  return { url: updated.webViewLink };
}

export async function revokeExportLinkDrive(
  exportFolderId: string
): Promise<void> {
  const file = await driveFetch<{
    permissions?: Array<{ id: string; type: string; role: string }>;
  }>(`files/${exportFolderId}`, {
    query: { fields: 'permissions(id,type,role)' },
  });
  const perm = file.permissions?.find(p => p.type === 'anyone');
  if (perm) {
    await driveFetch<void>(`files/${exportFolderId}/permissions/${perm.id}`, {
      method: 'DELETE',
    });
  }
}
