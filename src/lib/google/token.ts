import crypto from 'node:crypto';
import { getGoogleDriveEnv } from '@/lib/env';

type TokenCacheKey = string; // scopes|subject
type TokenEntry = { accessToken: string; expiresAt: number };
const cache = new Map<TokenCacheKey, TokenEntry>();

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function getGoogleAccessToken(
  scopes: string[],
  subject?: string
): Promise<string> {
  const { serviceAccountEmail, serviceAccountPrivateKey } = getGoogleDriveEnv();
  const scopeStr = scopes.join(' ');
  const key = `${scopeStr}|${subject || ''}`;
  const now = Math.floor(Date.now() / 1000);
  const entry = cache.get(key);
  if (entry && entry.expiresAt - 60 > now) return entry.accessToken;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload: Record<string, any> = {
    iss: serviceAccountEmail,
    scope: scopeStr,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  if (subject) payload.sub = subject;

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer.sign(serviceAccountPrivateKey);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const body = new URLSearchParams();
  body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  body.set('assertion', jwt);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cache.set(key, {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in,
  });
  return data.access_token;
}

export function _resetGoogleTokenCache() {
  cache.clear();
}
