jest.mock('@/lib/google/token', () => ({
  getGoogleAccessToken: jest.fn(async () => 'ya29.test'),
  _resetGoogleTokenCache: jest.fn(),
}));

import {
  createProjectTreeDrive,
  getOrCreateExportLinkDrive,
  revokeExportLinkDrive,
} from '@/lib/google/drive';
import { _resetGoogleTokenCache } from '@/lib/google/token';

describe('google drive', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.GDRIVE_SERVICE_ACCOUNT_EMAIL =
      'svc@test.iam.gserviceaccount.com';
    process.env.GDRIVE_SERVICE_ACCOUNT_PRIVATE_KEY =
      '-----BEGIN PRIVATE KEY-----\nMII...fake...\n-----END PRIVATE KEY-----';
    process.env.GDRIVE_ROOT_FOLDER_ID = 'root123';
    _resetGoogleTokenCache();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('creates or reuses project tree', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any);
    let idCounter = 1;
    fetchMock.mockImplementation(async (url: string, init?: any) => {
      if (url.includes('/files/') && url.includes('/permissions')) {
        return { ok: true, text: async () => '' } as any;
      }
      if (
        url.includes('/files?') &&
        (!init || !init.method || init.method === 'GET')
      ) {
        // list
        return {
          ok: true,
          text: async () => JSON.stringify({ files: [] }),
        } as any;
      }
      if (
        (url.includes('/files?') || url.endsWith('/files')) &&
        init &&
        init.method === 'POST'
      ) {
        // create
        return {
          ok: true,
          text: async () => JSON.stringify({ id: `id${idCounter++}` }),
        } as any;
      }
      if (url.includes('/files/')) {
        return { ok: true, text: async () => JSON.stringify({}) } as any;
      }
      return { ok: true, text: async () => '' } as any;
    });
    const res = await createProjectTreeDrive('VX001_test_2025-01-01');
    expect(res.rootId).toBeDefined();
    expect(res.exportId).toBeDefined();
  });

  it('creates anyone-with-link permission and returns url', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any);
    fetchMock.mockImplementation(async (url: string, init?: any) => {
      if (
        url.includes('/files/export123') &&
        url.includes('fields=permissions')
      ) {
        return {
          ok: true,
          text: async () => JSON.stringify({ permissions: [] }),
        } as any;
      }
      if (url.includes('/files/export123/permissions')) {
        return { ok: true, text: async () => '' } as any;
      }
      if (
        url.includes('/files/export123') &&
        url.includes('fields=webViewLink')
      ) {
        return {
          ok: true,
          text: async () =>
            JSON.stringify({ webViewLink: 'https://drive.google.com/...' }),
        } as any;
      }
      return { ok: true, text: async () => '' } as any;
    });
    const { url } = await getOrCreateExportLinkDrive('export123');
    expect(url).toContain('drive.google.com');
  });

  it('revokes anyone-with-link permission when present', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any);
    fetchMock.mockImplementation(async (url: string, init?: any) => {
      if (
        url.includes('/files/export123') &&
        url.includes('fields=permissions')
      ) {
        return {
          ok: true,
          text: async () =>
            JSON.stringify({
              permissions: [{ id: 'perm1', type: 'anyone', role: 'reader' }],
            }),
        } as any;
      }
      if (url.includes('/files/export123/permissions/perm1')) {
        return { ok: true, text: async () => '' } as any;
      }
      return { ok: true, text: async () => '' } as any;
    });
    await revokeExportLinkDrive('export123');
    expect(fetchMock).toHaveBeenCalled();
  });
});
