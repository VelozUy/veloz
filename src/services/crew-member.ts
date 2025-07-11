// Crew Member Service for managing crew member data
import {
  query,
  where,
  orderBy,
  getDocs,
  writeBatch,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { BaseFirebaseService } from './base-firebase-service';
import { crewMemberSchema } from '@/lib/validation-schemas';

// Re-export the schema for convenience
export { crewMemberSchema };
import type {
  CrewMember,
  CreateCrewMemberData,
  UpdateCrewMemberData,
  ApiResponse,
} from '@/types';

export class CrewMemberService extends BaseFirebaseService<CrewMember> {
  validationSchema = crewMemberSchema;
  constructor() {
    super('crewMembers');
    this.cacheConfig = {
      enabled: true,
      ttl: 10 * 60 * 1000, // 10 minutes cache for crew data
      maxSize: 50,
    };
  }

  // Get all crew members ordered by display order
  async getAllCrewMembers(): Promise<ApiResponse<CrewMember[]>> {
    return this.getAll();
  }

  // Get crew members by skills
  async getCrewMembersBySkills(
    skills: string[]
  ): Promise<ApiResponse<CrewMember[]>> {
    const cacheKey = this.getCacheKey('getCrewMembersBySkills', { skills });
    const cached = this.getFromCache<CrewMember[]>(cacheKey);
    if (cached) return { success: true, data: cached };

    const collectionRef = await this.getCollection();
    const q = query(
      collectionRef,
      where('skills', 'array-contains-any', skills),
      orderBy('order', 'asc'),
      orderBy('name.es', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const crewMembers = querySnapshot.docs.map((doc: QueryDocumentSnapshot) =>
      this.processDocument<CrewMember>(doc)
    );

    this.setCache(cacheKey, crewMembers);
    return { success: true, data: crewMembers };
  }

  // Create a new crew member
  async createCrewMember(
    data: CreateCrewMemberData
  ): Promise<ApiResponse<CrewMember>> {
    const _result = await this.create(data as Omit<CrewMember, 'id'>);

    // Invalidate crew-related caches
    this.invalidateCache();

    return _result;
  }

  // Update a crew member
  async updateCrewMember(
    id: string,
    data: UpdateCrewMemberData
  ): Promise<ApiResponse<void>> {
    await this.update(
      id,
      data as Partial<Omit<CrewMember, 'id' | 'createdAt'>>
    );

    // Invalidate crew-related caches
    this.invalidateCache();

    return { success: true };
  }

  // Delete a crew member
  async deleteCrewMember(id: string): Promise<ApiResponse<void>> {
    await this.delete(id);

    // Invalidate crew-related caches
    this.invalidateCache();

    return { success: true };
  }

  // Reorder crew members
  async reorderCrewMembers(
    crewMemberIds: string[]
  ): Promise<ApiResponse<void>> {
    const collectionRef = await this.getCollection();
    const batch = writeBatch(collectionRef.firestore);
    for (let index = 0; index < crewMemberIds.length; index++) {
      const id = crewMemberIds[index];
      const docRef = await this.getDocRef(id);
      batch.update(docRef, { order: index });
    }
    await batch.commit();

    // Invalidate crew-related caches
    this.invalidateCache();

    return { success: true };
  }

  // Search crew members by name or role
  async searchCrewMembers(
    searchTerm: string
  ): Promise<ApiResponse<CrewMember[]>> {
    const cacheKey = this.getCacheKey('searchCrewMembers', { searchTerm });
    const cached = this.getFromCache<CrewMember[]>(cacheKey);
    if (cached) return { success: true, data: cached };

    // Get all crew members and filter client-side for better search
    const allCrewResponse = await this.getAllCrewMembers();
    if (!allCrewResponse.success || !allCrewResponse.data) {
      return { success: false, error: 'Failed to fetch crew members' };
    }

    const searchLower = searchTerm.toLowerCase();
    const filteredCrew = allCrewResponse.data.filter(crew => {
      const nameMatch = Object.values(crew.name).some(name =>
        name.toLowerCase().includes(searchLower)
      );
      const roleMatch = Object.values(crew.role).some(role =>
        role.toLowerCase().includes(searchLower)
      );
      const skillMatch = crew.skills.some(skill =>
        skill.toLowerCase().includes(searchLower)
      );

      return nameMatch || roleMatch || skillMatch;
    });

    this.setCache(cacheKey, filteredCrew);
    return { success: true, data: filteredCrew };
  }

  // Get crew member statistics
  async getCrewStats(): Promise<
    ApiResponse<{
      total: number;
      bySkills: Record<string, number>;
    }>
  > {
    const cacheKey = this.getCacheKey('getCrewStats');
    const cached = this.getFromCache<{
      total: number;
      bySkills: Record<string, number>;
    }>(cacheKey);
    if (cached) return { success: true, data: cached };

    const allCrewResponse = await this.getAllCrewMembers();
    if (!allCrewResponse.success || !allCrewResponse.data) {
      return { success: false, error: 'Failed to fetch crew members' };
    }

    const crewMembers = allCrewResponse.data;
    const stats = {
      total: crewMembers.length,
      bySkills: {} as Record<string, number>,
    };

    // Count by skills
    crewMembers.forEach(crew => {
      crew.skills.forEach(skill => {
        stats.bySkills[skill] = (stats.bySkills[skill] || 0) + 1;
      });
    });

    this.setCache(cacheKey, stats);
    return { success: true, data: stats };
  }
}

// Export singleton instance
export const crewMemberService = new CrewMemberService();
