// Crew Work Assignment Analytics Service
// Tracks crew assignment effectiveness, team collaboration, and project success rates

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
import type { ApiResponse } from '@/types';

export interface CrewAssignmentMetrics {
  crewMemberId: string;
  crewMemberName: string;
  totalAssignments: number;
  completedAssignments: number;
  successRate: number;
  averageProjectRating: number;
  teamCollaboration: {
    soloProjects: number;
    teamProjects: number;
    averageTeamSize: number;
    preferredPartners: Array<{
      partnerId: string;
      partnerName: string;
      projectsTogether: number;
      successRate: number;
    }>;
  };
  categoryPerformance: Array<{
    category: string;
    projects: number;
    successRate: number;
    averageRating: number;
  }>;
  timePerformance: {
    onTimeDeliveries: number;
    lateDeliveries: number;
    averageCompletionTime: number; // in days
    efficiencyScore: number; // 0-100
  };
  clientSatisfaction: {
    averageRating: number;
    positiveReviews: number;
    negativeReviews: number;
    repeatClientRate: number;
  };
}

export interface TeamCollaborationMetrics {
  teamId: string;
  teamMembers: string[];
  totalProjects: number;
  successRate: number;
  averageRating: number;
  communicationEfficiency: number;
  conflictResolution: number;
  projectTypes: string[];
  averageProjectDuration: number;
  clientSatisfaction: number;
}

export interface CrewAssignmentAnalytics {
  overallMetrics: {
    totalCrewMembers: number;
    totalAssignments: number;
    averageSuccessRate: number;
    topPerformingCrew: Array<{
      id: string;
      name: string;
      successRate: number;
      projectsCompleted: number;
    }>;
    bestTeamCombinations: Array<{
      members: string[];
      projectsTogether: number;
      successRate: number;
    }>;
  };
  categoryAnalysis: Array<{
    category: string;
    totalProjects: number;
    averageSuccessRate: number;
    preferredCrewMembers: string[];
  }>;
  timeAnalysis: {
    averageProjectDuration: number;
    onTimeDeliveryRate: number;
    efficiencyTrends: Array<{
      period: string;
      efficiencyScore: number;
    }>;
  };
}

export class CrewAssignmentAnalyticsService {
  /**
   * Get comprehensive analytics for a specific crew member's assignments
   */
  async getCrewMemberAssignmentMetrics(
    crewMemberId: string
  ): Promise<ApiResponse<CrewAssignmentMetrics>> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get crew member data
      const crewMemberDoc = await getDoc(doc(db, 'crewMembers', crewMemberId));
      if (!crewMemberDoc.exists()) {
        return { success: false, error: 'Crew member not found' };
      }

      const crewMember = crewMemberDoc.data();

      // Get all projects where this crew member is assigned
      const projectsQuery = query(
        collection(db, 'projects'),
        where('crewMembers', 'array-contains', crewMemberId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<{
        id: string;
        status?: string;
        crewMembers?: string[];
        eventType?: string;
        clientSatisfaction?: {
          rating?: number;
        };
        timeline?: {
          startDate?: any;
          endDate?: any;
        };
        completedAt?: any;
      }>;

      // Calculate basic metrics
      const totalAssignments = projects.length;
      const completedAssignments = projects.filter(
        p => p.status === 'delivered'
      ).length;
      const successRate =
        totalAssignments > 0
          ? (completedAssignments / totalAssignments) * 100
          : 0;

      // Calculate average rating
      const ratings = projects
        .map(p => p.clientSatisfaction?.rating || 0)
        .filter(r => r > 0);
      const averageProjectRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      // Calculate team collaboration metrics
      const soloProjects = projects.filter(
        p => (p.crewMembers?.length || 0) === 1
      ).length;
      const teamProjects = projects.filter(
        p => (p.crewMembers?.length || 0) > 1
      ).length;
      const averageTeamSize =
        projects.length > 0
          ? projects.reduce((sum, p) => sum + (p.crewMembers?.length || 1), 0) /
            projects.length
          : 1;

      // Find preferred partners
      const partnerMap = new Map<
        string,
        { projects: number; successful: number }
      >();
      projects.forEach(project => {
        if ((project.crewMembers?.length || 0) > 1) {
          project.crewMembers?.forEach((memberId: string) => {
            if (memberId !== crewMemberId) {
              const current = partnerMap.get(memberId) || {
                projects: 0,
                successful: 0,
              };
              current.projects += 1;
              if (project.status === 'delivered') {
                current.successful += 1;
              }
              partnerMap.set(memberId, current);
            }
          });
        }
      });

      // Get partner names and calculate success rates
      const preferredPartners = await Promise.all(
        Array.from(partnerMap.entries()).map(async ([partnerId, stats]) => {
          const partnerDoc = await getDoc(doc(db, 'crewMembers', partnerId));
          const partnerName = partnerDoc.exists()
            ? partnerDoc.data().name?.es ||
              partnerDoc.data().name?.en ||
              'Unknown'
            : 'Unknown';

          return {
            partnerId,
            partnerName,
            projectsTogether: stats.projects,
            successRate:
              stats.projects > 0
                ? (stats.successful / stats.projects) * 100
                : 0,
          };
        })
      );

      // Calculate category performance
      const categoryMap = new Map<
        string,
        { projects: number; successful: number; ratings: number[] }
      >();
      projects.forEach(project => {
        const category = project.eventType || 'other';
        const current = categoryMap.get(category) || {
          projects: 0,
          successful: 0,
          ratings: [],
        };
        current.projects += 1;
        if (project.status === 'delivered') {
          current.successful += 1;
        }
        if (project.clientSatisfaction?.rating) {
          current.ratings.push(project.clientSatisfaction.rating);
        }
        categoryMap.set(category, current);
      });

      const categoryPerformance = Array.from(categoryMap.entries()).map(
        ([category, stats]) => ({
          category,
          projects: stats.projects,
          successRate:
            stats.projects > 0 ? (stats.successful / stats.projects) * 100 : 0,
          averageRating:
            stats.ratings.length > 0
              ? stats.ratings.reduce((sum, rating) => sum + rating, 0) /
                stats.ratings.length
              : 0,
        })
      );

      // Calculate time performance
      const onTimeDeliveries = projects.filter(p => {
        if (p.status !== 'delivered') return false;
        const endDate =
          p.timeline?.endDate?.toDate?.() || new Date(p.timeline?.endDate);
        const completionDate =
          p.completedAt?.toDate?.() || new Date(p.completedAt);
        return completionDate <= endDate;
      }).length;

      const lateDeliveries = completedAssignments - onTimeDeliveries;
      const onTimeDeliveryRate =
        completedAssignments > 0
          ? (onTimeDeliveries / completedAssignments) * 100
          : 0;

      // Calculate average completion time
      const completionTimes = projects
        .filter(
          p =>
            p.status === 'delivered' && p.completedAt && p.timeline?.startDate
        )
        .map(p => {
          const startDate =
            p.timeline?.startDate?.toDate?.() ||
            new Date(p.timeline?.startDate);
          const completionDate =
            p.completedAt?.toDate?.() || new Date(p.completedAt);
          return (
            (completionDate.getTime() - startDate.getTime()) /
            (1000 * 60 * 60 * 24)
          );
        });

      const averageCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) /
            completionTimes.length
          : 0;

      // Calculate efficiency score (combination of success rate, on-time delivery, and client satisfaction)
      const efficiencyScore = Math.round(
        successRate * 0.4 +
          onTimeDeliveryRate * 0.3 +
          averageProjectRating * 10 * 0.3
      );

      // Calculate client satisfaction metrics
      const positiveReviews = projects.filter(
        p => p.clientSatisfaction?.rating && p.clientSatisfaction.rating >= 4
      ).length;
      const negativeReviews = projects.filter(
        p => p.clientSatisfaction?.rating && p.clientSatisfaction.rating <= 2
      ).length;

      // Calculate repeat client rate (simplified - in real implementation, you'd track client IDs)
      const repeatClientRate = Math.random() * 0.3 + 0.1; // Mock data: 10-40%

      const metrics: CrewAssignmentMetrics = {
        crewMemberId,
        crewMemberName: crewMember.name?.es || crewMember.name?.en || 'Unknown',
        totalAssignments,
        completedAssignments,
        successRate,
        averageProjectRating,
        teamCollaboration: {
          soloProjects,
          teamProjects,
          averageTeamSize,
          preferredPartners: preferredPartners.sort(
            (a, b) => b.projectsTogether - a.projectsTogether
          ),
        },
        categoryPerformance,
        timePerformance: {
          onTimeDeliveries,
          lateDeliveries,
          averageCompletionTime,
          efficiencyScore,
        },
        clientSatisfaction: {
          averageRating: averageProjectRating,
          positiveReviews,
          negativeReviews,
          repeatClientRate,
        },
      };

      return { success: true, data: metrics };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch crew assignment metrics',
      };
    }
  }

  /**
   * Get team collaboration analytics
   */
  async getTeamCollaborationMetrics(
    teamMemberIds: string[]
  ): Promise<ApiResponse<TeamCollaborationMetrics>> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get projects where all team members are assigned
      const projectsQuery = query(
        collection(db, 'projects'),
        where('crewMembers', 'array-contains-any', teamMemberIds)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<{
        id: string;
        status?: string;
        crewMembers?: string[];
        eventType?: string;
        clientSatisfaction?: {
          rating?: number;
        };
        timeline?: {
          startDate?: any;
          endDate?: any;
        };
      }>;
      const filteredProjects = projects.filter(p =>
        teamMemberIds.every(id => p.crewMembers?.includes(id))
      );

      const totalProjects = filteredProjects.length;
      const successfulProjects = filteredProjects.filter(
        p => p.status === 'delivered'
      ).length;
      const successRate =
        totalProjects > 0 ? (successfulProjects / totalProjects) * 100 : 0;

      // Calculate average rating
      const ratings = filteredProjects
        .map(p => p.clientSatisfaction?.rating || 0)
        .filter(r => r > 0);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      // Mock communication efficiency and conflict resolution (in real implementation, these would be tracked)
      const communicationEfficiency = Math.random() * 0.4 + 0.6; // 60-100%
      const conflictResolution = Math.random() * 0.3 + 0.7; // 70-100%

      // Get project types
      const projectTypes = [
        ...new Set(filteredProjects.map(p => p.eventType || 'other')),
      ];

      // Calculate average project duration
      const projectDurations = filteredProjects
        .filter(p => p.timeline?.startDate && p.timeline?.endDate)
        .map(p => {
          const startDate =
            p.timeline?.startDate?.toDate?.() ||
            new Date(p.timeline?.startDate);
          const endDate =
            p.timeline?.endDate?.toDate?.() || new Date(p.timeline?.endDate);
          return (
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
        });

      const averageProjectDuration =
        projectDurations.length > 0
          ? projectDurations.reduce((sum, duration) => sum + duration, 0) /
            projectDurations.length
          : 0;

      const metrics: TeamCollaborationMetrics = {
        teamId: teamMemberIds.sort().join('-'),
        teamMembers: teamMemberIds,
        totalProjects,
        successRate,
        averageRating,
        communicationEfficiency,
        conflictResolution,
        projectTypes,
        averageProjectDuration,
        clientSatisfaction: averageRating,
      };

      return { success: true, data: metrics };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch team collaboration metrics',
      };
    }
  }

  /**
   * Get overall crew assignment analytics
   */
  async getCrewAssignmentAnalytics(): Promise<
    ApiResponse<CrewAssignmentAnalytics>
  > {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get all crew members
      const crewMembersQuery = query(collection(db, 'crewMembers'));
      const crewMembersSnapshot = await getDocs(crewMembersQuery);
      const crewMembers = crewMembersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<{
        id: string;
        name?: {
          es?: string;
          en?: string;
        };
      }>;

      // Get all projects
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<{
        id: string;
        status?: string;
        crewMembers?: string[];
        eventType?: string;
        timeline?: {
          startDate?: any;
          endDate?: any;
        };
        completedAt?: any;
      }>;

      // Calculate overall metrics
      const totalCrewMembers = crewMembers.length;
      const totalAssignments = projects.reduce(
        (sum, p) => sum + (p.crewMembers?.length || 0),
        0
      );

      // Calculate top performing crew members
      const crewPerformance = await Promise.all(
        crewMembers.map(async crew => {
          const metrics = await this.getCrewMemberAssignmentMetrics(crew.id);
          if (metrics.success && metrics.data) {
            return {
              id: crew.id,
              name: crew.name?.es || crew.name?.en || 'Unknown',
              successRate: metrics.data.successRate,
              projectsCompleted: metrics.data.completedAssignments,
            };
          }
          return {
            id: crew.id,
            name: crew.name?.es || crew.name?.en || 'Unknown',
            successRate: 0,
            projectsCompleted: 0,
          };
        })
      );

      const topPerformingCrew = crewPerformance
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5);

      const averageSuccessRate =
        crewPerformance.length > 0
          ? crewPerformance.reduce((sum, crew) => sum + crew.successRate, 0) /
            crewPerformance.length
          : 0;

      // Find best team combinations
      const teamCombinations = new Map<
        string,
        { projects: number; successful: number }
      >();
      projects.forEach(project => {
        if ((project.crewMembers?.length || 0) > 1) {
          const sortedMembers = project.crewMembers?.sort() || [];
          const teamKey = sortedMembers.join('-');
          const current = teamCombinations.get(teamKey) || {
            projects: 0,
            successful: 0,
          };
          current.projects += 1;
          if (project.status === 'delivered') {
            current.successful += 1;
          }
          teamCombinations.set(teamKey, current);
        }
      });

      const bestTeamCombinations = Array.from(teamCombinations.entries())
        .map(([teamKey, stats]) => ({
          members: teamKey.split('-'),
          projectsTogether: stats.projects,
          successRate:
            stats.projects > 0 ? (stats.successful / stats.projects) * 100 : 0,
        }))
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5);

      // Calculate category analysis
      const categoryMap = new Map<
        string,
        { projects: number; successful: number; crewMembers: Set<string> }
      >();
      projects.forEach(project => {
        const category = project.eventType || 'other';
        const current = categoryMap.get(category) || {
          projects: 0,
          successful: 0,
          crewMembers: new Set(),
        };
        current.projects += 1;
        if (project.status === 'delivered') {
          current.successful += 1;
        }
        project.crewMembers?.forEach((crewId: string) =>
          current.crewMembers.add(crewId)
        );
        categoryMap.set(category, current);
      });

      const categoryAnalysis = Array.from(categoryMap.entries()).map(
        ([category, stats]) => ({
          category,
          totalProjects: stats.projects,
          averageSuccessRate:
            stats.projects > 0 ? (stats.successful / stats.projects) * 100 : 0,
          preferredCrewMembers: Array.from(stats.crewMembers),
        })
      );

      // Calculate time analysis
      const completedProjects = projects.filter(p => p.status === 'delivered');
      const onTimeProjects = completedProjects.filter(p => {
        const endDate =
          p.timeline?.endDate?.toDate?.() || new Date(p.timeline?.endDate);
        const completionDate =
          p.completedAt?.toDate?.() || new Date(p.completedAt);
        return completionDate <= endDate;
      }).length;

      const onTimeDeliveryRate =
        completedProjects.length > 0
          ? (onTimeProjects / completedProjects.length) * 100
          : 0;

      // Calculate average project duration
      const projectDurations = projects
        .filter(p => p.timeline?.startDate && p.timeline?.endDate)
        .map(p => {
          const startDate =
            p.timeline?.startDate?.toDate?.() ||
            new Date(p.timeline?.startDate);
          const endDate =
            p.timeline?.endDate?.toDate?.() || new Date(p.timeline?.endDate);
          return (
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
        });

      const averageProjectDuration =
        projectDurations.length > 0
          ? projectDurations.reduce((sum, duration) => sum + duration, 0) /
            projectDurations.length
          : 0;

      // Mock efficiency trends (in real implementation, this would be calculated over time)
      const efficiencyTrends = Array.from({ length: 12 }, (_, i) => ({
        period: `Month ${i + 1}`,
        efficiencyScore: Math.random() * 20 + 70, // 70-90%
      }));

      const analytics: CrewAssignmentAnalytics = {
        overallMetrics: {
          totalCrewMembers,
          totalAssignments,
          averageSuccessRate,
          topPerformingCrew,
          bestTeamCombinations,
        },
        categoryAnalysis,
        timeAnalysis: {
          averageProjectDuration,
          onTimeDeliveryRate,
          efficiencyTrends,
        },
      };

      return { success: true, data: analytics };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch crew assignment analytics',
      };
    }
  }
}

// Export singleton instance
export const crewAssignmentAnalyticsService =
  new CrewAssignmentAnalyticsService();
