import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DashboardStats {
  totalProjects: number;
  totalFAQs: number;
  totalCrewMembers: number;
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: Date;
  }>;
}

export class DashboardStatsService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get counts from different collections
      const projectsSnapshot = await getDocs(collection(db!, 'projects'));
      const faqsSnapshot = await getDocs(collection(db!, 'faqs'));
      const crewSnapshot = await getDocs(collection(db!, 'crewMembers'));
      const usersSnapshot = await getDocs(collection(db!, 'adminUsers'));

      // Get recent activity (last 5 projects)
      const recentProjectsQuery = query(
        collection(db!, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentProjectsSnapshot = await getDocs(recentProjectsQuery);

      const recentActivity = recentProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'project',
        title: doc.data().title || 'Untitled Project',
        timestamp: doc.data().createdAt?.toDate() || new Date(),
      }));

      return {
        totalProjects: projectsSnapshot.size,
        totalFAQs: faqsSnapshot.size,
        totalCrewMembers: crewSnapshot.size,
        totalUsers: usersSnapshot.size,
        recentActivity,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }
}
