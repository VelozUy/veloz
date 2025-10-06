import { dropboxFetch, _resetDropboxTokenCache } from '@/lib/dropbox/client';

describe('dropbox client', () => {
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

  it('refreshes token and performs API call', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any);
    // Token endpoint
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'access_abc',
        token_type: 'bearer',
        expires_in: 3600,
      }),
      text: async () => JSON.stringify({}),
    } as any);
    // Dropbox API call
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    } as any);

    const res = await dropboxFetch<any>('files/get_metadata', {
      body: { path: '/x' },
    });
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalled();
    const tokenCall = fetchMock.mock.calls[0][0] as string;
    expect(tokenCall).toContain('oauth2/token');
    const apiCall = fetchMock.mock.calls[1][0] as string;
    expect(apiCall).toContain('api.dropboxapi.com/2/files/get_metadata');
  });
});
