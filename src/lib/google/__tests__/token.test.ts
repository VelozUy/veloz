jest.mock('node:crypto', () => ({
  __esModule: true,
  default: {
    createSign: jest.fn(() => ({
      update: jest.fn(),
      sign: jest.fn(() => Buffer.from('sig')),
    })),
  },
}));

import {
  getGoogleAccessToken,
  _resetGoogleTokenCache,
} from '@/lib/google/token';

describe('google token', () => {
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

  it('exchanges JWT for access token', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'ya29.token', expires_in: 3600 }),
    } as any);
    // Note: we won’t validate signature here; we only test flow
    const token = await getGoogleAccessToken([
      'https://www.googleapis.com/auth/drive',
    ]);
    expect(typeof token).toBe('string');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.anything()
    );
  });
});
