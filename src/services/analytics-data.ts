import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

// Analytics Event Schema for Firestore
export const AnalyticsEventFirestoreSchema = z.object({
  eventType: z.enum([
    'project_view',
    'media_interaction',
    'cta_interaction',
    'crew_interaction',
    'page_view',
    'scroll_depth',
    'session_start',
    'session_end',
    'error',
  ]),
  projectId: z.string().optional(),
  eventData: z.record(z.unknown()),
  sessionId: z.string(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet', 'unknown']),
  userLanguage: z.string(),
  timestamp: z.instanceof(Timestamp),
  userId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(), // Anonymized for GDPR compliance
});

// Enhanced Analytics Summary Schema with detailed media metrics
export const AnalyticsSummarySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.instanceof(Timestamp),
  endDate: z.instanceof(Timestamp),
  totalViews: z.number(),
  uniqueVisitors: z.number(),
  avgTimeOnPage: z.number(),
  ctaClicks: z.number(),
  mediaInteractions: z.number(),
  crewInteractions: z.number(),
  // Enhanced media interaction metrics
  mediaInteractionBreakdown: z.object({
    views: z.number(),
    plays: z.number(),
    pauses: z.number(),
    completes: z.number(),
    zooms: z.number(),
  }),
  topProjects: z.array(
    z.object({
      projectId: z.string(),
      projectTitle: z.string(),
      views: z.number(),
      interactions: z.number(),
    })
  ),
  deviceBreakdown: z.record(z.number()),
  languageBreakdown: z.record(z.number()),
  // Traffic source/UTM aggregations
  trafficSourceBreakdown: z.record(z.number()).optional(),
  trafficMediumBreakdown: z.record(z.number()).optional(),
  utmSourceBreakdown: z.record(z.number()).optional(),
  utmCampaignBreakdown: z.record(z.number()).optional(),
  referrerDomainBreakdown: z.record(z.number()).optional(),
  conversionRate: z.number(),
  bounceRate: z.number(),
});

export type AnalyticsEventFirestore = z.infer<
  typeof AnalyticsEventFirestoreSchema
>;
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;

// Enhanced analytics data processing functions
export async function processAnalyticsData(
  startDate: Date,
  endDate: Date,
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<AnalyticsSummary> {
  try {
    // Get raw analytics events for the period
    const events = await getAnalyticsEvents(startDate, endDate);

    // Process events into summary data
    const summary = await aggregateAnalyticsEvents(
      events,
      startDate,
      endDate,
      period
    );

    return summary;
  } catch (error) {
    throw error;
  }
}

// Get analytics events from Firestore
export async function getAnalyticsEvents(startDate: Date, endDate: Date) {
  try {
    if (!db) {
      return [];
    }

    const eventsRef = collection(db, 'analytics');
    const q = query(
      eventsRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as unknown as AnalyticsEventFirestore;
    });
  } catch (error) {
    return [];
  }
}

export async function aggregateAnalyticsEvents(
  events: AnalyticsEventFirestore[],
  startDate: Date,
  endDate: Date,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<AnalyticsSummary> {
  // Group events by project
  const projectStats = new Map<
    string,
    {
      views: number;
      interactions: number;
      title: string;
    }
  >();

  // Device and language breakdown
  const deviceBreakdown: Record<string, number> = {};
  const languageBreakdown: Record<string, number> = {};
  // Traffic aggregations
  const trafficSourceBreakdown: Record<string, number> = {};
  const trafficMediumBreakdown: Record<string, number> = {};
  const utmSourceBreakdown: Record<string, number> = {};
  const utmCampaignBreakdown: Record<string, number> = {};
  const referrerDomainBreakdown: Record<string, number> = {};

  // Session tracking
  const sessions = new Set<string>();
  const sessionDurations: number[] = [];
  const pageViews: number[] = [];
  let ctaClicks = 0;
  let mediaInteractions = 0;
  let crewInteractions = 0;

  // Enhanced media interaction tracking
  const mediaInteractionBreakdown = {
    views: 0,
    plays: 0,
    pauses: 0,
    completes: 0,
    zooms: 0,
  };

  events.forEach(event => {
    // Track sessions
    sessions.add(event.sessionId);

    // Device and language breakdown
    deviceBreakdown[event.deviceType] =
      (deviceBreakdown[event.deviceType] || 0) + 1;
    languageBreakdown[event.userLanguage] =
      (languageBreakdown[event.userLanguage] || 0) + 1;

    // Traffic source fields may be stored inside eventData
    const ed = (event.eventData || {}) as Record<string, unknown>;
    const trafficSource = (ed['traffic_source'] as string) || '';
    const trafficMedium = (ed['traffic_medium'] as string) || '';
    const utmSource = (ed['utm_source'] as string) || '';
    const utmCampaign = (ed['utm_campaign'] as string) || '';
    const referrerDomain = (ed['referrer_domain'] as string) || '';

    if (trafficSource) {
      trafficSourceBreakdown[trafficSource] =
        (trafficSourceBreakdown[trafficSource] || 0) + 1;
    }
    if (trafficMedium) {
      trafficMediumBreakdown[trafficMedium] =
        (trafficMediumBreakdown[trafficMedium] || 0) + 1;
    }
    if (utmSource) {
      utmSourceBreakdown[utmSource] = (utmSourceBreakdown[utmSource] || 0) + 1;
    }
    if (utmCampaign) {
      utmCampaignBreakdown[utmCampaign] =
        (utmCampaignBreakdown[utmCampaign] || 0) + 1;
    }
    if (referrerDomain) {
      referrerDomainBreakdown[referrerDomain] =
        (referrerDomainBreakdown[referrerDomain] || 0) + 1;
    }

    // Event type processing
    switch (event.eventType) {
      case 'project_view':
        if (event.projectId) {
          const projectData = projectStats.get(event.projectId) || {
            views: 0,
            interactions: 0,
            title:
              (event.eventData as { projectTitle: string }).projectTitle ||
              'Unknown Project',
          };
          projectData.views++;
          projectStats.set(event.projectId, projectData);
        }
        break;

      case 'media_interaction':
        mediaInteractions++;
        if (event.projectId) {
          const projectData = projectStats.get(event.projectId) || {
            views: 0,
            interactions: 0,
            title: 'Unknown Project',
          };
          projectData.interactions++;
          projectStats.set(event.projectId, projectData);
        }

        // Track specific media interaction types
        const interactionType = (
          event.eventData as { interaction_type: string }
        ).interaction_type;
        if (interactionType) {
          switch (interactionType) {
            case 'view':
              mediaInteractionBreakdown.views++;
              break;
            case 'play':
              mediaInteractionBreakdown.plays++;
              break;
            case 'pause':
              mediaInteractionBreakdown.pauses++;
              break;
            case 'complete':
              mediaInteractionBreakdown.completes++;
              break;
            default:
              // For backward compatibility, treat unknown types as views
              mediaInteractionBreakdown.views++;
              break;
          }
        } else {
          // Default to view if no interaction type specified
          mediaInteractionBreakdown.views++;
        }
        break;

      case 'cta_interaction':
        ctaClicks++;
        break;

      case 'crew_interaction':
        crewInteractions++;
        break;

      case 'page_view':
        pageViews.push(1);
        break;
    }
  });

  // Calculate top projects
  const topProjects = Array.from(projectStats.entries())
    .map(([projectId, stats]) => ({
      projectId,
      projectTitle: stats.title,
      views: stats.views,
      interactions: stats.interactions,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Calculate metrics
  const totalViews = pageViews.length;
  const uniqueVisitors = sessions.size;
  const avgTimeOnPage =
    sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;

  // Calculate conversion and bounce rates
  const conversionRate = totalViews > 0 ? (ctaClicks / totalViews) * 100 : 0;
  const bounceRate =
    totalViews > 0 ? ((totalViews - uniqueVisitors) / totalViews) * 100 : 0;

  return {
    period,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    totalViews,
    uniqueVisitors,
    avgTimeOnPage,
    ctaClicks,
    mediaInteractions,
    crewInteractions,
    mediaInteractionBreakdown,
    topProjects,
    deviceBreakdown,
    languageBreakdown,
    trafficSourceBreakdown,
    trafficMediumBreakdown,
    utmSourceBreakdown,
    utmCampaignBreakdown,
    referrerDomainBreakdown,
    conversionRate,
    bounceRate,
  };
}

// Get analytics summaries for different time periods
export async function getAnalyticsSummaries(
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 30
): Promise<AnalyticsSummary[]> {
  const summaries: AnalyticsSummary[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const events = await getAnalyticsEvents(startDate, endDate);
    const summary = await aggregateAnalyticsEvents(
      events,
      startDate,
      endDate,
      period
    );
    summaries.push(summary);

    return summaries;
  } catch (error) {
    return [];
  }
}

// Get real-time analytics data
export async function getRealTimeAnalytics(): Promise<{
  activeUsers: number;
  currentSessions: number;
  recentEvents: AnalyticsEventFirestore[];
}> {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const events = await getAnalyticsEvents(fiveMinutesAgo, now);
    const activeSessions = new Set(events.map(e => e.sessionId));

    return {
      activeUsers: activeSessions.size,
      currentSessions: activeSessions.size,
      recentEvents: events.slice(0, 10), // Last 10 events
    };
  } catch (error) {
    return {
      activeUsers: 0,
      currentSessions: 0,
      recentEvents: [],
    };
  }
}

// Get project-specific analytics with enhanced media metrics
export async function getProjectAnalytics(projectId: string): Promise<{
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  mediaInteractions: number;
  crewInteractions: number;
  conversionRate: number;
  mediaInteractionBreakdown: {
    views: number;
    plays: number;
    pauses: number;
    completes: number;
    zooms: number;
  };
  topMedia: Array<{
    mediaId: string;
    interactions: number;
    interactionType: string;
  }>;
}> {
  try {
    if (!db) {
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: 0,
        mediaInteractions: 0,
        crewInteractions: 0,
        conversionRate: 0,
        mediaInteractionBreakdown: {
          views: 0,
          plays: 0,
          pauses: 0,
          completes: 0,
          zooms: 0,
        },
        topMedia: [],
      };
    }

    const eventsRef = collection(db, 'analytics');
    const q = query(
      eventsRef,
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as unknown as AnalyticsEventFirestore;
    });

    // Process project-specific data
    const totalViews = events.filter(
      e => e.eventType === 'project_view'
    ).length;
    const uniqueVisitors = new Set(events.map(e => e.sessionId)).size;
    const mediaInteractions = events.filter(
      e => e.eventType === 'media_interaction'
    ).length;
    const crewInteractions = events.filter(
      e => e.eventType === 'crew_interaction'
    ).length;

    // Calculate average time on page (simplified)
    const avgTimeOnPage = totalViews > 0 ? 120 : 0; // Placeholder calculation

    // Calculate conversion rate
    const ctaClicks = events.filter(
      e => e.eventType === 'cta_interaction'
    ).length;
    const conversionRate = totalViews > 0 ? (ctaClicks / totalViews) * 100 : 0;

    // Enhanced media interaction breakdown
    const mediaInteractionBreakdown = {
      views: 0,
      plays: 0,
      pauses: 0,
      completes: 0,
      zooms: 0,
    };

    // Get top media interactions with interaction types
    const mediaStats = new Map<
      string,
      { interactions: number; types: Set<string> }
    >();
    events
      .filter(e => e.eventType === 'media_interaction')
      .forEach(event => {
        const mediaId = (event.eventData as { mediaId: string }).mediaId;
        const interactionType =
          (event.eventData as { interaction_type: string }).interaction_type ||
          'view';

        if (mediaId) {
          const stats = mediaStats.get(mediaId) || {
            interactions: 0,
            types: new Set(),
          };
          stats.interactions++;
          stats.types.add(interactionType);
          mediaStats.set(mediaId, stats);
        }

        // Update breakdown
        switch (interactionType) {
          case 'view':
            mediaInteractionBreakdown.views++;
            break;
          case 'play':
            mediaInteractionBreakdown.plays++;
            break;
          case 'pause':
            mediaInteractionBreakdown.pauses++;
            break;
          case 'complete':
            mediaInteractionBreakdown.completes++;
            break;
          default:
            mediaInteractionBreakdown.views++;
            break;
        }
      });

    const topMedia = Array.from(mediaStats.entries())
      .map(([mediaId, stats]) => ({
        mediaId,
        interactions: stats.interactions,
        interactionType: Array.from(stats.types).join(', '),
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5);

    return {
      totalViews,
      uniqueVisitors,
      avgTimeOnPage,
      mediaInteractions,
      crewInteractions,
      conversionRate,
      mediaInteractionBreakdown,
      topMedia,
    };
  } catch (error) {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      avgTimeOnPage: 0,
      mediaInteractions: 0,
      crewInteractions: 0,
      conversionRate: 0,
      mediaInteractionBreakdown: {
        views: 0,
        plays: 0,
        pauses: 0,
        completes: 0,
        zooms: 0,
      },
      topMedia: [],
    };
  }
}

// Export analytics data for download
export async function exportAnalyticsData(
  startDate: Date,
  endDate: Date,
  format: 'csv' | 'json' = 'csv'
): Promise<string> {
  try {
    const events = await getAnalyticsEvents(startDate, endDate);

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    }

    // CSV format
    const headers = [
      'Event Type',
      'Project ID',
      'Session ID',
      'Device Type',
      'Language',
      'Timestamp',
      'Interaction Type',
      'Media ID',
      'Media Type',
    ];

    const csvRows = [headers.join(',')];

    events.forEach(event => {
      const row = [
        event.eventType,
        event.projectId || '',
        event.sessionId,
        event.deviceType,
        event.userLanguage,
        event.timestamp.toDate().toISOString(),
        (event.eventData as { interaction_type: string }).interaction_type ||
          '',
        (event.eventData as { media_id: string }).media_id || '',
        (event.eventData as { media_type: string }).media_type || '',
      ]
        .map(field => `"${field}"`)
        .join(',');

      csvRows.push(row);
    });

    return csvRows.join('\n');
  } catch (error) {
    throw new Error('Failed to export analytics data');
  }
}
