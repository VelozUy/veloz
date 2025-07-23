import { getFirestoreService } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { ProjectStatus } from '@/components/admin/ProjectStatusManager';

export interface StatusChange {
  id: string;
  projectId: string;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  timestamp: Date;
  changedBy: string;
  notes?: string;
}

export interface EnhancedProject {
  id: string;
  title: string;
  status: ProjectStatus;
  statusHistory: StatusChange[];
  shootingDate?: Date;
  deliveryDate?: Date;
  clientName?: string;
  clientEmail?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

class ProjectStatusService {
  private async getDb() {
    return await getFirestoreService();
  }

  async getProject(projectId: string): Promise<EnhancedProject | null> {
    try {
      const db = await this.getDb();
      if (!db) throw new Error('Database not available');

      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        return null;
      }

      const projectData = projectDoc.data();
      
      // Get status history
      const statusHistoryQuery = query(
        collection(db, 'projectStatusHistory'),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc')
      );
      
      const statusHistorySnapshot = await getDocs(statusHistoryQuery);
      const statusHistory: StatusChange[] = statusHistorySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          projectId: data.projectId,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          timestamp: data.timestamp.toDate(),
          changedBy: data.changedBy,
          notes: data.notes
        };
      });

      return {
        id: projectDoc.id,
        title: projectData.title?.es || projectData.title?.en || 'Sin título',
        status: projectData.status || 'draft',
        statusHistory,
        shootingDate: projectData.shootingDate?.toDate(),
        deliveryDate: projectData.deliveryDate?.toDate(),
        clientName: projectData.client?.name,
        clientEmail: projectData.client?.email,
        assignee: projectData.assignee,
        priority: projectData.priority || 'medium',
        createdAt: projectData.createdAt?.toDate() || new Date(),
        updatedAt: projectData.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  async updateProjectStatus(
    projectId: string, 
    newStatus: ProjectStatus, 
    changedBy: string, 
    notes?: string
  ): Promise<void> {
    try {
      const db = await this.getDb();
      if (!db) throw new Error('Database not available');

      // Get current project to get current status
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Create status change record
      const statusChange: Omit<StatusChange, 'id'> = {
        projectId,
        fromStatus: project.status,
        toStatus: newStatus,
        timestamp: new Date(),
        changedBy,
        notes
      };

      // Add to status history
      await addDoc(collection(db, 'projectStatusHistory'), {
        ...statusChange,
        timestamp: serverTimestamp()
      });

      // Update project status
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      console.log(`Project ${projectId} status updated from ${project.status} to ${newStatus}`);
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  async getProjectsByStatus(status: ProjectStatus): Promise<EnhancedProject[]> {
    try {
      const db = await this.getDb();
      if (!db) throw new Error('Database not available');

      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects: EnhancedProject[] = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const project = await this.getProject(projectDoc.id);
        if (project) {
          projects.push(project);
        }
      }

      return projects;
    } catch (error) {
      console.error('Error getting projects by status:', error);
      throw error;
    }
  }

  async getProjectsByStatusRange(statuses: ProjectStatus[]): Promise<EnhancedProject[]> {
    try {
      const db = await this.getDb();
      if (!db) throw new Error('Database not available');

      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', 'in', statuses),
        orderBy('updatedAt', 'desc')
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects: EnhancedProject[] = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const project = await this.getProject(projectDoc.id);
        if (project) {
          projects.push(project);
        }
      }

      return projects;
    } catch (error) {
      console.error('Error getting projects by status range:', error);
      throw error;
    }
  }

  async getStatusStatistics(): Promise<Record<ProjectStatus, number>> {
    try {
      const db = await this.getDb();
      if (!db) throw new Error('Database not available');

      const statuses: ProjectStatus[] = [
        'draft', 'shooting_scheduled', 'shooting_completed', 
        'in_editing', 'editing_completed', 'delivered', 'completed'
      ];

      const stats: Record<ProjectStatus, number> = {} as Record<ProjectStatus, number>;

      for (const status of statuses) {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('status', '==', status)
        );
        
        const snapshot = await getDocs(projectsQuery);
        stats[status] = snapshot.size;
      }

      return stats;
    } catch (error) {
      console.error('Error getting status statistics:', error);
      throw error;
    }
  }

  async getRecentStatusChanges(limit: number = 10): Promise<StatusChange[]> {
    try {
      const db = await this.getDb();
      if (!db) throw new Error('Database not available');

      const changesQuery = query(
        collection(db, 'projectStatusHistory'),
        orderBy('timestamp', 'desc'),
        // Note: Firestore doesn't support limit with orderBy on server timestamp
        // We'll need to handle this client-side for now
      );

      const changesSnapshot = await getDocs(changesQuery);
      const changes: StatusChange[] = changesSnapshot.docs
        .slice(0, limit)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            projectId: data.projectId,
            fromStatus: data.fromStatus,
            toStatus: data.toStatus,
            timestamp: data.timestamp.toDate(),
            changedBy: data.changedBy,
            notes: data.notes
          };
        });

      return changes;
    } catch (error) {
      console.error('Error getting recent status changes:', error);
      throw error;
    }
  }

  async getProjectStatusTimeline(projectId: string): Promise<StatusChange[]> {
    try {
      const db = await this.getDb();
      if (!db) throw new Error('Database not available');

      const timelineQuery = query(
        collection(db, 'projectStatusHistory'),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'asc')
      );

      const timelineSnapshot = await getDocs(timelineQuery);
      const timeline: StatusChange[] = timelineSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          projectId: data.projectId,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          timestamp: data.timestamp.toDate(),
          changedBy: data.changedBy,
          notes: data.notes
        };
      });

      return timeline;
    } catch (error) {
      console.error('Error getting project status timeline:', error);
      throw error;
    }
  }
}

export const projectStatusService = new ProjectStatusService(); 