// Rate Limiting Utility
// Implements in-memory rate limiting for API endpoints and login attempts

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDuration?: number; // How long to block after exceeding limit
}

export class RateLimiter {
  private static store = new Map<string, RateLimitEntry>();
  private static cleanupInterval: NodeJS.Timeout;

  // Initialize cleanup interval
  static {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  /**
   * Check if request is allowed
   */
  static isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    // If no entry exists, create one
    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false,
      });
      return true;
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return false;
    }

    // Reset if window has passed
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      entry.blockUntil = undefined;
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      if (config.blockDuration) {
        entry.blocked = true;
        entry.blockUntil = now + config.blockDuration;
      }
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  static getRemaining(key: string, config: RateLimitConfig): number {
    const entry = this.store.get(key);
    if (!entry) {
      return config.maxRequests;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get reset time for a key
   */
  static getResetTime(key: string): number | null {
    const entry = this.store.get(key);
    return entry ? entry.resetTime : null;
  }

  /**
   * Check if key is blocked
   */
  static isBlocked(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry || !entry.blocked) {
      return false;
    }

    const now = Date.now();
    if (entry.blockUntil && now < entry.blockUntil) {
      return true;
    }

    // Unblock if time has passed
    entry.blocked = false;
    entry.blockUntil = undefined;
    return false;
  }

  /**
   * Clean up expired entries
   */
  private static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      // Remove entries that are past their reset time and not blocked
      if (now > entry.resetTime && !entry.blocked) {
        this.store.delete(key);
      }
      // Remove blocked entries that have expired
      if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all entries (useful for testing)
   */
  static clear(): void {
    this.store.clear();
  }

  /**
   * Get store size (useful for monitoring)
   */
  static getSize(): number {
    return this.store.size;
  }
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // Login attempts: 5 attempts per 15 minutes, block for 1 hour
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 60 * 60 * 1000, // 1 hour
  },

  // API requests: 100 requests per minute
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  // Contact form: 3 submissions per hour
  CONTACT_FORM: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDuration: 2 * 60 * 60 * 1000, // 2 hours
  },

  // File uploads: 10 uploads per hour
  FILE_UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

/**
 * Rate limiting middleware for API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return function rateLimitMiddleware(req: Request, key: string): boolean {
    return RateLimiter.isAllowed(key, config);
  };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(req: Request): string {
  // Use IP address if available, otherwise use a fallback
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Get user identifier for rate limiting (for authenticated users)
 */
export function getUserIdentifier(userId: string): string {
  return `user:${userId}`;
} 