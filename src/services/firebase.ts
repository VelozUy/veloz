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
  writeBatch,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  ref,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import { db, getStorageService } from '@/lib/firebase';
import { FIREBASE_COLLECTIONS } from '@/constants';
import type {
  FAQ,
  Photo,
  Video,
  HomepageContent,
  ContactFormData,
  ContactMessage,
  ContactMessageData,
  ApiResponse,
  SocialPost,
} from '@/types';
import {
  faqSchema,
  projectSchema,
  projectMediaSchema,
  socialPostSchema,
  homepageContentSchema,
  aboutContentSchema,
  formContentSchema,
  crewMemberSchema,
  validateFAQ,
  validateProject,
  validateProjectMedia,
  validateSocialPost,
  validateHomepageContent,
  validateAboutContent,
  validateFormContent,
  validateCrewMember,
} from '@/lib/validation-schemas';

// Base service class for common operations
class BaseFirebaseService<T> {
  protected collectionName: string;
  protected schema: unknown;

  constructor(collectionName: string, schema: unknown) {
    this.collectionName = collectionName;
    this.schema = schema;
  }

  protected getCollection() {
    if (!db) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    if (!db) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
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

  async getById<T>(id: string): Promise<ApiResponse<T | null>> {
    try {
      const docSnap = await getDoc(this.getDocRef(id));

      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...this.convertTimestamp(docSnap.data()),
        } as T;
        return { success: true, data };
      } else {
        return { success: true, data: null };
      }
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

  protected handleError<T>(
    error: unknown,
    defaultMessage: string
  ): ApiResponse<T> {
    console.error(defaultMessage, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : defaultMessage,
    };
  }
}

// FAQ Service
export class FAQService extends BaseFirebaseService<FAQ> {
  constructor() {
    super(FIREBASE_COLLECTIONS.FAQS, faqSchema);
  }

  async getByCategory(category: string): Promise<ApiResponse<FAQ[]>> {
    try {
      const q = query(
        this.getCollection(),
        where('category', '==', category),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamp(doc.data()),
      })) as FAQ[];

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching FAQs by category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getPublished(): Promise<ApiResponse<FAQ[]>> {
    try {
      const q = query(
        this.getCollection(),
        where('status', '==', 'published'),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamp(doc.data()),
      })) as FAQ[];

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching published FAQs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class PhotoService extends BaseFirebaseService<Photo> {
  constructor() {
    super(FIREBASE_COLLECTIONS.PHOTOS, projectMediaSchema);
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

export class VideoService extends BaseFirebaseService<Video> {
  constructor() {
    super(FIREBASE_COLLECTIONS.VIDEOS, projectMediaSchema);
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

// Homepage Content Service
export class HomepageService extends BaseFirebaseService<HomepageContent> {
  constructor() {
    super(FIREBASE_COLLECTIONS.HOMEPAGE, homepageContentSchema);
  }

  async getContent(): Promise<ApiResponse<HomepageContent | null>> {
    try {
      // Get the default homepage document
      const docRef = doc(db!, FIREBASE_COLLECTIONS.HOMEPAGE, 'default');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...this.convertTimestamp(docSnap.data()),
        } as HomepageContent;
        return { success: true, data };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateContent(
    data: Partial<Omit<HomepageContent, 'id'>>
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db!, FIREBASE_COLLECTIONS.HOMEPAGE, 'default');
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating homepage content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Contact Message Service
export class ContactMessageService extends BaseFirebaseService<ContactMessage> {
  constructor() {
    super(FIREBASE_COLLECTIONS.CONTACT_MESSAGES, socialPostSchema);
  }

  async createMessage(formData: ContactFormData): Promise<ApiResponse<string>> {
    try {
      const messageData: ContactMessageData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType,
        eventDate: formData.eventDate?.toISOString(),
        message: formData.comments,
        isRead: false,
        status: 'new',
        source: 'contact_form',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        metadata: {
          timestamp: new Date().toISOString(),
          locale: 'es', // Default to Spanish
        },
        archived: false,
      };

      const result = await this.create<ContactMessage>(messageData);
      return result;
    } catch (error) {
      console.error('Error creating contact message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(this.getDocRef(id), {
        isRead: true,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateStatus(
    id: string,
    status: 'new' | 'in_progress' | 'completed' | 'archived'
  ): Promise<ApiResponse<void>> {
    try {
      await updateDoc(this.getDocRef(id), {
        status,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating message status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const q = query(this.getCollection(), where('isRead', '==', false));
      const snapshot = await getDocs(q);
      return { success: true, data: snapshot.size };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Project Media Interface
export interface ProjectMedia {
  id?: string;
  projectId: string;
  type: 'photo' | 'video';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnail?: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | string | number; // Detected during upload
  width?: number; // Original dimensions
  height?: number; // Original dimensions
  description?: {
    en: string;
    es: string;
    pt: string;
  };
  tags: string[];
  order: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to detect aspect ratio from file
async function detectAspectRatio(file: File): Promise<{
  aspectRatio: '1:1' | '16:9' | '9:16';
  width: number;
  height: number;
}> {
  return new Promise(resolve => {
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        let aspectRatio: '1:1' | '16:9' | '9:16';

        if (ratio > 1.3) {
          aspectRatio = '16:9'; // Landscape
        } else if (ratio < 0.75) {
          aspectRatio = '9:16'; // Portrait
        } else {
          aspectRatio = '1:1'; // Square-ish
        }

        resolve({
          aspectRatio,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        // Fallback for images that fail to load
        resolve({
          aspectRatio: '16:9',
          width: 1920,
          height: 1080,
        });
      };

      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const ratio = video.videoWidth / video.videoHeight;
        let aspectRatio: '1:1' | '16:9' | '9:16';

        if (ratio > 1.3) {
          aspectRatio = '16:9'; // Landscape
        } else if (ratio < 0.75) {
          aspectRatio = '9:16'; // Portrait
        } else {
          aspectRatio = '1:1'; // Square-ish
        }

        resolve({
          aspectRatio,
          width: video.videoWidth,
          height: video.videoHeight,
        });

        // Clean up object URL
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        // Fallback for videos that fail to load
        resolve({
          aspectRatio: '16:9',
          width: 1920,
          height: 1080,
        });
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    } else {
      // Fallback for unsupported file types
      resolve({
        aspectRatio: '16:9',
        width: 1920,
        height: 1080,
      });
    }
  });
}

// Project Media Service
export class ProjectMediaService extends BaseFirebaseService<ProjectMedia> {
  constructor() {
    super('projectMedia', socialPostSchema);
  }

  async getByProjectId(
    projectId: string
  ): Promise<ApiResponse<ProjectMedia[]>> {
    try {
      const q = query(
        this.getCollection(),
        where('projectId', '==', projectId),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamp(doc.data()),
      })) as ProjectMedia[];

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching project media:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async uploadFile(
    file: File,
    projectId: string,
    metadata: Partial<ProjectMedia>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<ProjectMedia>> {
    try {
      const storageService = await getStorageService();
      if (!storageService) {
        return {
          success: false,
          error: 'Firebase Storage not initialized',
        };
      }

      // Validate file
      const maxSize = file.type.startsWith('video/')
        ? 100 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
        };
      }

      // Create file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `projects/${projectId}/${timestamp}-${sanitizedFileName}`;

      // Upload to Firebase Storage with progress tracking
      const storageRef = ref(storageService!, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise(resolve => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            // Progress monitoring
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          error => {
            // Handle upload error
            console.error('Upload error:', error);
            resolve({
              success: false,
              error: `Upload failed: ${error.message}`,
            });
          },
          async () => {
            try {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Detect aspect ratio and dimensions
              const { aspectRatio, width, height } =
                await detectAspectRatio(file);

              // Get the last order number for this project
              const existingMedia = await this.getByProjectId(projectId);
              const nextOrder =
                existingMedia.success && existingMedia.data
                  ? Math.max(...existingMedia.data.map(m => m.order), 0) + 1
                  : 1;

              // Create media document
              const mediaData: Omit<ProjectMedia, 'id'> = {
                projectId,
                type: file.type.startsWith('video/') ? 'video' : 'photo',
                fileName: sanitizedFileName,
                filePath,
                fileSize: file.size,
                mimeType: file.type,
                url: downloadURL,
                aspectRatio,
                width,
                height,
                description: metadata.description || { en: '', es: '', pt: '' },
                tags: metadata.tags || [],
                order: metadata.order || nextOrder,
                featured: metadata.featured || false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Save to Firestore
              const createResult = await this.create<ProjectMedia>(mediaData);

              if (createResult.success) {
                const fullMediaData = { id: createResult.data, ...mediaData };
                resolve({ success: true, data: fullMediaData });
              } else {
                resolve({
                  success: false,
                  error: createResult.error || 'Failed to create media record',
                });
              }
            } catch (error) {
              resolve({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteMedia(id: string): Promise<ApiResponse<void>> {
    try {
      // Get media info to delete file from storage
      const mediaResult = await this.getById<ProjectMedia>(id);
      if (mediaResult.success && mediaResult.data) {
        const media = mediaResult.data;

        // Delete from Storage
        const storageService = await getStorageService();
        if (storageService) {
          try {
            const storageRef = ref(storageService, media.filePath);
            await deleteObject(storageRef);
          } catch (storageError) {
            console.warn('Failed to delete file from storage:', storageError);
            // Continue with Firestore deletion even if storage deletion fails
          }
        }
      }

      // Delete from Firestore
      const result = await this.delete(id);
      return result;
    } catch (error) {
      console.error('Error deleting media:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateMediaOrder(
    mediaItems: { id: string; order: number }[]
  ): Promise<ApiResponse<void>> {
    try {
      // Update all items with new order
      const promises = mediaItems.map(item =>
        updateDoc(this.getDocRef(item.id), {
          order: item.order,
          updatedAt: new Date(),
        })
      );

      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error updating media order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Firebase Storage Service
export class StorageService {
  async getFileUrl(filePath: string): Promise<ApiResponse<string>> {
    try {
      // Check if storage is initialized
      const storageService = await getStorageService();
      if (!storageService) {
        console.error('Firebase Storage not initialized');
        return {
          success: false,
          error:
            'Firebase Storage not initialized. Please check your Firebase configuration.',
        };
      }

      const fileRef = ref(storageService, filePath);
      const downloadURL = await getDownloadURL(fileRef);
      return { success: true, data: downloadURL };
    } catch (error) {
      console.error('Error getting file URL from Storage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getVideoUrl(fileName: string): Promise<ApiResponse<string>> {
    // Videos are typically stored in a 'videos' folder
    return this.getFileUrl(`videos/${fileName}`);
  }

  async getImageUrl(fileName: string): Promise<ApiResponse<string>> {
    // Images are typically stored in an 'images' folder
    return this.getFileUrl(`images/${fileName}`);
  }
}

// Social Post Service
export class SocialPostService extends BaseFirebaseService<SocialPost> {
  constructor() {
    super('socialPosts', socialPostSchema);
  }

  async getByProjectId(projectId: string): Promise<ApiResponse<SocialPost[]>> {
    try {
      const q = query(
        this.getCollection(),
        where('projectId', '==', projectId),
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const socialPosts: SocialPost[] = [];

      querySnapshot.forEach(doc => {
        socialPosts.push({
          id: doc.id,
          ...doc.data(),
        } as SocialPost);
      });

      return { success: true, data: socialPosts };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch social posts');
    }
  }

  async updateOrder(
    projectId: string,
    postIds: string[]
  ): Promise<ApiResponse<void>> {
    try {
      const batch = writeBatch(db!);

      postIds.forEach((postId, index) => {
        const docRef = doc(db!, this.collectionName, postId);
        batch.update(docRef, { order: index });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      return this.handleError(error, 'Failed to update social post order');
    }
  }
}

// Service instances
export const faqService = new FAQService();
export const photoService = new PhotoService();
export const videoService = new VideoService();
export const homepageService = new HomepageService();
export const contactMessageService = new ContactMessageService();
export const projectMediaService = new ProjectMediaService();

// Legacy support
export const storageService = new StorageService();

// Export service instance
export const socialPostService = new SocialPostService();
