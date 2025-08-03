// Firebase Service Layer
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentData,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getFirestoreSync, getStorageSync } from '@/lib/firebase';

import type {
  ApiResponse,
  FAQ,
  Photo,
  Video,
  HomepageContent,
  ContactMessage,
  ContactFormData,
  ContactMessageData,
  SocialPost,
  HeroMediaConfig,
} from '@/types';

import { FIREBASE_COLLECTIONS } from '@/constants';
import {
  faqSchema,
  projectMediaSchema,
  homepageContentSchema,
  socialPostSchema,
} from '@/lib/validation-schemas';

// Utility function to clean heroMediaConfig for Firestore
export const cleanHeroMediaConfig = (
  config?: HeroMediaConfig
): Record<string, unknown> | undefined => {
  if (!config) return undefined;

  const cleaned = { ...config } as Record<string, unknown>;

  // Remove customRatio if aspectRatio is not 'custom' or if customRatio is undefined
  if (cleaned.aspectRatio !== 'custom' || !cleaned.customRatio) {
    delete cleaned.customRatio;
  }

  // Remove undefined values that Firestore doesn't allow
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });

  return cleaned;
};

export abstract class BaseFirebaseService<T = unknown> {
  protected collectionName: string;
  protected schema: unknown;

  constructor(collectionName: string, schema: unknown) {
    this.collectionName = collectionName;
    this.schema = schema;
  }

  protected getCollection() {
    if (!getFirestoreSync()) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
    return collection(getFirestoreSync()!, this.collectionName);
  }

  protected getDocRef(id: string) {
    if (!getFirestoreSync()) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
    return doc(getFirestoreSync()!, this.collectionName, id);
  }

  protected convertTimestamp(data: DocumentData): DocumentData {
    const converted = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = (converted[key] as Timestamp).toDate();
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
      console.log(
        `🔄 BaseFirebaseService.create() called for collection: ${this.collectionName}`
      );

      const now = new Date();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.getCollection(), docData);
      console.log(
        `✅ Document created successfully with ID: ${docRef.id} in collection: ${this.collectionName}`
      );
      return { success: true, data: docRef.id };
    } catch (error) {
      console.error(
        `❌ Error creating document in collection ${this.collectionName}:`,
        error
      );
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      );

      // Handle specific Firebase errors
      if (
        error instanceof Error &&
        error.message.includes('Target ID already exists')
      ) {
        console.error(
          `🚨 Target ID conflict detected in collection: ${this.collectionName}`
        );
        console.error(
          'This suggests a component is trying to create a document with a specific ID instead of using auto-generated IDs'
        );
      }

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
      // Use atomic field updates to prevent race conditions
      // This ensures that concurrent updates don't overwrite each other
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      // Flatten nested objects for atomic updates
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle nested objects like description: { es: "...", en: "..." }
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== undefined && nestedValue !== null) {
                updateData[`${key}.${nestedKey}`] = nestedValue;
              }
            });
          } else {
            // Handle simple values and arrays
            updateData[key] = value;
          }
        }
      });

      await updateDoc(this.getDocRef(id), updateData);
      return { success: true };
    } catch (error) {
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
      console.log('🔄 HomepageService.getContent() called');

      // Try using collection query instead of direct doc access to avoid ID conflicts
      const collectionRef = collection(
        getFirestoreSync()!,
        FIREBASE_COLLECTIONS.HOMEPAGE
      );
      console.log('📄 Attempting to query homepage collection');

      const querySnapshot = await getDocs(collectionRef);

      // Look for the 'content' document
      let contentDoc: any = null;
      querySnapshot.forEach(doc => {
        if (doc.id === 'content') {
          contentDoc = doc;
        }
      });

      if (contentDoc && contentDoc.exists()) {
        console.log('✅ Homepage content found via collection query');
        const data = {
          id: contentDoc.id,
          ...this.convertTimestamp(contentDoc.data()),
        } as HomepageContent;
        return { success: true, data };
      } else {
        console.log('📝 No homepage content found, returning null');
        return { success: true, data: null };
      }
    } catch (error) {
      console.error('❌ Error getting homepage content:', error);
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      );

      // If collection query fails, try direct doc access as fallback
      if (
        error instanceof Error &&
        error.message.includes('Target ID already exists')
      ) {
        console.log('🔄 Collection query failed, trying direct doc access...');
        try {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));

          const docRef = doc(
            getFirestoreSync()!,
            FIREBASE_COLLECTIONS.HOMEPAGE,
            'content'
          );
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log(
              '✅ Direct doc access successful, homepage content found'
            );
            const data = {
              id: docSnap.id,
              ...this.convertTimestamp(docSnap.data()),
            } as HomepageContent;
            return { success: true, data };
          }
        } catch (retryError) {
          console.error('❌ Direct doc access also failed:', retryError);
        }
      }

      // For any error, return null to prevent dashboard crash
      console.warn(
        '⚠️ Homepage content loading failed, returning null to prevent dashboard crash'
      );
      console.warn(
        '   This allows the admin page to load with default content instead of crashing'
      );
      return { success: true, data: null };
    }
  }

  async updateContent(
    data: Partial<Omit<HomepageContent, 'id'>>
  ): Promise<ApiResponse<void>> {
    try {
      console.log('🔄 HomepageService.updateContent() called');

      const docRef = doc(
        getFirestoreSync()!,
        FIREBASE_COLLECTIONS.HOMEPAGE,
        'content'
      );
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      console.log('📄 Attempting to update document: homepage/content');
      // Use setDoc instead of updateDoc to handle both create and update
      await setDoc(docRef, updateData, { merge: true });
      console.log('✅ Homepage content updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating homepage content:', error);
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      );

      // Handle specific Firebase errors
      if (
        error instanceof Error &&
        error.message.includes('Target ID already exists')
      ) {
        console.warn(
          '⚠️ Target ID conflict detected, skipping update to prevent crash'
        );
        return { success: true }; // Return success to prevent dashboard from breaking
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createDefaultContent(): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(
        getFirestoreSync()!,
        FIREBASE_COLLECTIONS.HOMEPAGE,
        'content'
      );

      const defaultContent = {
        headline: {
          en: 'Welcome to Veloz',
          es: 'Bienvenido a Veloz',
          pt: 'Bem-vindo ao Veloz',
        },
        subheadline: {
          en: 'Professional photography and videography services',
          es: 'Servicios profesionales de fotografía y videografía',
          pt: 'Serviços profissionais de fotografia e videografia',
        },
        ctaButtons: {
          primary: {
            text: {
              en: 'View Our Work',
              es: 'Ver Nuestro Trabajo',
              pt: 'Ver Nosso Trabalho',
            },
            link: '/our-work',
            enabled: true,
          },
          secondary: {
            text: {
              en: 'Contact Us',
              es: 'Contáctanos',
              pt: 'Entre em Contato',
            },
            link: '/contact',
            enabled: true,
          },
        },
        backgroundVideo: {
          url: '',
          enabled: false,
          filename: '',
        },
        backgroundImages: {
          urls: [],
          enabled: false,
          filenames: [],
        },
        logo: {
          url: '',
          enabled: false,
          filename: '',
        },
        theme: {
          overlayOpacity: 0.5,
          gradientColors: ['hsl(var(--foreground))', 'hsl(var(--foreground))'],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(docRef, defaultContent);
      return { success: true };
    } catch (error) {
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
    super('projectMedia', projectMediaSchema);
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
      const storageService = getStorageSync();
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
        const storageService = getStorageSync();
        if (storageService) {
          try {
            const storageRef = ref(storageService, media.filePath);
            await deleteObject(storageRef);
          } catch (storageError) {
            // Failed to delete file from storage
            // Continue with Firestore deletion even if storage deletion fails
          }
        }
      }

      // Delete from Firestore
      const result = await this.delete(id);
      return result;
    } catch (error) {
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
      const db = getFirestoreSync();
      if (!db) {
        return {
          success: false,
          error: 'Firebase not initialized',
        };
      }

      const batch = writeBatch(db);

      mediaItems.forEach(({ id, order }) => {
        const docRef = this.getDocRef(id);
        batch.update(docRef, { order, updatedAt: new Date() });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update media analysis results with atomic field updates to prevent race conditions
   *
   * This method uses Firestore's atomic field updates to prevent race conditions
   * when multiple AI analyses are running simultaneously. Instead of replacing
   * the entire document, it updates only the specific fields that are being
   * analyzed, ensuring that concurrent updates don't overwrite each other.
   *
   * @param mediaId - The ID of the media item to update
   * @param analysis - The analysis results to update
   * @returns Promise<ApiResponse<void>>
   */
  async updateAnalysisResults(
    mediaId: string,
    analysis: {
      description?: { es?: string; en?: string; pt?: string };
      tags?: string[];
    }
  ): Promise<ApiResponse<void>> {
    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      // Use atomic field updates for nested objects
      if (analysis.description) {
        if (analysis.description.es)
          updateData['description.es'] = analysis.description.es;
        if (analysis.description.en)
          updateData['description.en'] = analysis.description.en;
        if (analysis.description.pt)
          updateData['description.pt'] = analysis.description.pt;
      }

      if (analysis.tags) {
        updateData.tags = analysis.tags;
      }

      await updateDoc(this.getDocRef(mediaId), updateData);
      return { success: true };
    } catch (error) {
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
      const storageService = getStorageSync();
      if (!storageService) {
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
      const batch = writeBatch(getFirestoreSync()!);

      postIds.forEach((postId, index) => {
        const docRef = doc(getFirestoreSync()!, this.collectionName, postId);
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

// Prevent multiple simultaneous homepage content operations
let homepageContentOperation: Promise<any> | null = null;

// Wrapper function to prevent race conditions
export const safeHomepageContentOperation = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  if (homepageContentOperation) {
    // Wait for the current operation to complete
    await homepageContentOperation;
  }

  homepageContentOperation = operation();
  try {
    const result = await homepageContentOperation;
    return result;
  } finally {
    homepageContentOperation = null;
  }
};
