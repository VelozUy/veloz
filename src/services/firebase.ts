// Firebase Service Layer
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIREBASE_COLLECTIONS } from '@/constants';
import type {
  FAQ,
  Photo,
  Video,
  HomepageContent,
  ContactFormData,
  ApiResponse,
} from '@/types';

// Base service class for common operations
class BaseFirebaseService {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollection() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  protected convertTimestamp(data: DocumentData): DocumentData {
    const converted = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      }
    });
    return converted;
  }

  async getAll<T>(): Promise<ApiResponse<T[]>> {
    try {
      const snapshot = await getDocs(this.getCollection());
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamp(doc.data()),
      })) as T[];

      return { success: true, data };
    } catch (error) {
      console.error(`Error fetching ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getById<T>(id: string): Promise<ApiResponse<T>> {
    try {
      const snapshot = await getDoc(this.getDocRef(id));

      if (!snapshot.exists()) {
        return { success: false, error: 'Document not found' };
      }

      const data = {
        id: snapshot.id,
        ...this.convertTimestamp(snapshot.data()),
      } as T;

      return { success: true, data };
    } catch (error) {
      console.error(`Error fetching ${this.collectionName} by ID:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async create<T>(
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<string>> {
    try {
      const now = new Date();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.getCollection(), docData);
      return { success: true, data: docRef.id };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async update<T>(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<void>> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(this.getDocRef(id), updateData);
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(this.getDocRef(id));
      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Specific service classes
export class HomepageService extends BaseFirebaseService {
  constructor() {
    super(FIREBASE_COLLECTIONS.HOMEPAGE);
  }

  async getContent(): Promise<ApiResponse<HomepageContent>> {
    // Homepage should have a single document
    const result = await this.getAll<HomepageContent>();
    if (result.success && result.data && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    return { success: false, error: 'Homepage content not found' };
  }

  async updateContent(
    data: Partial<HomepageContent>
  ): Promise<ApiResponse<void>> {
    // Get the existing homepage document or create one
    const existing = await this.getContent();
    if (existing.success && existing.data) {
      return this.update(existing.data.id, data);
    } else {
      // Create new homepage content
      const result = await this.create(data);
      return result.success
        ? { success: true }
        : { success: false, error: result.error };
    }
  }
}

export class FAQService extends BaseFirebaseService {
  constructor() {
    super(FIREBASE_COLLECTIONS.FAQS);
  }

  async getActiveFAQs(): Promise<ApiResponse<FAQ[]>> {
    try {
      const q = query(
        this.getCollection(),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamp(doc.data()),
      })) as FAQ[];

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching active FAQs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class PhotoService extends BaseFirebaseService {
  constructor() {
    super(FIREBASE_COLLECTIONS.PHOTOS);
  }

  async getByEventType(eventType: string): Promise<ApiResponse<Photo[]>> {
    try {
      const q = query(
        this.getCollection(),
        where('eventType', '==', eventType),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamp(doc.data()),
      })) as Photo[];

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching photos by event type:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class VideoService extends BaseFirebaseService {
  constructor() {
    super(FIREBASE_COLLECTIONS.VIDEOS);
  }

  async getByEventType(eventType: string): Promise<ApiResponse<Video[]>> {
    try {
      const q = query(
        this.getCollection(),
        where('eventType', '==', eventType),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamp(doc.data()),
      })) as Video[];

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching videos by event type:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class ContactService extends BaseFirebaseService {
  constructor() {
    super(FIREBASE_COLLECTIONS.CONTACTS);
  }

  async submitContactForm(data: ContactFormData): Promise<ApiResponse<string>> {
    try {
      const result = await this.create(data);
      return result;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Service instances
export const homepageService = new HomepageService();
export const faqService = new FAQService();
export const photoService = new PhotoService();
export const videoService = new VideoService();
export const contactService = new ContactService();
