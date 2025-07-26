import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from 'firebase/analytics';
import { getApp } from 'firebase/app';
import { z } from 'zod';

// Analytics event schemas
export const AnalyticsEventSchema = z.object({
  eventName: z.string(),
  eventParams: z.record(z.unknown()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.number().optional(),
});

export const ProjectViewEventSchema = z.object({
  projectId: z.string(),
  projectTitle: z.string(),
  projectCategory: z.string().optional(),
  projectLanguage: z.string().optional(),
  viewDuration: z.number().optional(),
  scrollDepth: z.number().optional(),
  deviceType: z.string().optional(),
  userLanguage: z.string().optional(),
});

export const MediaInteractionEventSchema = z.object({
  projectId: z.string(),
  mediaId: z.string(),
  mediaType: z.enum(['image', 'video']),
  interactionType: z.enum(['view', 'play', 'pause', 'complete']),
  mediaTitle: z.string().optional(),
  viewDuration: z.number().optional(),
});

export const CTAInteractionEventSchema = z.object({
  projectId: z.string().min(1),
  ctaType: z.string().min(1),
  ctaLocation: z.string().min(1),
  userLanguage: z.string().optional(),
  deviceType: z.string().optional(),
});

export const CrewInteractionEventSchema = z.object({
  projectId: z.string(),
  crewMemberId: z.string(),
  crewMemberName: z.string(),
  interactionType: z.enum(['view', 'click', 'contact']),
  crewMemberRole: z.string().optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type ProjectViewEvent = z.infer<typeof ProjectViewEventSchema>;
export type MediaInteractionEvent = z.infer<typeof MediaInteractionEventSchema>;
export type CTAInteractionEvent = z.infer<typeof CTAInteractionEventSchema>;
export type CrewInteractionEvent = z.infer<typeof CrewInteractionEventSchema>;

class AnalyticsService {
  private analytics: ReturnType<typeof getAnalytics> | null = null;
  private sessionId: string | null = null;
  private isInitialized = false;
  private isGA4Enabled = false;

  constructor() {
    // Don't initialize immediately - wait for client-side usage
  }

  private initializeAnalytics() {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const app = getApp();
      this.analytics = getAnalytics(app);
      this.sessionId = this.generateSessionId();
      this.isInitialized = true;
      this.isGA4Enabled = !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

      // Analytics initialized successfully
    } catch (error) {
      this.isInitialized = false;
    }
  }

  private ensureInitialized() {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.initializeAnalytics();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    ) {
      return 'mobile';
    } else if (/iPad|Android/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private getUserLanguage(): string {
    if (typeof window === 'undefined') return 'unknown';
    return navigator.language || 'unknown';
  }

  private async logCustomEvent(
    eventName: string,
    eventParams: Record<string, unknown> = {}
  ) {
    this.ensureInitialized();
    if (!this.isInitialized || !this.analytics) {
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

      if (this.isGA4Enabled) {
        await logEvent(this.analytics, eventName, enrichedParams);
      }

      // Analytics event logged
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  // Project view tracking
  async trackProjectView(data: ProjectViewEvent) {
    const validatedData = ProjectViewEventSchema.parse(data);

    await this.logCustomEvent('project_view', {
      project_id: validatedData.projectId,
      project_title: validatedData.projectTitle,
      project_category: validatedData.projectCategory,
      project_language: validatedData.projectLanguage,
      view_duration: validatedData.viewDuration,
      scroll_depth: validatedData.scrollDepth,
      device_type: validatedData.deviceType || this.getDeviceType(),
      user_language: validatedData.userLanguage || this.getUserLanguage(),
    });
  }

  // Media interaction tracking
  async trackMediaInteraction(data: MediaInteractionEvent) {
    const validatedData = MediaInteractionEventSchema.parse(data);

    await this.logCustomEvent('media_interaction', {
      project_id: validatedData.projectId,
      media_id: validatedData.mediaId,
      media_type: validatedData.mediaType,
      interaction_type: validatedData.interactionType,
      media_title: validatedData.mediaTitle,
      view_duration: validatedData.viewDuration,
    });
  }

  // CTA interaction tracking
  async trackCTAInteraction(data: CTAInteractionEvent) {
    const validatedData = CTAInteractionEventSchema.parse(data);

    await this.logCustomEvent('cta_interaction', {
      project_id: validatedData.projectId,
      cta_type: validatedData.ctaType,
      cta_location: validatedData.ctaLocation,
      user_language: validatedData.userLanguage || this.getUserLanguage(),
      device_type: validatedData.deviceType || this.getDeviceType(),
    });
  }

  // Crew interaction tracking
  async trackCrewInteraction(data: CrewInteractionEvent) {
    const validatedData = CrewInteractionEventSchema.parse(data);

    await this.logCustomEvent('crew_interaction', {
      project_id: validatedData.projectId,
      crew_member_id: validatedData.crewMemberId,
      crew_member_name: validatedData.crewMemberName,
      interaction_type: validatedData.interactionType,
      crew_member_role: validatedData.crewMemberRole,
    });
  }

  // Page view tracking
  async trackPageView(pagePath: string, pageTitle?: string) {
    await this.logCustomEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  // Scroll depth tracking
  async trackScrollDepth(pagePath: string, scrollDepth: number) {
    await this.logCustomEvent('scroll_depth', {
      page_path: pagePath,
      scroll_depth: scrollDepth,
    });
  }

  // Session tracking
  async trackSessionStart() {
    await this.logCustomEvent('session_start', {
      session_id: this.sessionId,
    });
  }

  async trackSessionEnd(duration: number) {
    await this.logCustomEvent('session_end', {
      session_id: this.sessionId,
      session_duration: duration,
    });
  }

  // Error tracking
  async trackError(error: Error, context?: Record<string, unknown>) {
    await this.logCustomEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  // Custom event tracking
  async trackCustomEvent(
    eventName: string,
    eventParams: Record<string, unknown> = {}
  ) {
    await this.logCustomEvent(eventName, eventParams);
  }

  // Set user ID for cross-session tracking
  async setUserId(userId: string) {
    this.ensureInitialized(); // Ensure analytics is initialized before setting user ID
    if (!this.isInitialized || !this.analytics) return;

    try {
      await setUserId(this.analytics, userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  // Set user properties
  async setUserProperties(properties: Record<string, unknown>) {
    this.ensureInitialized(); // Ensure analytics is initialized before setting user properties
    if (!this.isInitialized || !this.analytics) return;

    try {
      await setUserProperties(this.analytics, properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  // Get current session ID
  getSessionId(): string | null {
    return this.sessionId;
  }

  // Check if analytics is initialized
  isAnalyticsInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions
export const trackProjectView = (data: ProjectViewEvent) =>
  analyticsService.trackProjectView(data);
export const trackMediaInteraction = (data: MediaInteractionEvent) =>
  analyticsService.trackMediaInteraction(data);
export const trackCTAInteraction = (data: CTAInteractionEvent) =>
  analyticsService.trackCTAInteraction(data);
export const trackCrewInteraction = (data: CrewInteractionEvent) =>
  analyticsService.trackCrewInteraction(data);
export const trackPageView = (pagePath: string, pageTitle?: string) =>
  analyticsService.trackPageView(pagePath, pageTitle);
export const trackScrollDepth = (pagePath: string, scrollDepth: number) =>
  analyticsService.trackScrollDepth(pagePath, scrollDepth);
export const trackError = (error: Error, context?: Record<string, unknown>) =>
  analyticsService.trackError(error, context);
export const trackCustomEvent = (
  eventName: string,
  eventParams: Record<string, unknown> = {}
) => analyticsService.trackCustomEvent(eventName, eventParams);
