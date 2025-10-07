/**
 * Simple Analytics Service
 * A working analytics service that doesn't rely on Firestore writes
 */

import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig, validateFirebaseConfig } from '@/lib/firebase-config';
import { GDPRCompliance } from '@/lib/gdpr-compliance';

// Simple analytics service that only uses Firebase Analytics (GA4)
class SimpleAnalyticsService {
  private analytics: ReturnType<typeof getAnalytics> | null = null;
  private isInitialized = false;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return (
      'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  private ensureInitialized() {
    if (this.isInitialized && this.analytics) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    // Skip validation in Node environment
    if (typeof window === 'undefined') {
      return;
    }

    // Validate configuration
    const validation = validateFirebaseConfig();
    if (!validation.isValid) {
      console.error('Firebase configuration invalid:', validation.missing);
      return;
    }

    try {
      // Initialize Firebase app
      let app;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      // Initialize Analytics
      this.analytics = getAnalytics(app);
      this.isInitialized = true;
      console.log('✅ Simple Analytics Service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private async logEvent(
    eventName: string,
    eventParams: Record<string, unknown> = {}
  ) {
    this.ensureInitialized();

    if (!this.isInitialized || !this.analytics) {
      console.warn('Analytics not initialized, skipping event:', eventName);
      return;
    }

    if (!GDPRCompliance.hasAnalyticsConsent()) {
      console.warn('No analytics consent, skipping event:', eventName);
      return;
    }

    try {
      const enrichedParams = {
        ...eventParams,
        session_id: this.sessionId,
        device_type: this.getDeviceType(),
        user_language: this.getUserLanguage(),
        timestamp: Date.now(),
        // Traffic source tracking
        ...this.getTrafficSourceData(),
      };

      await logEvent(this.analytics, eventName, enrichedParams);
      console.log('✅ Analytics event logged:', eventName);
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = window.navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'mobile';
    }
    if (/Tablet|iPad/.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  private getUserLanguage(): string {
    if (typeof window === 'undefined') return 'unknown';
    return navigator.language || 'unknown';
  }

  private getTrafficSourceData(): Record<string, unknown> {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer || '';

    // UTM parameters
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content');
    const utmTerm = urlParams.get('utm_term');

    // Determine traffic source
    let trafficSource = 'direct';
    let trafficMedium = 'none';
    let trafficCampaign = '';

    if (utmSource) {
      trafficSource = utmSource;
      trafficMedium = utmMedium || 'unknown';
      trafficCampaign = utmCampaign || '';
    } else if (referrer) {
      const referrerDomain = this.getDomainFromUrl(referrer);
      if (referrerDomain.includes('google')) {
        trafficSource = 'google';
        trafficMedium = 'organic';
      } else if (
        referrerDomain.includes('facebook') ||
        referrerDomain.includes('fb.com')
      ) {
        trafficSource = 'facebook';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('instagram')) {
        trafficSource = 'instagram';
        trafficMedium = 'social';
      } else if (
        referrerDomain.includes('twitter') ||
        referrerDomain.includes('x.com')
      ) {
        trafficSource = 'twitter';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('linkedin')) {
        trafficSource = 'linkedin';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('youtube')) {
        trafficSource = 'youtube';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('tiktok')) {
        trafficSource = 'tiktok';
        trafficMedium = 'social';
      } else {
        trafficSource = 'referral';
        trafficMedium = 'referral';
      }
    }

    return {
      traffic_source: trafficSource,
      traffic_medium: trafficMedium,
      traffic_campaign: trafficCampaign,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
      referrer: referrer,
      referrer_domain: referrer ? this.getDomainFromUrl(referrer) : '',
      landing_page: window.location.pathname,
      full_url: window.location.href,
    };
  }

  private getDomainFromUrl(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  // Public methods
  async trackPageView(pagePath: string, pageTitle?: string) {
    await this.logEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  async trackProjectView(data: {
    projectId: string;
    projectTitle: string;
    projectCategory?: string;
    projectLanguage?: string;
    viewDuration?: number;
    scrollDepth?: number;
  }) {
    await this.logEvent('project_view', {
      project_id: data.projectId,
      project_title: data.projectTitle,
      project_category: data.projectCategory,
      project_language: data.projectLanguage,
      view_duration: data.viewDuration,
      scroll_depth: data.scrollDepth,
    });
  }

  async trackMediaInteraction(data: {
    projectId: string;
    mediaId: string;
    mediaType: string;
    interactionType: string;
    mediaTitle?: string;
    viewDuration?: number;
  }) {
    await this.logEvent('media_interaction', {
      project_id: data.projectId,
      media_id: data.mediaId,
      media_type: data.mediaType,
      interaction_type: data.interactionType,
      media_title: data.mediaTitle,
      view_duration: data.viewDuration,
    });
  }

  async trackCTAInteraction(data: {
    projectId: string;
    ctaType: string;
    ctaLocation: string;
  }) {
    await this.logEvent('cta_interaction', {
      project_id: data.projectId,
      cta_type: data.ctaType,
      cta_location: data.ctaLocation,
    });
  }

  async trackCrewInteraction(data: {
    projectId: string;
    crewMemberId: string;
    crewMemberName: string;
    interactionType: string;
    crewMemberRole?: string;
  }) {
    await this.logEvent('crew_interaction', {
      project_id: data.projectId,
      crew_member_id: data.crewMemberId,
      crew_member_name: data.crewMemberName,
      interaction_type: data.interactionType,
      crew_member_role: data.crewMemberRole,
    });
  }

  async trackError(error: Error, context?: Record<string, unknown>) {
    await this.logEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
    });
  }

  async trackScrollDepth(pagePath: string, depth: number) {
    await this.logEvent('scroll_depth', {
      page_path: pagePath,
      scroll_depth: depth,
    });
  }

  // Traffic source tracking
  async trackTrafficSource() {
    const trafficData = this.getTrafficSourceData();
    await this.logEvent('traffic_source', {
      ...trafficData,
      event_category: 'traffic',
      event_action: 'source_detected',
    });
  }

  // Campaign tracking
  async trackCampaign(
    campaignName: string,
    campaignData?: Record<string, unknown>
  ) {
    await this.logEvent('campaign_tracking', {
      campaign_name: campaignName,
      ...campaignData,
      event_category: 'campaign',
      event_action: 'campaign_interaction',
    });
  }
}

// Export singleton instance
export const simpleAnalyticsService = new SimpleAnalyticsService();

// Export individual functions for compatibility
export const trackPageView = (pagePath: string, pageTitle?: string) =>
  simpleAnalyticsService.trackPageView(pagePath, pageTitle);

export const trackProjectView = (data: any) =>
  simpleAnalyticsService.trackProjectView(data);

export const trackMediaInteraction = (data: any) =>
  simpleAnalyticsService.trackMediaInteraction(data);

export const trackCTAInteraction = (data: any) =>
  simpleAnalyticsService.trackCTAInteraction(data);

export const trackCrewInteraction = (data: any) =>
  simpleAnalyticsService.trackCrewInteraction(data);

export const trackError = (error: Error, context?: Record<string, unknown>) =>
  simpleAnalyticsService.trackError(error, context);

export const trackScrollDepth = (pagePath: string, depth: number) =>
  simpleAnalyticsService.trackScrollDepth(pagePath, depth);

// Test helper for traffic source parsing (pure function, no side effects)
// This is exported only for unit tests and mirrors getTrafficSourceData logic
export function __parseTrafficSourceForTest(params: {
  url: string;
  referrer?: string;
}): Record<string, unknown> {
  try {
    const urlObj = new URL(params.url);
    const urlParams = urlObj.searchParams;
    const referrer = params.referrer || '';

    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content');
    const utmTerm = urlParams.get('utm_term');

    let trafficSource = 'direct';
    let trafficMedium = 'none';
    let trafficCampaign = '';

    if (utmSource) {
      trafficSource = utmSource;
      trafficMedium = utmMedium || 'unknown';
      trafficCampaign = utmCampaign || '';
    } else if (referrer) {
      const refDomain = (() => {
        try {
          return new URL(referrer).hostname;
        } catch {
          return '';
        }
      })();
      if (refDomain.includes('google')) {
        trafficSource = 'google';
        trafficMedium = 'organic';
      } else if (
        refDomain.includes('facebook') ||
        refDomain.includes('fb.com')
      ) {
        trafficSource = 'facebook';
        trafficMedium = 'social';
      } else if (refDomain.includes('instagram')) {
        trafficSource = 'instagram';
        trafficMedium = 'social';
      } else if (refDomain.includes('twitter') || refDomain.includes('x.com')) {
        trafficSource = 'twitter';
        trafficMedium = 'social';
      } else if (refDomain.includes('linkedin')) {
        trafficSource = 'linkedin';
        trafficMedium = 'social';
      } else if (refDomain.includes('youtube')) {
        trafficSource = 'youtube';
        trafficMedium = 'social';
      } else if (refDomain.includes('tiktok')) {
        trafficSource = 'tiktok';
        trafficMedium = 'social';
      } else {
        trafficSource = 'referral';
        trafficMedium = 'referral';
      }
    }

    return {
      traffic_source: trafficSource,
      traffic_medium: trafficMedium,
      traffic_campaign: trafficCampaign,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
      referrer: referrer,
      referrer_domain: referrer
        ? (() => {
            try {
              return new URL(referrer).hostname;
            } catch {
              return '';
            }
          })()
        : '',
      landing_page: urlObj.pathname,
      full_url: params.url,
    };
  } catch {
    return {};
  }
}
