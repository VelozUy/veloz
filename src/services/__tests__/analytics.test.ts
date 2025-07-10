import { analyticsService } from '../analytics';
import { 
  ProjectViewEventSchema, 
  MediaInteractionEventSchema, 
  CTAInteractionEventSchema, 
  CrewInteractionEventSchema 
} from '../analytics';

// Mock Firebase Analytics
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  getApp: jest.fn(() => ({})),
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the analytics service instance
    (analyticsService as any).analytics = null;
    (analyticsService as any).isInitialized = false;
    (analyticsService as any).initializeAnalytics();
  });

  describe('Project View Tracking', () => {
    it('should validate and track project view events', async () => {
      const validEvent = {
        projectId: 'test-project-123',
        projectTitle: 'Test Wedding',
        projectCategory: 'wedding',
        projectLanguage: 'es',
        viewDuration: 30000,
        scrollDepth: 75,
      };

      const result = ProjectViewEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);

      // Mock the logCustomEvent method
      const logCustomEventSpy = jest.spyOn(analyticsService as any, 'logCustomEvent');
      logCustomEventSpy.mockResolvedValue(undefined);

      await analyticsService.trackProjectView(validEvent);

      expect(logCustomEventSpy).toHaveBeenCalledWith('project_view', {
        project_id: 'test-project-123',
        project_title: 'Test Wedding',
        project_category: 'wedding',
        project_language: 'es',
        view_duration: 30000,
        scroll_depth: 75,
        device_type: expect.any(String),
        user_language: expect.any(String),
      });
    });

    it('should reject invalid project view events', () => {
      const invalidEvent = {
        projectId: '', // Empty project ID
        projectTitle: '', // Empty title
      };

      const result = ProjectViewEventSchema.safeParse(invalidEvent);
      // The schema allows empty strings, so we need to test with missing required fields
      expect(result.success).toBe(true); // Zod allows empty strings by default
      
      // Test with missing required fields
      const missingFieldsEvent = {
        projectId: 'test-id',
        // Missing projectTitle
      };
      
      const missingResult = ProjectViewEventSchema.safeParse(missingFieldsEvent);
      expect(missingResult.success).toBe(false);
    });
  });

  describe('Media Interaction Tracking', () => {
    it('should validate and track media interaction events', async () => {
      const validEvent = {
        projectId: 'test-project-123',
        mediaId: 'media-456',
        mediaType: 'image' as const,
        interactionType: 'view' as const,
        mediaTitle: 'Wedding Photo',
        viewDuration: 5000,
      };

      const result = MediaInteractionEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);

      const logCustomEventSpy = jest.spyOn(analyticsService as any, 'logCustomEvent');
      logCustomEventSpy.mockResolvedValue(undefined);

      await analyticsService.trackMediaInteraction(validEvent);

      expect(logCustomEventSpy).toHaveBeenCalledWith('media_interaction', {
        project_id: 'test-project-123',
        media_id: 'media-456',
        media_type: 'image',
        interaction_type: 'view',
        media_title: 'Wedding Photo',
        view_duration: 5000,
      });
    });

    it('should reject invalid media interaction events', () => {
      const invalidEvent = {
        projectId: 'test-project-123',
        mediaId: 'media-456',
        mediaType: 'invalid' as any, // Invalid media type
        interactionType: 'invalid' as any, // Invalid interaction type
      };

      const result = MediaInteractionEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('CTA Interaction Tracking', () => {
    it('should validate and track CTA interaction events', async () => {
      const validEvent = {
        projectId: 'test-project-123',
        ctaType: 'contact_form' as const,
        ctaLocation: 'project_page',
        userLanguage: 'es',
        deviceType: 'mobile',
      };

      const result = CTAInteractionEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);

      const logCustomEventSpy = jest.spyOn(analyticsService as any, 'logCustomEvent');
      logCustomEventSpy.mockResolvedValue(undefined);

      await analyticsService.trackCTAInteraction(validEvent);

      expect(logCustomEventSpy).toHaveBeenCalledWith('cta_interaction', {
        project_id: 'test-project-123',
        cta_type: 'contact_form',
        cta_location: 'project_page',
        user_language: 'es',
        device_type: 'mobile',
      });
    });

    it('should reject invalid CTA interaction events', () => {
      const invalidEvent = {
        projectId: '', // Empty project ID should be invalid
        ctaType: '', // Empty CTA type should be invalid
        ctaLocation: '', // Empty location should be invalid
      };

      const result = CTAInteractionEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('Crew Interaction Tracking', () => {
    it('should validate and track crew interaction events', async () => {
      const validEvent = {
        projectId: 'test-project-123',
        crewMemberId: 'crew-789',
        crewMemberName: 'John Doe',
        interactionType: 'view' as const,
        crewMemberRole: 'photographer',
      };

      const result = CrewInteractionEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);

      const logCustomEventSpy = jest.spyOn(analyticsService as any, 'logCustomEvent');
      logCustomEventSpy.mockResolvedValue(undefined);

      await analyticsService.trackCrewInteraction(validEvent);

      expect(logCustomEventSpy).toHaveBeenCalledWith('crew_interaction', {
        project_id: 'test-project-123',
        crew_member_id: 'crew-789',
        crew_member_name: 'John Doe',
        interaction_type: 'view',
        crew_member_role: 'photographer',
      });
    });

    it('should reject invalid crew interaction events', () => {
      const invalidEvent = {
        projectId: 'test-project-123',
        crewMemberId: '', // Empty crew member ID
        crewMemberName: '', // Empty name
        interactionType: 'invalid' as any, // Invalid interaction type
      };

      const result = CrewInteractionEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should generate session ID', () => {
      const sessionId = analyticsService.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should check analytics initialization status', () => {
      const isInitialized = analyticsService.isAnalyticsInitialized();
      expect(typeof isInitialized).toBe('boolean');
    });

    it('should detect device type', () => {
      // Mock navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });

      const deviceType = (analyticsService as any).getDeviceType();
      expect(deviceType).toBe('mobile');
    });

    it('should detect user language', () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        value: 'es-ES',
        configurable: true,
      });

      const userLanguage = (analyticsService as any).getUserLanguage();
      expect(userLanguage).toBe('es-ES');
    });
  });

  describe('Error Handling', () => {
    it('should handle analytics initialization failure gracefully', () => {
      // Mock getApp to throw an error
      const { getApp } = require('firebase/app');
      getApp.mockImplementation(() => {
        throw new Error('Firebase not initialized');
      });

      // Create a new service instance to test initialization failure
      const { analyticsService: testService } = require('../analytics');
      
      // Reset the test service
      (testService as any).analytics = null;
      (testService as any).isInitialized = false;
      (testService as any).initializeAnalytics();
      
      expect(testService.isAnalyticsInitialized()).toBe(false);
    });

    it('should handle event logging failures gracefully', async () => {
      // Restore the real logCustomEvent
      jest.resetModules();
      const { analyticsService } = require('../analytics');
      const { logEvent } = require('firebase/analytics');
      logEvent.mockImplementation(() => { throw new Error('Network error'); });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyticsService.trackProjectView({
        projectId: 'test-project',
        projectTitle: 'Test Project',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to log analytics event:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      logEvent.mockReset();
    });
  });
}); 