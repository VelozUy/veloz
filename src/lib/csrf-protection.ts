// CSRF Protection Utility
// Implements token-based CSRF protection for forms

import { randomBytes, createHmac } from 'crypto';

export interface CSRFToken {
  token: string;
  timestamp: number;
  expiresAt: number;
}

export class CSRFProtection {
  private static readonly SECRET = process.env.CSRF_SECRET || 'veloz-csrf-secret-2025';
  private static readonly TOKEN_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate a new CSRF token
   */
  static generateToken(): CSRFToken {
    const token = randomBytes(32).toString('hex');
    const timestamp = Date.now();
    const expiresAt = timestamp + this.TOKEN_LIFETIME;

    return {
      token,
      timestamp,
      expiresAt,
    };
  }

  /**
   * Validate a CSRF token
   */
  static validateToken(token: string, timestamp: number): boolean {
    if (!token || !timestamp) {
      return false;
    }

    // Check if token has expired
    if (Date.now() > timestamp + this.TOKEN_LIFETIME) {
      return false;
    }

    // Verify token format (basic validation)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return false;
    }

    return true;
  }

  /**
   * Create a signed token for additional security
   */
  static createSignedToken(): string {
    const token = randomBytes(32).toString('hex');
    const timestamp = Date.now().toString();
    const signature = createHmac('sha256', this.SECRET)
      .update(token + timestamp)
      .digest('hex');

    return `${token}.${timestamp}.${signature}`;
  }

  /**
   * Verify a signed token
   */
  static verifySignedToken(signedToken: string): boolean {
    try {
      const parts = signedToken.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const [token, timestamp, signature] = parts;
      const expectedSignature = createHmac('sha256', this.SECRET)
        .update(token + timestamp)
        .digest('hex');

      if (signature !== expectedSignature) {
        return false;
      }

      // Check if token has expired
      const tokenTimestamp = parseInt(timestamp, 10);
      if (Date.now() > tokenTimestamp + this.TOKEN_LIFETIME) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract token from signed token
   */
  static extractToken(signedToken: string): string | null {
    try {
      const parts = signedToken.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [token] = parts;
      return token;
    } catch {
      return null;
    }
  }
}

/**
 * React hook for CSRF protection in forms
 */
export function useCSRFProtection() {
  const generateToken = () => CSRFProtection.createSignedToken();
  const verifyToken = (token: string) => CSRFProtection.verifySignedToken(token);

  return {
    generateToken,
    verifyToken,
  };
}

/**
 * Server-side CSRF validation middleware
 */
export function validateCSRFToken(token: string): boolean {
  return CSRFProtection.verifySignedToken(token);
} 