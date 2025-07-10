import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

// Analytics Event Schema for Firestore
export const AnalyticsEventFirestoreSchema = z.object({
  eventType: z.enum(['project_view', 'media_interaction', 'cta_interaction', 'crew_interaction', 'page_view', 'scroll_depth', 'session_start', 'session_end', 'error']),
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

export type AnalyticsEventFirestore = z.infer<typeof AnalyticsEventFirestoreSchema>;

// Analytics Summary Schema
export const AnalyticsSummarySchema = z.object({
  period: z.string(), // 'daily', 'weekly', 'monthly'
  startDate: z.instanceof(Timestamp),
  endDate: z.instanceof(Timestamp),
  totalViews: z.number(),
  uniqueVisitors: z.number(),
  avgTimeOnPage: z.number(),
  ctaClicks: z.number(),
  mediaInteractions: z.number(),
  crewInteractions: z.number(),
  topProjects: z.array(z.object({
    projectId: z.string(),
    projectTitle: z.string(),
    views: z.number(),
    interactions: z.number(),
  })),
  deviceBreakdown: z.record(z.number()),
  languageBreakdown: z.record(z.number()),
  conversionRate: z.number(),
  bounceRate: z.number(),
});

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
    const summary = await aggregateAnalyticsEvents(events, startDate, endDate, period);
    
    return summary;
  } catch (error) {
    console.error('Error processing analytics data:', error);
    throw error;
  }
}

export async function getAnalyticsEvents(startDate: Date, endDate: Date) {
  const eventsRef = collection(db, 'analytics');
  const q = query(
    eventsRef,
    where('timestamp', '>=', Timestamp.fromDate(startDate)),
    where('timestamp', '<=', Timestamp.fromDate(endDate)),
    orderBy('timestamp', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as AnalyticsEventFirestore[];
}

export async function aggregateAnalyticsEvents(
  events: AnalyticsEventFirestore[],
  startDate: Date,
  endDate: Date,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<AnalyticsSummary> {
  // Group events by project
  const projectStats = new Map<string, {
    views: number;
    interactions: number;
    title: string;
  }>();
  
  // Device and language breakdown
  const deviceBreakdown: Record<string, number> = {};
  const languageBreakdown: Record<string, number> = {};
  
  // Session tracking
  const sessions = new Set<string>();
  const sessionDurations: number[] = [];
  const pageViews: number[] = [];
  const ctaClicks = 0;
  const mediaInteractions = 0;
  const crewInteractions = 0;
  
  events.forEach(event => {
    // Track sessions
    sessions.add(event.sessionId);
    
    // Device and language breakdown
    deviceBreakdown[event.deviceType] = (deviceBreakdown[event.deviceType] || 0) + 1;
    languageBreakdown[event.userLanguage] = (languageBreakdown[event.userLanguage] || 0) + 1;
    
    // Event type processing
    switch (event.eventType) {
      case 'project_view':
        if (event.projectId) {
          const projectData = projectStats.get(event.projectId) || {
            views: 0,
            interactions: 0,
            title: (event.eventData as any).projectTitle || 'Unknown Project'
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
            title: 'Unknown Project'
          };
          projectData.interactions++;
          projectStats.set(event.projectId, projectData);
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
  const avgTimeOnPage = sessionDurations.length > 0 
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
    : 0;
  
  // Calculate conversion and bounce rates
  const conversionRate = totalViews > 0 ? (ctaClicks / totalViews) * 100 : 0;
  const bounceRate = totalViews > 0 ? ((totalViews - uniqueVisitors) / totalViews) * 100 : 0;
  
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
    topProjects,
    deviceBreakdown,
    languageBreakdown,
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
    const summary = await aggregateAnalyticsEvents(events, startDate, endDate, period);
    summaries.push(summary);
    
    return summaries;
  } catch (error) {
    console.error('Error getting analytics summaries:', error);
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
    console.error('Error getting real-time analytics:', error);
    return {
      activeUsers: 0,
      currentSessions: 0,
      recentEvents: [],
    };
  }
}

// Get project-specific analytics
export async function getProjectAnalytics(projectId: string): Promise<{
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  mediaInteractions: number;
  crewInteractions: number;
  conversionRate: number;
  topMedia: Array<{ mediaId: string; interactions: number }>;
}> {
  try {
    const eventsRef = collection(db, 'analytics');
    const q = query(
      eventsRef,
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalyticsEventFirestore[];
    
    // Process project-specific data
    const totalViews = events.filter(e => e.eventType === 'project_view').length;
    const uniqueVisitors = new Set(events.map(e => e.sessionId)).size;
    const mediaInteractions = events.filter(e => e.eventType === 'media_interaction').length;
    const crewInteractions = events.filter(e => e.eventType === 'crew_interaction').length;
    
    // Calculate average time on page (simplified)
    const avgTimeOnPage = totalViews > 0 ? 120 : 0; // Placeholder calculation
    
    // Calculate conversion rate
    const ctaClicks = events.filter(e => e.eventType === 'cta_interaction').length;
    const conversionRate = totalViews > 0 ? (ctaClicks / totalViews) * 100 : 0;
    
    // Get top media interactions
    const mediaStats = new Map<string, number>();
    events
      .filter(e => e.eventType === 'media_interaction')
      .forEach(event => {
        const mediaId = (event.eventData as any).mediaId;
        if (mediaId) {
          mediaStats.set(mediaId, (mediaStats.get(mediaId) || 0) + 1);
        }
      });
    
    const topMedia = Array.from(mediaStats.entries())
      .map(([mediaId, interactions]) => ({ mediaId, interactions }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5);
    
    return {
      totalViews,
      uniqueVisitors,
      avgTimeOnPage,
      mediaInteractions,
      crewInteractions,
      conversionRate,
      topMedia,
    };
  } catch (error) {
    console.error('Error getting project analytics:', error);
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      avgTimeOnPage: 0,
      mediaInteractions: 0,
      crewInteractions: 0,
      conversionRate: 0,
      topMedia: [],
    };
  }
} 