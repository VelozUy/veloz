// Enhanced Project Tracking Service
// This service handles comprehensive project tracking functionality

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { getFirestoreService } from '@/lib/firebase';
import {
  EnhancedProject,
  Milestone,
  Communication,
  ProjectFile,
  Notification,
  ClientSession,
  ProjectStatus,
  MilestoneStatus,
  MilestoneType,
  CommunicationType,
  FileType,
  NotificationType,
} from '@/types/project-tracking';

export class ProjectTrackingService {
  // Get Firestore instance
  private async getDb(): Promise<Firestore> {
    const db = await getFirestoreService();
    if (!db) {
      throw new Error('Firestore not available');
    }
    return db;
  }

  // ===== PROJECT MANAGEMENT =====

  /**
   * Create a new enhanced project with tracking capabilities
   */
  async createProject(
    projectData: Omit<EnhancedProject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const db = await this.getDb();
      const projectRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        progress: {
          percentage: 0,
          completedMilestones: 0,
          totalMilestones: 0,
          lastUpdated: new Date().toISOString(),
        },
      });

      return projectRef.id;
    } catch (error) {
      throw new Error('Failed to create project');
    }
  }

  /**
   * Get enhanced project with all tracking data
   */
  async getProject(projectId: string): Promise<EnhancedProject | null> {
    try {
      const db = await this.getDb();
      const projectDoc = await getDoc(doc(db, 'projects', projectId));

      if (!projectDoc.exists()) {
        return null;
      }

      const projectData = projectDoc.data();

      // Fetch related data
      const [milestones, communications, files, notifications] =
        await Promise.all([
          this.getProjectMilestones(projectId),
          this.getProjectCommunications(projectId),
          this.getProjectFiles(projectId),
          this.getProjectNotifications(projectId),
        ]);

      return {
        id: projectDoc.id,
        ...projectData,
        timeline: milestones,
        communications,
        files,
        createdAt: projectData.createdAt?.toDate() || new Date(),
        updatedAt: projectData.updatedAt?.toDate() || new Date(),
      } as EnhancedProject;
    } catch (error) {
      throw new Error('Failed to fetch project');
    }
  }

  /**
   * Update project with tracking data
   */
  async updateProject(
    projectId: string,
    updates: Partial<EnhancedProject>
  ): Promise<void> {
    try {
      const db = await this.getDb();
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to update project');
    }
  }

  /**
   * Get all projects with tracking summary
   */
  async getAllProjects(): Promise<EnhancedProject[]> {
    try {
      const db = await this.getDb();
      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(projectsQuery);
      const projects: EnhancedProject[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as EnhancedProject);
      }

      return projects;
    } catch (error) {
      throw new Error('Failed to fetch projects');
    }
  }

  // ===== MILESTONE MANAGEMENT =====

  /**
   * Create a new milestone for a project
   */
  async createMilestone(
    projectId: string,
    milestoneData: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const db = await this.getDb();
      const milestoneRef = await addDoc(
        collection(db, 'projects', projectId, 'milestones'),
        {
          ...milestoneData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      // Update project progress
      await this.updateProjectProgress(projectId);

      return milestoneRef.id;
    } catch (error) {
      throw new Error('Failed to create milestone');
    }
  }

  /**
   * Get all milestones for a project
   */
  async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    try {
      const db = await this.getDb();
      const milestonesQuery = query(
        collection(db, 'projects', projectId, 'milestones'),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(milestonesQuery);
      const milestones: Milestone[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        milestones.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Milestone);
      }

      return milestones;
    } catch (error) {
      throw new Error('Failed to fetch milestones');
    }
  }

  /**
   * Update milestone status
   */
  async updateMilestone(
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<void> {
    try {
      const db = await this.getDb();
      const milestoneRef = doc(
        db,
        'projects',
        projectId,
        'milestones',
        milestoneId
      );
      await updateDoc(milestoneRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update project progress
      await this.updateProjectProgress(projectId);
    } catch (error) {
      throw new Error('Failed to update milestone');
    }
  }

  // ===== COMMUNICATION MANAGEMENT =====

  /**
   * Create a new communication log entry
   */
  async createCommunication(
    projectId: string,
    communicationData: Omit<Communication, 'id' | 'timestamp'>
  ): Promise<string> {
    try {
      const db = await this.getDb();
      const communicationRef = await addDoc(
        collection(db, 'projects', projectId, 'communications'),
        {
          ...communicationData,
          timestamp: serverTimestamp(),
        }
      );

      return communicationRef.id;
    } catch (error) {
      throw new Error('Failed to create communication');
    }
  }

  /**
   * Get all communications for a project
   */
  async getProjectCommunications(projectId: string): Promise<Communication[]> {
    try {
      const db = await this.getDb();
      const communicationsQuery = query(
        collection(db, 'projects', projectId, 'communications'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(communicationsQuery);
      const communications: Communication[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        communications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Communication);
      }

      return communications;
    } catch (error) {
      throw new Error('Failed to fetch communications');
    }
  }

  // ===== FILE MANAGEMENT =====

  /**
   * Create a new project file record
   */
  async createProjectFile(
    projectId: string,
    fileData: Omit<ProjectFile, 'id' | 'uploadedAt'>
  ): Promise<string> {
    try {
      const db = await this.getDb();
      const fileRef = await addDoc(
        collection(db, 'projects', projectId, 'files'),
        {
          ...fileData,
          uploadedAt: serverTimestamp(),
          downloadCount: 0,
        }
      );

      return fileRef.id;
    } catch (error) {
      throw new Error('Failed to create project file');
    }
  }

  /**
   * Get all files for a project
   */
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    try {
      const db = await this.getDb();
      const filesQuery = query(
        collection(db, 'projects', projectId, 'files'),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(filesQuery);
      const files: ProjectFile[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        files.push({
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          lastDownloaded: data.lastDownloaded?.toDate(),
        } as ProjectFile);
      }

      return files;
    } catch (error) {
      throw new Error('Failed to fetch project files');
    }
  }

  /**
   * Update file download count
   */
  async incrementFileDownloadCount(
    projectId: string,
    fileId: string
  ): Promise<void> {
    try {
      const db = await this.getDb();
      const fileRef = doc(db, 'projects', projectId, 'files', fileId);
      const fileDoc = await getDoc(fileRef);
      const currentCount = fileDoc.data()?.downloadCount || 0;

      await updateDoc(fileRef, {
        downloadCount: currentCount + 1,
        lastDownloaded: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to update file download count');
    }
  }

  // ===== NOTIFICATION MANAGEMENT =====

  /**
   * Create a new notification
   */
  async createNotification(
    notificationData: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const db = await this.getDb();
      const notificationRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp(),
      });

      return notificationRef.id;
    } catch (error) {
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get notifications for a project
   */
  async getProjectNotifications(projectId: string): Promise<Notification[]> {
    try {
      const db = await this.getDb();
      const notificationsQuery = query(
        collection(db, 'projects', projectId, 'notifications'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(notificationsQuery);
      const notifications: Notification[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate(),
          scheduledFor: data.scheduledFor?.toDate(),
        } as Notification);
      }

      return notifications;
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(
    projectId: string,
    notificationId: string
  ): Promise<void> {
    try {
      const db = await this.getDb();
      const notificationRef = doc(
        db,
        'projects',
        projectId,
        'notifications',
        notificationId
      );
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  }

  // ===== CLIENT PORTAL MANAGEMENT =====

  /**
   * Create client session for portal access
   */
  async createClientSession(
    projectId: string,
    accessCode: string,
    clientEmail: string
  ): Promise<string> {
    try {
      // Validate access code
      const project = await this.getProject(projectId);
      if (!project || project.client.accessCode !== accessCode) {
        throw new Error('Invalid access code');
      }

      const db = await this.getDb();
      const sessionRef = await addDoc(collection(db, 'clientSessions'), {
        projectId,
        accessCode,
        clientEmail,
        lastAccess: serverTimestamp(),
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      return sessionRef.id;
    } catch (error) {
      throw new Error('Failed to create client session');
    }
  }

  /**
   * Validate client access to project
   */
  async validateClientAccess(
    projectId: string,
    accessCode: string
  ): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      return project?.client.accessCode === accessCode;
    } catch (error) {
      return false;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Update project progress based on milestones
   */
  private async updateProjectProgress(projectId: string): Promise<void> {
    try {
      const milestones = await this.getProjectMilestones(projectId);
      const completedMilestones = milestones.filter(
        m => m.status === 'completed'
      ).length;
      const totalMilestones = milestones.length;
      const percentage =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0;

      await this.updateProject(projectId, {
        progress: {
          percentage,
          completedMilestones,
          totalMilestones,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {}
  }

  /**
   * Generate unique access code for client
   */
  generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get project summary for dashboard
   */
  async getProjectSummary(projectId: string): Promise<{
    id: string;
    title: EnhancedProject['title'];
    status: EnhancedProject['status'];
    eventDate: string;
    client: EnhancedProject['client'];
    progress: EnhancedProject['progress'];
    priority: EnhancedProject['priority'];
    lastCommunication?: Communication;
    nextMilestone?: Milestone;
    unreadNotifications: number;
  } | null> {
    try {
      const project = await this.getProject(projectId);
      if (!project) return null;

      const lastCommunication = project.communications[0];
      const nextMilestone = project.timeline.find(m => m.status === 'pending');
      const notifications = await this.getProjectNotifications(projectId);
      const unreadNotifications = notifications.filter(
        (n: Notification) => !n.read
      ).length;

      return {
        id: project.id,
        title: project.title,
        status: project.status,
        eventDate: project.eventDate,
        client: project.client,
        progress: project.progress,
        priority: project.priority,
        lastCommunication,
        nextMilestone,
        unreadNotifications,
      };
    } catch (error) {
      throw new Error('Failed to get project summary');
    }
  }
}

// Export singleton instance
export const projectTrackingService = new ProjectTrackingService();
