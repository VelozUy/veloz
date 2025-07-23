// Analytics System for Client Project Tracking
// Provides comprehensive reporting and analytics for project performance

import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

export interface ProjectMetrics {
  projectId: string;
  projectTitle: string;
  status: string;
  progress: number;
  timelinePerformance: {
    onTime: boolean;
    daysRemaining: number;
    daysOverdue: number;
  };
  budgetPerformance: {
    totalBudget: number;
    spentAmount: number;
    remainingBudget: number;
    budgetUtilization: number;
  };
  clientSatisfaction: {
    rating?: number;
    feedback?: string;
    lastContact: Date;
  };
  teamPerformance: {
    assignedMembers: number;
    completedTasks: number;
    totalTasks: number;
    efficiency: number;
  };
  communicationMetrics: {
    totalCommunications: number;
    responseTime: number; // in hours
    clientEngagement: number; // percentage
  };
}

export interface BusinessMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectDuration: number; // in days
  averageProjectValue: number;
  totalRevenue: number;
  clientRetentionRate: number;
  teamProductivity: number;
  averageClientSatisfaction: number;
}

export interface TimelineAnalysis {
  projectId: string;
  milestones: Array<{
    id: string;
    title: string;
    plannedDate: Date;
    actualDate?: Date;
    status: 'completed' | 'pending' | 'overdue';
    delayDays?: number;
  }>;
  overallTimeline: {
    startDate: Date;
    endDate: Date;
    actualProgress: number;
    plannedProgress: number;
    variance: number;
  };
}

export interface RevenueAnalysis {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    projects: number;
  }>;
  projectTypeRevenue: Array<{
    eventType: string;
    revenue: number;
    projects: number;
    averageValue: number;
  }>;
  clientValueAnalysis: Array<{
    clientName: string;
    totalValue: number;
    projects: number;
    averageValue: number;
  }>;
}

export interface CrewAnalytics {
  crewMemberId: string;
  crewMemberName: string;
  profileViews: number;
  portfolioViews: number;
  workEngagement: {
    totalWorks: number;
    averageRating: number;
    completionRate: number;
    clientSatisfaction: number;
  };
  categoryPerformance: Array<{
    category: string;
    projects: number;
    averageRating: number;
    popularity: number; // percentage of total views
  }>;
  clientInquiries: {
    total: number;
    conversionRate: number;
    averageResponseTime: number; // in hours
  };
  collaborationMetrics: {
    projectsWithTeam: number;
    averageTeamSize: number;
    teamEfficiency: number;
  };
  timeSeriesData: Array<{
    date: string;
    profileViews: number;
    portfolioViews: number;
    inquiries: number;
  }>;
}

export interface CrewAnalyticsSummary {
  totalCrewMembers: number;
  averageProfileViews: number;
  topPerformingCrew: Array<{
    id: string;
    name: string;
    profileViews: number;
    averageRating: number;
    projectsCompleted: number;
  }>;
  categoryPopularity: Array<{
    category: string;
    totalViews: number;
    averageRating: number;
    crewMembers: number;
  }>;
  overallEngagement: {
    totalProfileViews: number;
    totalPortfolioViews: number;
    totalInquiries: number;
    averageResponseTime: number;
  };
}

export class AnalyticsService {
  /**
   * Get project metrics for a specific project
   */
  async getProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get project data
      const projectQuery = query(
        collection(db, 'projects'),
        where('id', '==', projectId)
      );
      const projectSnapshot = await getDocs(projectQuery);

      if (projectSnapshot.empty) {
        return null;
      }

      const projectData = projectSnapshot.docs[0].data();

      // Get communications for this project
      const communicationsQuery = query(
        collection(db, 'project_communications'),
        where('projectId', '==', projectId),
        orderBy('date', 'desc')
      );
      const communicationsSnapshot = await getDocs(communicationsQuery);
      const communications = communicationsSnapshot.docs.map(doc => doc.data());

      // Calculate metrics
      const progress = projectData.progress || 0;
      const budget = projectData.budget || { total: 0, spent: 0 };
      const timeline = projectData.timeline || {
        startDate: new Date(),
        endDate: new Date(),
      };

      // Timeline performance calculation
      const now = new Date();
      const endDate =
        timeline.endDate?.toDate?.() || new Date(timeline.endDate);
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      const daysOverdue = Math.max(
        0,
        Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      // Communication metrics
      const totalCommunications = communications.length;
      const responseTime =
        totalCommunications > 0
          ? communications.reduce((acc, comm) => {
              // Calculate average response time (simplified)
              return acc + 24; // Assume 24 hours average
            }, 0) / totalCommunications
          : 0;

      const clientEngagement =
        totalCommunications > 0
          ? (communications.filter(comm => comm.direction === 'inbound')
              .length /
              totalCommunications) *
            100
          : 0;

      return {
        projectId,
        projectTitle:
          projectData.title?.es || projectData.title?.en || 'Untitled',
        status: projectData.status || 'draft',
        progress,
        timelinePerformance: {
          onTime: daysOverdue === 0,
          daysRemaining,
          daysOverdue,
        },
        budgetPerformance: {
          totalBudget: budget.total || 0,
          spentAmount: budget.spent || 0,
          remainingBudget: (budget.total || 0) - (budget.spent || 0),
          budgetUtilization:
            budget.total > 0 ? ((budget.spent || 0) / budget.total) * 100 : 0,
        },
        clientSatisfaction: {
          rating: projectData.clientSatisfaction?.rating,
          feedback: projectData.clientSatisfaction?.feedback,
          lastContact:
            communications.length > 0
              ? communications[0].date?.toDate?.() ||
                new Date(communications[0].date)
              : new Date(),
        },
        teamPerformance: {
          assignedMembers: projectData.crewMembers?.length || 0,
          completedTasks:
            projectData.milestones?.filter((m: any) => m.status === 'completed')
              .length || 0,
          totalTasks: projectData.milestones?.length || 0,
          efficiency:
            projectData.milestones?.length > 0
              ? ((projectData.milestones.filter(
                  (m: any) => m.status === 'completed'
                ).length || 0) /
                  projectData.milestones.length) *
                100
              : 0,
        },
        communicationMetrics: {
          totalCommunications,
          responseTime,
          clientEngagement,
        },
      };
    } catch (error) {
      console.error('Error getting project metrics:', error);
      throw new Error('Failed to get project metrics');
    }
  }

  /**
   * Get business metrics across all projects
   */
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get all projects
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Calculate business metrics
      const totalProjects = projects.length;
      const activeProjects = projects.filter(
        p => p.status === 'in-progress'
      ).length;
      const completedProjects = projects.filter(
        p => p.status === 'completed'
      ).length;

      // Calculate average project duration
      const projectDurations = projects
        .filter(p => p.timeline?.startDate && p.timeline?.endDate)
        .map(p => {
          const start =
            p.timeline.startDate?.toDate?.() || new Date(p.timeline.startDate);
          const end =
            p.timeline.endDate?.toDate?.() || new Date(p.timeline.endDate);
          return Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
        });

      const averageProjectDuration =
        projectDurations.length > 0
          ? projectDurations.reduce((acc, duration) => acc + duration, 0) /
            projectDurations.length
          : 0;

      // Calculate revenue metrics
      const projectsWithBudget = projects.filter(p => p.budget?.total);
      const totalRevenue = projectsWithBudget.reduce(
        (acc, p) => acc + (p.budget?.total || 0),
        0
      );
      const averageProjectValue =
        projectsWithBudget.length > 0
          ? totalRevenue / projectsWithBudget.length
          : 0;

      // Calculate client retention (simplified)
      const uniqueClients = new Set(
        projects.map(p => p.clientInfo?.email).filter(Boolean)
      );
      const clientRetentionRate =
        uniqueClients.size > 0
          ? (completedProjects / uniqueClients.size) * 100
          : 0;

      // Calculate team productivity (simplified)
      const totalMilestones = projects.reduce(
        (acc, p) => acc + (p.milestones?.length || 0),
        0
      );
      const completedMilestones = projects.reduce(
        (acc, p) =>
          acc +
          (p.milestones?.filter((m: any) => m.status === 'completed').length ||
            0),
        0
      );
      const teamProductivity =
        totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

      // Calculate average client satisfaction
      const projectsWithSatisfaction = projects.filter(
        p => p.clientSatisfaction?.rating
      );
      const averageClientSatisfaction =
        projectsWithSatisfaction.length > 0
          ? projectsWithSatisfaction.reduce(
              (acc, p) => acc + (p.clientSatisfaction?.rating || 0),
              0
            ) / projectsWithSatisfaction.length
          : 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        averageProjectDuration,
        averageProjectValue,
        totalRevenue,
        clientRetentionRate,
        teamProductivity,
        averageClientSatisfaction,
      };
    } catch (error) {
      console.error('Error getting business metrics:', error);
      throw new Error('Failed to get business metrics');
    }
  }

  /**
   * Get timeline analysis for a specific project
   */
  async getTimelineAnalysis(
    projectId: string
  ): Promise<TimelineAnalysis | null> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get project data
      const projectQuery = query(
        collection(db, 'projects'),
        where('id', '==', projectId)
      );
      const projectSnapshot = await getDocs(projectQuery);

      if (projectSnapshot.empty) {
        return null;
      }

      const projectData = projectSnapshot.docs[0].data();
      const timeline = projectData.timeline || {};
      const milestones = timeline.milestones || [];

      // Calculate timeline analysis
      const now = new Date();
      const startDate =
        timeline.startDate?.toDate?.() || new Date(timeline.startDate);
      const endDate =
        timeline.endDate?.toDate?.() || new Date(timeline.endDate);

      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedDuration = now.getTime() - startDate.getTime();
      const plannedProgress =
        totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
      const actualProgress = projectData.progress || 0;
      const variance = actualProgress - plannedProgress;

      // Analyze milestones
      const analyzedMilestones = milestones.map((milestone: any) => {
        const plannedDate =
          milestone.date?.toDate?.() || new Date(milestone.date);
        const actualDate =
          milestone.completedDate?.toDate?.() ||
          milestone.actualDate?.toDate?.();
        const delayDays =
          actualDate && plannedDate
            ? Math.ceil(
                (actualDate.getTime() - plannedDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;

        return {
          id: milestone.id,
          title: milestone.title,
          plannedDate,
          actualDate,
          status: milestone.status || 'pending',
          delayDays: delayDays > 0 ? delayDays : undefined,
        };
      });

      return {
        projectId,
        milestones: analyzedMilestones,
        overallTimeline: {
          startDate,
          endDate,
          actualProgress,
          plannedProgress,
          variance,
        },
      };
    } catch (error) {
      console.error('Error getting timeline analysis:', error);
      throw new Error('Failed to get timeline analysis');
    }
  }

  /**
   * Get revenue analysis
   */
  async getRevenueAnalysis(): Promise<RevenueAnalysis> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get all projects with budget information
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate monthly revenue
      const monthlyRevenue = this.calculateMonthlyRevenue(projects);

      // Calculate project type revenue
      const projectTypeRevenue = this.calculateProjectTypeRevenue(projects);

      // Calculate client value analysis
      const clientValueAnalysis = this.calculateClientValueAnalysis(projects);

      return {
        monthlyRevenue,
        projectTypeRevenue,
        clientValueAnalysis,
      };
    } catch (error) {
      console.error('Error getting revenue analysis:', error);
      throw new Error('Failed to get revenue analysis');
    }
  }

  /**
   * Calculate monthly revenue from projects
   */
  private calculateMonthlyRevenue(
    projects: any[]
  ): Array<{ month: string; revenue: number; projects: number }> {
    const monthlyData: {
      [key: string]: { revenue: number; projects: number };
    } = {};

    projects.forEach(project => {
      if (project.budget?.total && project.createdAt) {
        const date =
          project.createdAt?.toDate?.() || new Date(project.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, projects: 0 };
        }

        monthlyData[monthKey].revenue += project.budget.total;
        monthlyData[monthKey].projects += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        projects: data.projects,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate project type revenue
   */
  private calculateProjectTypeRevenue(
    projects: any[]
  ): Array<{
    eventType: string;
    revenue: number;
    projects: number;
    averageValue: number;
  }> {
    const typeData: { [key: string]: { revenue: number; projects: number } } =
      {};

    projects.forEach(project => {
      if (project.budget?.total && project.eventType) {
        if (!typeData[project.eventType]) {
          typeData[project.eventType] = { revenue: 0, projects: 0 };
        }

        typeData[project.eventType].revenue += project.budget.total;
        typeData[project.eventType].projects += 1;
      }
    });

    return Object.entries(typeData)
      .map(([eventType, data]) => ({
        eventType,
        revenue: data.revenue,
        projects: data.projects,
        averageValue: data.revenue / data.projects,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Calculate client value analysis
   */
  private calculateClientValueAnalysis(
    projects: any[]
  ): Array<{
    clientName: string;
    totalValue: number;
    projects: number;
    averageValue: number;
  }> {
    const clientData: {
      [key: string]: { totalValue: number; projects: number };
    } = {};

    projects.forEach(project => {
      if (project.budget?.total && project.clientInfo?.name) {
        if (!clientData[project.clientInfo.name]) {
          clientData[project.clientInfo.name] = { totalValue: 0, projects: 0 };
        }

        clientData[project.clientInfo.name].totalValue += project.budget.total;
        clientData[project.clientInfo.name].projects += 1;
      }
    });

    return Object.entries(clientData)
      .map(([clientName, data]) => ({
        clientName,
        totalValue: data.totalValue,
        projects: data.projects,
        averageValue: data.totalValue / data.projects,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }

  // ===== CREW ANALYTICS =====

  /**
   * Get comprehensive analytics for a specific crew member
   */
  async getCrewMemberAnalytics(
    crewMemberId: string
  ): Promise<CrewAnalytics | null> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get crew member data
      const crewMemberDoc = await getDoc(doc(db, 'crewMembers', crewMemberId));
      if (!crewMemberDoc.exists()) {
        return null;
      }

      const crewMember = crewMemberDoc.data();

      // Get projects where this crew member is assigned
      const projectsQuery = query(
        collection(db, 'projects'),
        where('crewMembers', 'array-contains', crewMemberId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as any
      );

      // Calculate analytics
      const totalWorks = projects.length;
      const completedProjects = projects.filter(
        p => p.status === 'delivered'
      ).length;
      const completionRate =
        totalWorks > 0 ? (completedProjects / totalWorks) * 100 : 0;

      // Calculate average rating (mock data for now)
      const averageRating =
        projects.length > 0
          ? projects.reduce(
              (sum, p) => sum + (p.clientSatisfaction?.rating || 0),
              0
            ) / projects.length
          : 0;

      // Calculate category performance
      const categoryMap = new Map<
        string,
        { projects: number; totalRating: number }
      >();
      projects.forEach(project => {
        const category = project.eventType || 'other';
        const current = categoryMap.get(category) || {
          projects: 0,
          totalRating: 0,
        };
        current.projects += 1;
        current.totalRating += project.clientSatisfaction?.rating || 0;
        categoryMap.set(category, current);
      });

      const categoryPerformance = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          projects: data.projects,
          averageRating:
            data.projects > 0 ? data.totalRating / data.projects : 0,
          popularity: (data.projects / totalWorks) * 100,
        })
      );

      // Mock time series data (in real implementation, this would come from analytics events)
      const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          profileViews: Math.floor(Math.random() * 50) + 10,
          portfolioViews: Math.floor(Math.random() * 30) + 5,
          inquiries: Math.floor(Math.random() * 5) + 1,
        };
      });

      return {
        crewMemberId,
        crewMemberName: crewMember.name?.es || crewMember.name?.en || 'Unknown',
        profileViews: Math.floor(Math.random() * 1000) + 100, // Mock data
        portfolioViews: Math.floor(Math.random() * 500) + 50, // Mock data
        workEngagement: {
          totalWorks: totalWorks,
          averageRating: averageRating,
          completionRate: completionRate,
          clientSatisfaction: averageRating,
        },
        categoryPerformance,
        clientInquiries: {
          total: Math.floor(Math.random() * 50) + 10, // Mock data
          conversionRate: Math.random() * 0.3 + 0.1, // 10-40%
          averageResponseTime: Math.floor(Math.random() * 24) + 2, // 2-26 hours
        },
        collaborationMetrics: {
          projectsWithTeam: projects.filter(p => p.crewMembers?.length > 1)
            .length,
          averageTeamSize:
            projects.length > 0
              ? projects.reduce(
                  (sum, p) => sum + (p.crewMembers?.length || 1),
                  0
                ) / projects.length
              : 1,
          teamEfficiency: Math.random() * 0.4 + 0.6, // 60-100%
        },
        timeSeriesData,
      };
    } catch (error) {
      console.error('Error fetching crew member analytics:', error);
      return null;
    }
  }

  /**
   * Get overall crew analytics summary
   */
  async getCrewAnalyticsSummary(): Promise<CrewAnalyticsSummary> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get all crew members
      const crewMembersQuery = query(collection(db, 'crewMembers'));
      const crewMembersSnapshot = await getDocs(crewMembersQuery);
      const crewMembers = crewMembersSnapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as any
      );

      // Get all projects
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as any
      );

      // Calculate top performing crew members
      const crewPerformance = crewMembers.map(crew => {
        const crewProjects = projects.filter(p =>
          p.crewMembers?.includes(crew.id)
        );
        const completedProjects = crewProjects.filter(
          p => p.status === 'delivered'
        ).length;
        const averageRating =
          crewProjects.length > 0
            ? crewProjects.reduce(
                (sum, p) => sum + (p.clientSatisfaction?.rating || 0),
                0
              ) / crewProjects.length
            : 0;

        return {
          id: crew.id,
          name: crew.name?.es || crew.name?.en || 'Unknown',
          profileViews: Math.floor(Math.random() * 1000) + 100, // Mock data
          averageRating: averageRating,
          projectsCompleted: completedProjects,
        };
      });

      const topPerformingCrew = crewPerformance
        .sort((a, b) => b.profileViews - a.profileViews)
        .slice(0, 5);

      // Calculate category popularity
      const categoryMap = new Map<
        string,
        { totalViews: number; totalRating: number; crewMembers: Set<string> }
      >();

      projects.forEach(project => {
        const category = project.eventType || 'other';
        const current = categoryMap.get(category) || {
          totalViews: 0,
          totalRating: 0,
          crewMembers: new Set(),
        };

        current.totalViews += Math.floor(Math.random() * 100) + 20; // Mock views
        current.totalRating += project.clientSatisfaction?.rating || 0;
        project.crewMembers?.forEach((crewId: string) =>
          current.crewMembers.add(crewId)
        );

        categoryMap.set(category, current);
      });

      const categoryPopularity = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          totalViews: data.totalViews,
          averageRating:
            data.totalRating /
              projects.filter(p => p.eventType === category).length || 0,
          crewMembers: data.crewMembers.size,
        })
      );

      return {
        totalCrewMembers: crewMembers.length,
        averageProfileViews:
          crewPerformance.reduce((sum, crew) => sum + crew.profileViews, 0) /
          crewMembers.length,
        topPerformingCrew,
        categoryPopularity,
        overallEngagement: {
          totalProfileViews: crewPerformance.reduce(
            (sum, crew) => sum + crew.profileViews,
            0
          ),
          totalPortfolioViews: Math.floor(Math.random() * 5000) + 1000, // Mock data
          totalInquiries: Math.floor(Math.random() * 200) + 50, // Mock data
          averageResponseTime: Math.floor(Math.random() * 24) + 4, // 4-28 hours
        },
      };
    } catch (error) {
      console.error('Error fetching crew analytics summary:', error);
      throw new Error('Failed to fetch crew analytics summary');
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
