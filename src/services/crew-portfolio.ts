// Crew Portfolio Service
// This service handles crew member portfolio data and project connections

import { projectTrackingService } from './project-tracking';
import { crewMemberService } from './crew-member';
import type { CrewMember, ApiResponse } from '@/types';
import type {
  ProjectStatus,
  EnhancedProject,
  ProjectFile,
} from '@/types/project-tracking';

export interface CrewWork {
  id: string;
  projectId: string;
  title: string;
  category: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  description: string;
  date: string;
  client: string;
  location: string;
  status: ProjectStatus;
  crewRole: string;
  rating?: number;
  review?: string;
  images?: string[];
}

export interface CrewPortfolioStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalWorks: number;
  averageRating: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  recentWorks: CrewWork[];
}

export class CrewPortfolioService {
  // Get all works for a specific crew member
  async getCrewMemberWorks(
    crewMemberId: string
  ): Promise<ApiResponse<CrewWork[]>> {
    try {
      // Get all projects where this crew member is assigned
      const projects = await projectTrackingService.getAllProjects();
      const filteredProjects = projects.filter(project =>
        project.crewMembers.includes(crewMemberId)
      );

      // Transform projects into crew works
      const works: CrewWork[] = [];

      for (const project of filteredProjects) {
        // Get project media files
        const projectFiles = await projectTrackingService.getProjectFiles(
          project.id
        );

        // Create work entries for each media file
        for (const file of projectFiles) {
          if (file.type === 'photo' || file.type === 'video') {
            works.push({
              id: `${project.id}-${file.id}`,
              projectId: project.id,
              title: project.title.es,
              category: project.eventType,
              type: file.type === 'photo' ? 'image' : 'video',
              url: file.url,
              thumbnailUrl: file.url, // In a real implementation, you'd have thumbnails
              description: project.description.es,
              date: project.eventDate,
              client: project.client.name,
              location: project.location,
              status: project.status,
              crewRole: this.getCrewRoleFromProject(project, crewMemberId),
              images: projectFiles
                .filter(f => f.type === 'photo' || f.type === 'video')
                .slice(0, 3)
                .map(f => f.url),
            });
          }
        }
      }

      // Sort by date (most recent first)
      works.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return { success: true, data: works };
    } catch (error) {
      console.error('Error fetching crew member works:', error);
      return { success: false, error: 'Failed to fetch crew member works' };
    }
  }

  // Get crew member portfolio statistics
  async getCrewMemberStats(
    crewMemberId: string
  ): Promise<ApiResponse<CrewPortfolioStats>> {
    try {
      const worksResponse = await this.getCrewMemberWorks(crewMemberId);
      if (!worksResponse.success || !worksResponse.data) {
        return { success: false, error: 'Failed to fetch crew member works' };
      }

      const works = worksResponse.data;

      // Calculate statistics
      const totalProjects = new Set(works.map(w => w.projectId)).size;
      const completedProjects = new Set(
        works.filter(w => w.status === 'delivered').map(w => w.projectId)
      ).size;
      const inProgressProjects = new Set(
        works
          .filter(
            w => w.status === 'in_editing' || w.status === 'shooting_scheduled'
          )
          .map(w => w.projectId)
      ).size;

      // Calculate category distribution
      const categoryCounts: Record<string, number> = {};
      works.forEach(work => {
        categoryCounts[work.category] =
          (categoryCounts[work.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const stats: CrewPortfolioStats = {
        totalProjects,
        completedProjects,
        inProgressProjects,
        totalWorks: works.length,
        averageRating:
          works
            .filter(w => w.rating)
            .reduce((acc, w) => acc + (w.rating || 0), 0) /
            works.filter(w => w.rating).length || 0,
        topCategories,
        recentWorks: works.slice(0, 6),
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error calculating crew member stats:', error);
      return { success: false, error: 'Failed to calculate crew member stats' };
    }
  }

  // Get works by category for a crew member
  async getCrewMemberWorksByCategory(
    crewMemberId: string,
    category: string
  ): Promise<ApiResponse<CrewWork[]>> {
    try {
      const worksResponse = await this.getCrewMemberWorks(crewMemberId);
      if (!worksResponse.success || !worksResponse.data) {
        return { success: false, error: 'Failed to fetch crew member works' };
      }

      const filteredWorks = worksResponse.data.filter(
        work => work.category === category
      );

      return { success: true, data: filteredWorks };
    } catch (error) {
      console.error('Error fetching crew member works by category:', error);
      return {
        success: false,
        error: 'Failed to fetch crew member works by category',
      };
    }
  }

  // Get all crew members with their portfolio stats
  async getAllCrewMembersWithStats(): Promise<
    ApiResponse<Array<CrewMember & { stats: CrewPortfolioStats }>>
  > {
    try {
      const crewResponse = await crewMemberService.getAllCrewMembers();
      if (!crewResponse.success || !crewResponse.data) {
        return { success: false, error: 'Failed to fetch crew members' };
      }

      const crewWithStats = await Promise.all(
        crewResponse.data.map(async crewMember => {
          const statsResponse = await this.getCrewMemberStats(crewMember.id);
          const stats: CrewPortfolioStats =
            statsResponse.success && statsResponse.data
              ? statsResponse.data
              : {
                  totalProjects: 0,
                  completedProjects: 0,
                  inProgressProjects: 0,
                  totalWorks: 0,
                  averageRating: 0,
                  topCategories: [],
                  recentWorks: [],
                };

          return {
            ...crewMember,
            stats,
          };
        })
      );

      return { success: true, data: crewWithStats };
    } catch (error) {
      console.error('Error fetching crew members with stats:', error);
      return {
        success: false,
        error: 'Failed to fetch crew members with stats',
      };
    }
  }

  // Helper method to determine crew role from project
  private getCrewRoleFromProject(
    project: EnhancedProject,
    crewMemberId: string
  ): string {
    // This is a simplified implementation
    // In a real system, you'd have more detailed crew role assignments
    const crewMember = project.crewMembers.find(id => id === crewMemberId);
    if (!crewMember) return 'Miembro del Equipo';

    // You could enhance this by storing specific roles in the project
    // For now, we'll return a generic role
    return 'Fotógrafo/Videógrafo';
  }

  // Get featured works for a crew member (for portfolio showcase)
  async getCrewMemberFeaturedWorks(
    crewMemberId: string
  ): Promise<ApiResponse<CrewWork[]>> {
    try {
      const worksResponse = await this.getCrewMemberWorks(crewMemberId);
      if (!worksResponse.success || !worksResponse.data) {
        return { success: false, error: 'Failed to fetch crew member works' };
      }

      // Filter for completed projects and take the most recent
      const featuredWorks = worksResponse.data
        .filter(work => work.status === 'delivered')
        .slice(0, 12); // Show up to 12 featured works

      return { success: true, data: featuredWorks };
    } catch (error) {
      console.error('Error fetching crew member featured works:', error);
      return {
        success: false,
        error: 'Failed to fetch crew member featured works',
      };
    }
  }
}

// Export singleton instance
export const crewPortfolioService = new CrewPortfolioService();
