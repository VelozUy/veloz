import { getDropboxEnv } from '@/lib/env';

type TokenState = {
  accessToken: string | null;
  expiresAt: number; // epoch ms
};

let tokenState: TokenState = {
  accessToken: null,
  expiresAt: 0,
};

async function refreshAccessToken(): Promise<string> {
  const { appKey, appSecret, refreshToken } = getDropboxEnv();

  const basic = Buffer.from(`${appKey}:${appSecret}`).toString('base64');
  const params = new URLSearchParams();
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', refreshToken);

  const res = await fetch('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox token refresh failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: 'bearer' | string;
    expires_in?: number;
    scope?: string;
  };

  const now = Date.now();
  const lifetime = (data.expires_in || 14400) * 1000; // default 4h if missing
  tokenState = {
    accessToken: data.access_token,
    expiresAt: now + lifetime - 60_000, // refresh 60s early
  };

  return tokenState.accessToken!;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenState.accessToken && tokenState.expiresAt > now) {
    return tokenState.accessToken;
  }
  return refreshAccessToken();
}

export type DropboxFetchInit = {
  method?: 'POST' | 'GET';
  body?: unknown;
  headers?: Record<string, string>;
  selectUser?: string | null;
};

export async function dropboxFetch<T = any>(
  path: string,
  init: DropboxFetchInit = {}
): Promise<T> {
  const accessToken = await getAccessToken();
  const { headers, body, method = 'POST', selectUser } = init;
  const { teamMemberId } = getDropboxEnv();
  const useMember = selectUser === undefined ? teamMemberId : selectUser;

  const res = await fetch(`https://api.dropboxapi.com/2/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(useMember ? { 'Dropbox-API-Select-User': useMember } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Try to parse structured error
    let detail: any;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    throw new Error(
      `Dropbox API error ${res.status}: ${JSON.stringify(detail)}`
    );
  }

  // Some endpoints return empty body on success
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // not JSON; return as any
    return text as unknown as T;
  }
}

export function _resetDropboxTokenCache() {
  tokenState = { accessToken: null, expiresAt: 0 };
}
