// Mock Firebase before any imports
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  writeBatch: jest.fn(),
  QueryDocumentSnapshot: jest.fn(),
}));

// Mock error handler
jest.mock('@/lib/firebase-error-handler', () => ({
  createErrorResponse: jest.fn(),
}));

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CrewMemberService } from '../crew-member';
import { crewMemberService } from '../crew-member';
import type { CrewMember, CreateCrewMemberData, UpdateCrewMemberData } from '@/types';

describe('CrewMemberService', () => {
  let service: CrewMemberService;

  beforeEach(() => {
    service = new CrewMemberService();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct collection name and validation schema', () => {
      expect(service).toBeInstanceOf(CrewMemberService);
      // Access protected properties for testing
      expect((service as any).collectionName).toBe('crewMembers');
      expect((service as any).validationSchema).toBeDefined();
    });
  });

  describe('validation', () => {
    it('should validate crew member data correctly', () => {
      const validData: CreateCrewMemberData = {
        name: { es: 'María García', en: 'María García', pt: 'María García' },
        role: { es: 'Fotógrafa Principal', en: 'Lead Photographer', pt: 'Fotógrafa Principal' },
        portrait: 'https://example.com/portrait1.jpg',
        bio: { es: 'Bio en español', en: 'Bio in English', pt: 'Bio em português' },
        skills: ['fotografía', 'edición'],
        order: 1,
      };

      // Test validation through the service
      const validated = (service as any).validateData(validData);
      expect(validated).toEqual(validData);
    });

    it('should reject invalid crew member data', () => {
      const invalidData = {
        name: { es: 'María García' }, // Missing en and pt
        role: { es: 'Fotógrafa Principal' }, // Missing en and pt
        portrait: 'not-a-url', // Invalid URL
        bio: { es: 'Bio en español' }, // Missing en and pt
        skills: [], // Empty skills array
        order: -1, // Negative order
      };

      expect(() => {
        (service as any).validateData(invalidData);
      }).toThrow();
    });
  });



  describe('searchCrewMembers', () => {
    it('should search crew members by name, role, or skills', async () => {
      const mockCrewMembers: CrewMember[] = [
        {
          id: '1',
          name: { es: 'María García', en: 'María García', pt: 'María García' },
          role: { es: 'Fotógrafa Principal', en: 'Lead Photographer', pt: 'Fotógrafa Principal' },
          portrait: 'https://example.com/portrait1.jpg',
          bio: { es: 'Bio en español', en: 'Bio in English', pt: 'Bio em português' },
          skills: ['fotografía', 'edición'],
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: { es: 'Juan Pérez', en: 'Juan Pérez', pt: 'Juan Pérez' },
          role: { es: 'Videógrafo', en: 'Videographer', pt: 'Videógrafo' },
          portrait: 'https://example.com/portrait2.jpg',
          bio: { es: 'Bio de Juan', en: 'Juan bio', pt: 'Bio do Juan' },
          skills: ['video'],
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'getAllCrewMembers').mockResolvedValue({
        success: true,
        data: mockCrewMembers,
      });

      const result = await service.searchCrewMembers('María');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCrewMembers[0]]); // Only María should match
    });
  });

  describe('getCrewStats', () => {
    it('should return crew member statistics', async () => {
      const mockCrewMembers: CrewMember[] = [
        {
          id: '1',
          name: { es: 'María García', en: 'María García', pt: 'María García' },
          role: { es: 'Fotógrafa Principal', en: 'Lead Photographer', pt: 'Fotógrafa Principal' },
          portrait: 'https://example.com/portrait1.jpg',
          bio: { es: 'Bio en español', en: 'Bio in English', pt: 'Bio em português' },
          skills: ['fotografía', 'edición'],
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: { es: 'Juan Pérez', en: 'Juan Pérez', pt: 'Juan Pérez' },
          role: { es: 'Videógrafo', en: 'Videographer', pt: 'Videógrafo' },
          portrait: 'https://example.com/portrait2.jpg',
          bio: { es: 'Bio de Juan', en: 'Juan bio', pt: 'Bio do Juan' },
          skills: ['video'],
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'getAllCrewMembers').mockResolvedValue({
        success: true,
        data: mockCrewMembers,
      });

      const result = await service.getCrewStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        total: 2,
        bySkills: {
          fotografía: 1,
          edición: 1,
          video: 1,
        },
      });
    });
  });
});

describe('crewMemberService singleton', () => {
  it('should export a singleton instance', () => {
    expect(crewMemberService).toBeInstanceOf(CrewMemberService);
  });
}); 