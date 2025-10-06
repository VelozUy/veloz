// GDPR Compliance Utility
// Handles user consent, data portability, and privacy rights

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean; // Always true, required for site functionality
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface PrivacyRequest {
  type: 'access' | 'rectification' | 'erasure' | 'portability';
  userId?: string;
  email: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
}

export interface DataRetentionPolicy {
  contactMessages: number; // Days to keep contact messages
  analytics: number; // Days to keep analytics data
  userSessions: number; // Days to keep user session data
  backups: number; // Days to keep backup data
}

export const GDPR_CONSENT_EVENT = 'gdpr-consent-updated';

export class GDPRCompliance {
  private static readonly DEFAULT_RETENTION: DataRetentionPolicy = {
    contactMessages: 365, // 1 year
    analytics: 730, // 2 years
    userSessions: 90, // 3 months
    backups: 2555, // 7 years
  };

  /**
   * Check if user has given consent for analytics
   */
  static hasAnalyticsConsent(userId?: string): boolean {
    if (typeof window === 'undefined') return false;

    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) return false;

    try {
      const preferences: ConsentPreferences = JSON.parse(consent);
      return preferences.analytics === true;
    } catch {
      return false;
    }
  }

  /**
   * Save user consent preferences
   */
  static saveConsent(preferences: Partial<ConsentPreferences>): void {
    if (typeof window === 'undefined') return;

    const existing = this.getConsentPreferences();
    const updated: ConsentPreferences = {
      ...existing,
      ...preferences,
      timestamp: Date.now(),
      necessary: true, // Always required
    };

    localStorage.setItem('gdpr-consent', JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent(GDPR_CONSENT_EVENT, { detail: updated })
    );
  }

  /**
   * Get current consent preferences
   */
  static getConsentPreferences(): ConsentPreferences {
    if (typeof window === 'undefined') {
      return {
        analytics: false,
        marketing: false,
        necessary: true,
        timestamp: Date.now(),
      };
    }

    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) {
      return {
        analytics: false,
        marketing: false,
        necessary: true,
        timestamp: Date.now(),
      };
    }

    try {
      return JSON.parse(consent);
    } catch {
      return {
        analytics: false,
        marketing: false,
        necessary: true,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Revoke consent (opt-out)
   */
  static revokeConsent(
    type: keyof Omit<ConsentPreferences, 'necessary' | 'timestamp'>
  ): void {
    if (typeof window === 'undefined') return;

    const preferences = this.getConsentPreferences();
    (preferences as unknown as Record<string, boolean>)[type] = false;
    preferences.timestamp = Date.now();

    localStorage.setItem('gdpr-consent', JSON.stringify(preferences));

    window.dispatchEvent(
      new CustomEvent(GDPR_CONSENT_EVENT, { detail: preferences })
    );
  }

  /**
   * Anonymize user data for GDPR compliance
   */
  static anonymizeData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.anonymizeData(item));
    }

    const anonymized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (
        ['email', 'phone', 'ipAddress', 'userAgent', 'sessionId'].includes(key)
      ) {
        anonymized[key] = '[ANONYMIZED]';
      } else if (typeof value === 'object' && value !== null) {
        anonymized[key] = this.anonymizeData(value);
      } else {
        anonymized[key] = value;
      }
    }

    return anonymized;
  }

  /**
   * Check if data should be retained based on retention policy
   */
  static shouldRetainData(
    dataType: keyof DataRetentionPolicy,
    timestamp: number,
    customPolicy?: Partial<DataRetentionPolicy>
  ): boolean {
    const policy = { ...this.DEFAULT_RETENTION, ...customPolicy };
    const retentionDays = policy[dataType];
    const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    return timestamp > cutoffDate;
  }

  /**
   * Get data that should be deleted (past retention period)
   */
  static getDataForDeletion(
    data: Array<{ timestamp: number; type: keyof DataRetentionPolicy }>,
    customPolicy?: Partial<DataRetentionPolicy>
  ): Array<{ timestamp: number; type: keyof DataRetentionPolicy }> {
    return data.filter(
      item => !this.shouldRetainData(item.type, item.timestamp, customPolicy)
    );
  }

  /**
   * Generate privacy request
   */
  static createPrivacyRequest(
    type: PrivacyRequest['type'],
    email: string,
    description: string,
    userId?: string
  ): PrivacyRequest {
    return {
      type,
      userId,
      email,
      description,
      timestamp: Date.now(),
      status: 'pending',
    };
  }

  /**
   * Validate privacy request
   */
  static validatePrivacyRequest(request: PrivacyRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      errors.push('Valid email address is required');
    }

    if (!request.description || request.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (
      !['access', 'rectification', 'erasure', 'portability'].includes(
        request.type
      )
    ) {
      errors.push('Invalid request type');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate data export for portability
   */
  static generateDataExport(userData: unknown): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      data: this.anonymizeData(userData),
      format: 'JSON',
      version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Check if user is in EU (basic check)
   */
  static isEUUser(): boolean {
    if (typeof window === 'undefined') return false;

    // This is a basic check - in production, you'd want more sophisticated geo-detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = [
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Europe/Amsterdam',
      'Europe/Brussels',
      'Europe/Vienna',
      'Europe/Prague',
      'Europe/Budapest',
      'Europe/Warsaw',
      'Europe/Stockholm',
      'Europe/Copenhagen',
      'Europe/Helsinki',
      'Europe/Oslo',
      'Europe/Dublin',
      'Europe/Lisbon',
      'Europe/Athens',
      'Europe/Bucharest',
      'Europe/Sofia',
      'Europe/Zagreb',
      'Europe/Ljubljana',
      'Europe/Bratislava',
      'Europe/Vilnius',
      'Europe/Riga',
      'Europe/Tallinn',
      'Europe/Luxembourg',
      'Europe/Malta',
      'Europe/Cyprus',
      'Europe/Sofia',
      'Europe/Brussels',
    ];

    return euTimezones.includes(timezone);
  }
}

/**
 * React hook for GDPR compliance
 */
export function useGDPRCompliance() {
  const hasConsent = (
    type: keyof Omit<ConsentPreferences, 'necessary' | 'timestamp'>
  ) => {
    if (type === 'analytics') {
      return GDPRCompliance.hasAnalyticsConsent();
    }
    const preferences = GDPRCompliance.getConsentPreferences();
    return preferences[type] === true;
  };

  const saveConsent = (preferences: Partial<ConsentPreferences>) => {
    GDPRCompliance.saveConsent(preferences);
  };

  const revokeConsent = (
    type: keyof Omit<ConsentPreferences, 'necessary' | 'timestamp'>
  ) => {
    GDPRCompliance.revokeConsent(type);
  };

  return {
    hasConsent,
    saveConsent,
    revokeConsent,
    isEUUser: GDPRCompliance.isEUUser,
  };
}
