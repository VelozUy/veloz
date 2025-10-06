import { dropboxFetch } from './client';

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

export async function createProjectTree(projectCode: string) {
  const root = `/${projectCode}`;

  // Ensure root folder
  await ensureFolder(root);

  // Ensure all leaf folders
  for (const sub of PROJECT_SUBFOLDERS) {
    await ensureFolder(`${root}/${sub}`);
  }

  return {
    root,
    exportPath: `${root}/EXPORT`,
  };
}

async function ensureFolder(path: string) {
  try {
    await dropboxFetch('files/create_folder_v2', {
      body: { path, autorename: false },
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (
      msg.includes('path/conflict/folder/') ||
      msg.includes('already_exists')
    ) {
      // Idempotent: treat as success
      return;
    }
    throw e;
  }
}

export type SharedLink = {
  url: string;
  id: string;
};

export async function getOrCreateExportLink(
  rootPath: string
): Promise<SharedLink> {
  const exportPath = `${rootPath}/EXPORT`;

  // Try to find existing link
  const existing = await dropboxFetch<{ links: any[] }>(
    'sharing/list_shared_links',
    {
      body: { path: exportPath, direct_only: true },
    }
  );
  const link = existing.links?.[0];
  if (link) {
    return { url: link.url as string, id: link.id as string };
  }

  // Create new link with default settings
  const created = await dropboxFetch<any>(
    'sharing/create_shared_link_with_settings',
    {
      body: {
        path: exportPath,
        settings: { requested_visibility: 'public' },
      },
    }
  );
  return { url: created.url as string, id: created.id as string };
}

export async function revokeSharedLink(linkId: string) {
  await dropboxFetch('sharing/revoke_shared_link', {
    body: { url: linkId },
  });
}
