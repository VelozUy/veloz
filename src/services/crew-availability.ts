// Crew Member Availability Service
// Manages crew member availability tracking, scheduling, and calendar functionality

import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import type { ApiResponse } from '@/types';

export interface AvailabilitySlot {
  id: string;
  crewMemberId: string;
  startTime: Date;
  endTime: Date;
  type: 'available' | 'unavailable' | 'busy';
  reason?: string;
  projectId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySchedule {
  crewMemberId: string;
  crewMemberName: string;
  weeklySchedule: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityConflict {
  crewMemberId: string;
  crewMemberName: string;
  conflictingSlots: AvailabilitySlot[];
  projectId?: string;
  projectTitle?: string;
  conflictType: 'double_booking' | 'unavailable_time' | 'schedule_conflict';
}

export interface AvailabilityCalendar {
  crewMemberId: string;
  crewMemberName: string;
  slots: AvailabilitySlot[];
  schedule: AvailabilitySchedule;
  conflicts: AvailabilityConflict[];
  nextAvailableSlot?: Date;
  totalAvailableHours: number;
  totalBusyHours: number;
  availabilityPercentage: number;
}

export interface CreateAvailabilitySlotData {
  crewMemberId: string;
  startTime: Date;
  endTime: Date;
  type: 'available' | 'unavailable' | 'busy';
  reason?: string;
  projectId?: string;
  notes?: string;
}

export interface UpdateAvailabilitySlotData {
  startTime?: Date;
  endTime?: Date;
  type?: 'available' | 'unavailable' | 'busy';
  reason?: string;
  projectId?: string;
  notes?: string;
}

export class CrewAvailabilityService {
  /**
   * Create a new availability slot
   */
  async createAvailabilitySlot(
    data: CreateAvailabilitySlotData
  ): Promise<ApiResponse<AvailabilitySlot>> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Validate time range
      if (data.startTime >= data.endTime) {
        return { success: false, error: 'Start time must be before end time' };
      }

      // Check for conflicts
      const conflicts = await this.checkAvailabilityConflicts(
        data.crewMemberId,
        data.startTime,
        data.endTime,
        undefined
      );

      if (conflicts.length > 0) {
        return {
          success: false,
          error: `Conflicts detected: ${conflicts.map(c => c.conflictType).join(', ')}`,
        };
      }

      const slotData = {
        ...data,
        startTime: Timestamp.fromDate(data.startTime),
        endTime: Timestamp.fromDate(data.endTime),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'crewAvailability'), slotData);
      const slot: AvailabilitySlot = {
        id: docRef.id,
        ...data,
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return { success: true, data: slot };
    } catch (error) {
      return { success: false, error: 'Failed to create availability slot' };
    }
  }

  /**
   * Update an availability slot
   */
  async updateAvailabilitySlot(
    slotId: string,
    data: UpdateAvailabilitySlotData
  ): Promise<ApiResponse<void>> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get current slot
      const slotDoc = await getDoc(doc(db, 'crewAvailability', slotId));
      if (!slotDoc.exists()) {
        return { success: false, error: 'Availability slot not found' };
      }

      const currentSlot = slotDoc.data();
      const startTime = data.startTime || currentSlot.startTime.toDate();
      const endTime = data.endTime || currentSlot.endTime.toDate();

      // Validate time range
      if (startTime >= endTime) {
        return { success: false, error: 'Start time must be before end time' };
      }

      // Check for conflicts (excluding current slot)
      const conflicts = await this.checkAvailabilityConflicts(
        currentSlot.crewMemberId,
        startTime,
        endTime,
        slotId
      );

      if (conflicts.length > 0) {
        return {
          success: false,
          error: `Conflicts detected: ${conflicts.map(c => c.conflictType).join(', ')}`,
        };
      }

      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (data.startTime)
        updateData.startTime = Timestamp.fromDate(data.startTime);
      if (data.endTime) updateData.endTime = Timestamp.fromDate(data.endTime);
      if (data.type) updateData.type = data.type;
      if (data.reason !== undefined) updateData.reason = data.reason;
      if (data.projectId !== undefined) updateData.projectId = data.projectId;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await updateDoc(doc(db, 'crewAvailability', slotId), updateData);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update availability slot' };
    }
  }

  /**
   * Delete an availability slot
   */
  async deleteAvailabilitySlot(slotId: string): Promise<ApiResponse<void>> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      await deleteDoc(doc(db, 'crewAvailability', slotId));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete availability slot' };
    }
  }

  /**
   * Get availability calendar for a crew member
   */
  async getCrewMemberAvailability(
    crewMemberId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ApiResponse<AvailabilityCalendar>> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get crew member data
      const crewMemberDoc = await getDoc(doc(db, 'crewMembers', crewMemberId));
      if (!crewMemberDoc.exists()) {
        return { success: false, error: 'Crew member not found' };
      }

      const crewMember = crewMemberDoc.data();

      // Get availability slots
      const slotsQuery = query(
        collection(db, 'crewAvailability'),
        where('crewMemberId', '==', crewMemberId),
        where('startTime', '>=', Timestamp.fromDate(startDate)),
        where('endTime', '<=', Timestamp.fromDate(endDate)),
        orderBy('startTime', 'asc')
      );
      const slotsSnapshot = await getDocs(slotsQuery);
      const slots: AvailabilitySlot[] = slotsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          crewMemberId: data.crewMemberId,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          type: data.type,
          reason: data.reason,
          projectId: data.projectId,
          notes: data.notes,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      });

      // Get or create default schedule
      const scheduleQuery = query(
        collection(db, 'crewAvailabilitySchedules'),
        where('crewMemberId', '==', crewMemberId)
      );
      const scheduleSnapshot = await getDocs(scheduleQuery);

      let schedule: AvailabilitySchedule;
      if (scheduleSnapshot.empty) {
        // Create default schedule
        schedule = {
          crewMemberId,
          crewMemberName:
            crewMember.name?.es || crewMember.name?.en || 'Unknown',
          weeklySchedule: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '10:00', end: '16:00', available: true },
            sunday: { start: '10:00', end: '16:00', available: true },
          },
          timezone: 'America/Montevideo',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } else {
        const scheduleData = scheduleSnapshot.docs[0].data();
        schedule = {
          crewMemberId: scheduleData.crewMemberId,
          crewMemberName: scheduleData.crewMemberName,
          weeklySchedule: scheduleData.weeklySchedule,
          timezone: scheduleData.timezone,
          createdAt: scheduleData.createdAt.toDate(),
          updatedAt: scheduleData.updatedAt.toDate(),
        };
      }

      // Calculate availability metrics
      const totalAvailableHours = slots
        .filter(s => s.type === 'available')
        .reduce((sum, slot) => {
          const hours =
            (slot.endTime.getTime() - slot.startTime.getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }, 0);

      const totalBusyHours = slots
        .filter(s => s.type === 'busy')
        .reduce((sum, slot) => {
          const hours =
            (slot.endTime.getTime() - slot.startTime.getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }, 0);

      const totalHours = totalAvailableHours + totalBusyHours;
      const availabilityPercentage =
        totalHours > 0 ? (totalAvailableHours / totalHours) * 100 : 0;

      // Find next available slot
      const now = new Date();
      const nextAvailableSlot = slots
        .filter(s => s.type === 'available' && s.startTime > now)
        .sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        )[0]?.startTime;

      // Check for conflicts
      const conflicts = await this.detectConflicts(crewMemberId, slots);

      const calendar: AvailabilityCalendar = {
        crewMemberId,
        crewMemberName: schedule.crewMemberName,
        slots,
        schedule,
        conflicts,
        nextAvailableSlot,
        totalAvailableHours,
        totalBusyHours,
        availabilityPercentage,
      };

      return { success: true, data: calendar };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch crew member availability',
      };
    }
  }

  /**
   * Check for availability conflicts
   */
  private async checkAvailabilityConflicts(
    crewMemberId: string,
    startTime: Date,
    endTime: Date,
    excludeSlotId?: string
  ): Promise<AvailabilityConflict[]> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      const conflicts: AvailabilityConflict[] = [];

      // Check for overlapping slots
      const overlappingQuery = query(
        collection(db, 'crewAvailability'),
        where('crewMemberId', '==', crewMemberId),
        where('startTime', '<', Timestamp.fromDate(endTime)),
        where('endTime', '>', Timestamp.fromDate(startTime))
      );
      const overlappingSnapshot = await getDocs(overlappingQuery);

      const overlappingSlots: AvailabilitySlot[] = overlappingSnapshot.docs
        .filter(doc => !excludeSlotId || doc.id !== excludeSlotId)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            crewMemberId: data.crewMemberId,
            startTime: data.startTime.toDate(),
            endTime: data.endTime.toDate(),
            type: data.type,
            reason: data.reason,
            projectId: data.projectId,
            notes: data.notes,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          };
        });

      if (overlappingSlots.length > 0) {
        // Get crew member name
        const crewMemberDoc = await getDoc(
          doc(db, 'crewMembers', crewMemberId)
        );
        const crewMemberName = crewMemberDoc.exists()
          ? crewMemberDoc.data().name?.es ||
            crewMemberDoc.data().name?.en ||
            'Unknown'
          : 'Unknown';

        conflicts.push({
          crewMemberId,
          crewMemberName,
          conflictingSlots: overlappingSlots,
          conflictType: 'double_booking',
        });
      }

      return conflicts;
    } catch (error) {
      return [];
    }
  }

  /**
   * Detect conflicts in existing slots
   */
  private async detectConflicts(
    crewMemberId: string,
    slots: AvailabilitySlot[]
  ): Promise<AvailabilityConflict[]> {
    const conflicts: AvailabilityConflict[] = [];
    const overlappingSlots: AvailabilitySlot[] = [];

    // Simple conflict detection - overlapping slots
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slotA = slots[i];
        const slotB = slots[j];

        if (
          slotA.startTime < slotB.endTime &&
          slotA.endTime > slotB.startTime
        ) {
          overlappingSlots.push(slotA, slotB);
        }
      }
    }

    if (overlappingSlots.length > 0) {
      conflicts.push({
        crewMemberId,
        crewMemberName: 'Unknown', // Will be filled by caller
        conflictingSlots: overlappingSlots,
        conflictType: 'double_booking',
      });
    }

    return conflicts;
  }

  /**
   * Get all crew members availability for a date range
   */
  async getAllCrewAvailability(
    startDate: Date,
    endDate: Date
  ): Promise<ApiResponse<AvailabilityCalendar[]>> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      // Get all crew members
      const crewMembersQuery = query(collection(db, 'crewMembers'));
      const crewMembersSnapshot = await getDocs(crewMembersQuery);
      const crewMembers = crewMembersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get availability for each crew member
      const availabilityPromises = crewMembers.map(crew =>
        this.getCrewMemberAvailability(crew.id, startDate, endDate)
      );

      const results = await Promise.all(availabilityPromises);
      const calendars: AvailabilityCalendar[] = [];

      results.forEach(result => {
        if (result.success && result.data) {
          calendars.push(result.data);
        }
      });

      return { success: true, data: calendars };
    } catch (error) {
      return { success: false, error: 'Failed to fetch all crew availability' };
    }
  }

  /**
   * Find available crew members for a specific time slot
   */
  async findAvailableCrewMembers(
    startTime: Date,
    endTime: Date,
    requiredSkills?: string[]
  ): Promise<
    ApiResponse<
      Array<{
        crewMemberId: string;
        crewMemberName: string;
        availabilityPercentage: number;
      }>
    >
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
        skills?: string[];
      }>;

      // Filter by skills if specified
      const filteredCrewMembers = requiredSkills
        ? crewMembers.filter(crew =>
            requiredSkills.some(skill => crew.skills?.includes(skill))
          )
        : crewMembers;

      // Check availability for each crew member
      const availableCrewMembers = [];

      for (const crew of filteredCrewMembers) {
        const availability = await this.getCrewMemberAvailability(
          crew.id,
          startTime,
          endTime
        );

        if (availability.success && availability.data) {
          const hasConflicts = availability.data.conflicts.length > 0;
          const hasBusySlots = availability.data.slots.some(
            s =>
              s.type === 'busy' &&
              s.startTime < endTime &&
              s.endTime > startTime
          );

          if (!hasConflicts && !hasBusySlots) {
            availableCrewMembers.push({
              crewMemberId: crew.id,
              crewMemberName: crew.name?.es || crew.name?.en || 'Unknown',
              availabilityPercentage: availability.data.availabilityPercentage,
            });
          }
        }
      }

      // Sort by availability percentage
      availableCrewMembers.sort(
        (a, b) => b.availabilityPercentage - a.availabilityPercentage
      );

      return { success: true, data: availableCrewMembers };
    } catch (error) {
      return { success: false, error: 'Failed to find available crew members' };
    }
  }
}

// Export singleton instance
export const crewAvailabilityService = new CrewAvailabilityService();
