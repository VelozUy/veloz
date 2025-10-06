import {
  getOrCreateExportLink,
  createProjectTree,
} from '@/lib/dropbox/projects';
import { _resetDropboxTokenCache } from '@/lib/dropbox/client';

describe('dropbox projects', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.DROPBOX_APP_KEY = 'app_key';
    process.env.DROPBOX_APP_SECRET = 'app_secret';
    process.env.DROPBOX_REFRESH_TOKEN = 'refresh_123';
    _resetDropboxTokenCache();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('ensures project tree and handles already exists', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any);
    // Token call
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'access_abc',
        token_type: 'bearer',
        expires_in: 3600,
      }),
      text: async () => JSON.stringify({}),
    } as any);
    // Root folder creation ok
    fetchMock.mockResolvedValueOnce({ ok: true, text: async () => '' } as any);
    // Subsequent subfolders: simulate one already exists, others ok
    // There are 10 subfolders; we'll respond with 10 calls
    for (let i = 0; i < 10; i++) {
      if (i === 3) {
        fetchMock.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error_summary: 'path/conflict/folder/...' }),
          text: async () =>
            JSON.stringify({ error_summary: 'path/conflict/folder/...' }),
        } as any);
      } else {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          text: async () => '',
        } as any);
      }
    }

    const res = await createProjectTree('VX001_test_2025-01-01');
    expect(res.root).toBe('/VX001_test_2025-01-01');
    expect(fetchMock).toHaveBeenCalled();
  });

  it('gets existing export link or creates if missing', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any);
    // Token
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'access_abc',
        token_type: 'bearer',
        expires_in: 3600,
      }),
      text: async () => JSON.stringify({}),
    } as any);
    // list_shared_links returns none
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ links: [] }),
    } as any);
    // create_shared_link_with_settings returns link
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ url: 'https://dbx/1', id: 'id:1' }),
    } as any);

    const link = await getOrCreateExportLink('/VX001_test_2025-01-01');
    expect(link.url).toBe('https://dbx/1');
  });
});
