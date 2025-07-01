// Crew Member Service for managing crew member data
import { 
  query, 
  where, 
  orderBy, 
  getDocs,
  writeBatch,
  QueryDocumentSnapshot 
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

export class CrewMemberService extends BaseFirebaseService {
  constructor() {
    super('crewMembers', {
      validationSchema: crewMemberSchema,
      cacheConfig: {
        enabled: true,
        ttl: 10 * 60 * 1000, // 10 minutes cache for crew data
        maxSize: 50,
      },
    });
  }

  // Get all crew members ordered by display order
  async getAllCrewMembers(): Promise<ApiResponse<CrewMember[]>> {
    return this.withRetry(async () => {
      const cacheKey = this.getCacheKey('getAllCrewMembers');
      const cached = this.getFromCache<CrewMember[]>(cacheKey);
      if (cached) return { success: true, data: cached };

      const collectionRef = this.getCollection();
      const q = query(
        collectionRef,
        orderBy('order', 'asc'),
        orderBy('name.es', 'asc') // Fallback to Spanish name
      );

      const querySnapshot = await getDocs(q);
      const crewMembers = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => this.processDocument<CrewMember>(doc));

      this.setCache(cacheKey, crewMembers);
      return { success: true, data: crewMembers };
    }, 'getAllCrewMembers');
  }



  // Get crew members by skills
  async getCrewMembersBySkills(skills: string[]): Promise<ApiResponse<CrewMember[]>> {
    return this.withRetry(async () => {
      const cacheKey = this.getCacheKey('getCrewMembersBySkills', { skills });
      const cached = this.getFromCache<CrewMember[]>(cacheKey);
      if (cached) return { success: true, data: cached };

      const collectionRef = this.getCollection();
      const q = query(
        collectionRef,
        where('skills', 'array-contains-any', skills),
        orderBy('order', 'asc'),
        orderBy('name.es', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const crewMembers = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => this.processDocument<CrewMember>(doc));

      this.setCache(cacheKey, crewMembers);
      return { success: true, data: crewMembers };
    }, 'getCrewMembersBySkills');
  }

  // Create a new crew member
  async createCrewMember(data: CreateCrewMemberData): Promise<ApiResponse<string>> {
    return this.withRetry(async () => {
      const validatedData = this.validateData(data);
      const docRef = await this.create<CrewMember>(validatedData as Omit<CrewMember, 'id' | 'createdAt' | 'updatedAt'>);
      
      // Invalidate crew-related caches
      this.invalidateCache('getAllCrewMembers');
      
      return docRef;
    }, 'createCrewMember');
  }

  // Update a crew member
  async updateCrewMember(id: string, data: UpdateCrewMemberData): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      const validatedData = this.validateData(data);
      await this.update<CrewMember>(id, validatedData as Partial<Omit<CrewMember, 'id' | 'createdAt'>>);
      
      // Invalidate crew-related caches
      this.invalidateCache('getAllCrewMembers');
      
      return { success: true };
    }, 'updateCrewMember');
  }

  // Delete a crew member
  async deleteCrewMember(id: string): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.delete(id);
      
      // Invalidate crew-related caches
      this.invalidateCache('getAllCrewMembers');
      
      return { success: true };
    }, 'deleteCrewMember');
  }



  // Reorder crew members
  async reorderCrewMembers(crewMemberIds: string[]): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      const batch = writeBatch(this.getCollection().firestore);
      
      crewMemberIds.forEach((id, index) => {
        const docRef = this.getDocRef(id);
        batch.update(docRef, { order: index });
      });
      
      await batch.commit();
      
      // Invalidate crew-related caches
      this.invalidateCache('getAllCrewMembers');
      
      return { success: true };
    }, 'reorderCrewMembers');
  }

  // Search crew members by name or role
  async searchCrewMembers(searchTerm: string): Promise<ApiResponse<CrewMember[]>> {
    return this.withRetry(async () => {
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
    }, 'searchCrewMembers');
  }

  // Get crew member statistics
  async getCrewStats(): Promise<ApiResponse<{
    total: number;
    bySkills: Record<string, number>;
  }>> {
    return this.withRetry(async () => {
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
    }, 'getCrewStats');
  }
}

// Export singleton instance
export const crewMemberService = new CrewMemberService(); 