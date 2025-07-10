import { triggerBuild } from '../build-trigger';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('build-trigger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger build successfully', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        message: 'Build triggered successfully',
        buildId: 'build-123',
        buildUrl: 'https://build.netlify.app/build-123',
        deployUrl: 'https://deploy.netlify.app/build-123',
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await triggerBuild();

    expect(result).toEqual({
      success: true,
      message: 'Build triggered successfully',
      buildId: 'build-123',
      buildUrl: 'https://build.netlify.app/build-123',
      deployUrl: 'https://deploy.netlify.app/build-123',
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/trigger-build', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-token',
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle API error response', async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        error: 'Build trigger failed',
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await triggerBuild();

    expect(result).toEqual({
      success: false,
      message: 'Failed to trigger build',
      error: 'Build trigger failed',
    });
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await triggerBuild();

    expect(result).toEqual({
      success: false,
      message: 'Failed to trigger build',
      error: 'Network error',
    });
  });

  it('should handle missing user', async () => {
    const { getAuth } = require('firebase/auth');
    getAuth.mockReturnValue({
      currentUser: null,
    });

    const result = await triggerBuild();

    expect(result).toEqual({
      success: false,
      message: 'Failed to trigger build',
      error: 'User not authenticated',
    });
  });
});
