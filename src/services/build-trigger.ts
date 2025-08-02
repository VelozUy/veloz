import { getAuth } from 'firebase/auth';

export interface BuildTriggerResponse {
  success: boolean;
  message: string;
  buildId?: string;
  buildUrl?: string;
  deployUrl?: string;
  error?: string;
}

export async function triggerBuild(): Promise<BuildTriggerResponse> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the current user's ID token
    const token = await user.getIdToken();

    const response = await fetch('/api/trigger-build', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to trigger build');
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to trigger build',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
