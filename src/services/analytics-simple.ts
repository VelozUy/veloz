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
