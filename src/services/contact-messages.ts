import { BaseFirebaseService } from './base-firebase-service';
import type { ApiResponse, ContactMessage, ContactFormData } from '@/types';
import {
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';

class ContactMessageService extends BaseFirebaseService<ContactMessage> {
  constructor() {
    super('contactMessages');
  }

  // Create a new contact message
  async createMessage(formData: ContactFormData): Promise<ApiResponse<string>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const docRef = await addDoc(collection, {
        ...formData,
        status: 'new',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: docRef.id,
      };
    }, 'createMessage');
  }

  // Mark message as read
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      const docRef = await this.getDocRef(id);
      await updateDoc(docRef, {
        isRead: true,
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: undefined,
      };
    }, 'markAsRead');
  }

  // Update message status
  async updateStatus(
    id: string,
    status: 'new' | 'in_progress' | 'completed' | 'archived'
  ): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      const docRef = await this.getDocRef(id);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: undefined,
      };
    }, 'updateStatus');
  }

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<number>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(collection, where('isRead', '==', false));

      const snapshot = await getDocs(q);

      return {
        success: true,
        data: snapshot.size,
      };
    }, 'getUnreadCount');
  }

  // Get messages by status
  async getByStatus(
    status: ContactMessage['status']
  ): Promise<ApiResponse<ContactMessage[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ContactMessage[];

      return {
        success: true,
        data: messages,
      };
    }, 'getByStatus');
  }

  // Get messages by source
  async getBySource(
    source: ContactMessage['source']
  ): Promise<ApiResponse<ContactMessage[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('source', '==', source),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ContactMessage[];

      return {
        success: true,
        data: messages,
      };
    }, 'getBySource');
  }

  // Get contacts by project ID
  async getByProjectId(
    projectId: string
  ): Promise<ApiResponse<ContactMessage[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ContactMessage[];

      return {
        success: true,
        data: messages,
      };
    }, 'getByProjectId');
  }

  // Assign contact to project
  async assignToProject(
    contactId: string,
    projectId: string
  ): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      const docRef = await this.getDocRef(contactId);
      await updateDoc(docRef, {
        projectId,
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: undefined,
      };
    }, 'assignToProject');
  }

  // Remove contact from project
  async removeFromProject(contactId: string): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      const docRef = await this.getDocRef(contactId);
      await updateDoc(docRef, {
        projectId: null,
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: undefined,
      };
    }, 'removeFromProject');
  }

  // Get unassigned contacts
  async getUnassigned(): Promise<ApiResponse<ContactMessage[]>> {
    return this.withRetry(async () => {
      const collection = await this.getCollection();
      const q = query(
        collection,
        where('projectId', '==', null),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc =>
        this.processDocument(doc)
      ) as ContactMessage[];

      return {
        success: true,
        data: messages,
      };
    }, 'getUnassigned');
  }
}

// Export service instance
export const contactMessageService = new ContactMessageService();
