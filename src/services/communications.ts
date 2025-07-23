import { BaseFirebaseService } from './base-firebase-service';
import type { ApiResponse } from '@/types';
import {
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';

export interface Communication {
  id: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  type: 'email' | 'sms' | 'phone' | 'meeting' | 'file_share';
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  attachments?: string[];
  tags?: string[];
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    emailId?: string;
    smsId?: string;
    callDuration?: number;
    meetingNotes?: string;
  };
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms';
  category: 'welcome' | 'follow_up' | 'reminder' | 'custom';
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  rating: number;
  comment: string;
  timestamp: Date;
  category: 'communication' | 'quality' | 'timeline' | 'overall';
  response?: string;
  respondedAt?: Date;
}

class CommunicationsService extends BaseFirebaseService<Communication> {
  constructor() {
    super('communications');
  }

  // Get communications for a specific client
  async getByClientId(clientId: string): Promise<ApiResponse<Communication[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('clientId', '==', clientId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as Communication[];

      return {
        success: true,
        data: communications,
      };
    }, 'getByClientId');
  }

  // Get communications for a specific project
  async getByProjectId(
    projectId: string
  ): Promise<ApiResponse<Communication[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as Communication[];

      return {
        success: true,
        data: communications,
      };
    }, 'getByProjectId');
  }

  // Get communications by type
  async getByType(
    type: Communication['type']
  ): Promise<ApiResponse<Communication[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('type', '==', type),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as Communication[];

      return {
        success: true,
        data: communications,
      };
    }, 'getByType');
  }

  // Get communications by status
  async getByStatus(
    status: Communication['status']
  ): Promise<ApiResponse<Communication[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('status', '==', status),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as Communication[];

      return {
        success: true,
        data: communications,
      };
    }, 'getByStatus');
  }

  // Update communication status
  async updateStatus(
    id: string,
    status: Communication['status']
  ): Promise<ApiResponse<Communication>> {
    return this.withRetry(async () => {
      const docRef = await this.getDocRef(id);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date(),
      });

      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Communication not found');
      }

      const communication = this.processDocument(updatedDoc) as Communication;

      return {
        success: true,
        data: communication,
      };
    }, 'updateStatus');
  }

  // Send a new communication
  async sendCommunication(
    communication: Omit<Communication, 'id' | 'timestamp'>
  ): Promise<ApiResponse<Communication>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const docRef = await addDoc(collection, {
        ...communication,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newDoc = await getDoc(docRef);
      const newCommunication = this.processDocument(newDoc) as Communication;

      return {
        success: true,
        data: newCommunication,
      };
    }, 'sendCommunication');
  }

  // Get communication statistics
  async getStatistics(): Promise<
    ApiResponse<{
      total: number;
      byType: Record<Communication['type'], number>;
      byStatus: Record<Communication['status'], number>;
      byPriority: Record<Communication['priority'], number>;
      recentActivity: Communication[];
    }>
  > {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(collection, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      const communications = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as Communication[];

      const byType = communications.reduce(
        (acc, comm) => {
          acc[comm.type] = (acc[comm.type] || 0) + 1;
          return acc;
        },
        {} as Record<Communication['type'], number>
      );

      const byStatus = communications.reduce(
        (acc, comm) => {
          acc[comm.status] = (acc[comm.status] || 0) + 1;
          return acc;
        },
        {} as Record<Communication['status'], number>
      );

      const byPriority = communications.reduce(
        (acc, comm) => {
          acc[comm.priority] = (acc[comm.priority] || 0) + 1;
          return acc;
        },
        {} as Record<Communication['priority'], number>
      );

      return {
        success: true,
        data: {
          total: communications.length,
          byType,
          byStatus,
          byPriority,
          recentActivity: communications.slice(0, 10),
        },
      };
    }, 'getStatistics');
  }
}

class MessageTemplatesService extends BaseFirebaseService<MessageTemplate> {
  constructor() {
    super('messageTemplates');
  }

  // Get active templates
  async getActiveTemplates(): Promise<ApiResponse<MessageTemplate[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const templates = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as MessageTemplate[];

      return {
        success: true,
        data: templates,
      };
    }, 'getActiveTemplates');
  }

  // Get templates by category
  async getByCategory(
    category: MessageTemplate['category']
  ): Promise<ApiResponse<MessageTemplate[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const templates = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as MessageTemplate[];

      return {
        success: true,
        data: templates,
      };
    }, 'getByCategory');
  }
}

class ClientFeedbackService extends BaseFirebaseService<ClientFeedback> {
  constructor() {
    super('clientFeedback');
  }

  // Get feedback by client
  async getByClientId(
    clientId: string
  ): Promise<ApiResponse<ClientFeedback[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('clientId', '==', clientId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const feedback = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ClientFeedback[];

      return {
        success: true,
        data: feedback,
      };
    }, 'getByClientId');
  }

  // Get feedback by project
  async getByProjectId(
    projectId: string
  ): Promise<ApiResponse<ClientFeedback[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const feedback = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ClientFeedback[];

      return {
        success: true,
        data: feedback,
      };
    }, 'getByProjectId');
  }

  // Get feedback by category
  async getByCategory(
    category: ClientFeedback['category']
  ): Promise<ApiResponse<ClientFeedback[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('category', '==', category),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const feedback = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ClientFeedback[];

      return {
        success: true,
        data: feedback,
      };
    }, 'getByCategory');
  }

  // Add response to feedback
  async addResponse(
    id: string,
    response: string
  ): Promise<ApiResponse<ClientFeedback>> {
    return this.withRetry(async () => {
      const docRef = await this.getDocRef(id);
      await updateDoc(docRef, {
        response,
        respondedAt: new Date(),
        updatedAt: new Date(),
      });

      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Feedback not found');
      }

      const feedback = this.processDocument(updatedDoc) as ClientFeedback;

      return {
        success: true,
        data: feedback,
      };
    }, 'addResponse');
  }

  // Get feedback statistics
  async getFeedbackStatistics(): Promise<
    ApiResponse<{
      total: number;
      averageRating: number;
      byCategory: Record<ClientFeedback['category'], number>;
      byRating: Record<number, number>;
      recentFeedback: ClientFeedback[];
    }>
  > {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(collection, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      const feedback = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ClientFeedback[];

      const byCategory = feedback.reduce(
        (acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        },
        {} as Record<ClientFeedback['category'], number>
      );

      const byRating = feedback.reduce(
        (acc, item) => {
          acc[item.rating] = (acc[item.rating] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      const averageRating =
        feedback.length > 0
          ? feedback.reduce((sum, item) => sum + item.rating, 0) /
            feedback.length
          : 0;

      return {
        success: true,
        data: {
          total: feedback.length,
          averageRating,
          byCategory,
          byRating,
          recentFeedback: feedback.slice(0, 10),
        },
      };
    }, 'getFeedbackStatistics');
  }
}

// Export service instances
export const communicationsService = new CommunicationsService();
export const messageTemplatesService = new MessageTemplatesService();
export const clientFeedbackService = new ClientFeedbackService();
