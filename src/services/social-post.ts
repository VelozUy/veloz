import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ApiResponse } from '@/types';
import type { SocialPost } from '@/types';

// Social post interface for Firestore
interface SocialPostFirestore {
  title: string;
  content: string;
  platform: string;
  scheduledDate: Timestamp;
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SocialPostData {
  id: string;
  projectId: string;
  type: 'image' | 'video';
  url: string;
  caption: {
    es?: string;
    en?: string;
    pt?: string;
  };
  order: number;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSocialPostData {
  projectId: string;
  type: 'image' | 'video';
  url: string;
  caption: {
    es?: string;
    en?: string;
    pt?: string;
  };
  order: number;
  uploadedBy?: string;
}

export type UpdateSocialPostData = Partial<
  Omit<SocialPostData, 'id' | 'createdAt'>
>;

// Social Post Service
export class SocialPostService {
  private collectionName = 'socialPosts';

  private async getDb() {
    const db = await db;
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }
    return db;
  }

  async create(
    data: CreateSocialPostData
  ): Promise<ApiResponse<SocialPostData>> {
    try {
      const db = await this.getDb();

      // Validate data
      const validatedData = validateSocialPost(data);

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newPost = {
        id: docRef.id,
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SocialPostData;

      return { success: true, data: newPost };
    } catch (error) {
      console.error('Failed to create social post:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create social post',
      };
    }
  }

  async getById(id: string): Promise<ApiResponse<SocialPostData>> {
    try {
      const db = await this.getDb();
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Social post not found',
        };
      }

      const data = {
        id: docSnap.id,
        ...docSnap.data(),
      } as SocialPostData;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch social post:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch social post',
      };
    }
  }

  async getByProjectId(
    projectId: string
  ): Promise<ApiResponse<SocialPostData[]>> {
    try {
      const db = await this.getDb();
      const q = query(
        collection(db, this.collectionName),
        where('projectId', '==', projectId),
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const socialPosts: SocialPostData[] = [];

      querySnapshot.forEach(doc => {
        socialPosts.push({
          id: doc.id,
          ...doc.data(),
        } as SocialPostData);
      });

      return { success: true, data: socialPosts };
    } catch (error) {
      console.error('Failed to fetch social posts:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch social posts',
      };
    }
  }

  async update(
    id: string,
    data: UpdateSocialPostData
  ): Promise<ApiResponse<SocialPostData>> {
    try {
      const db = await this.getDb();
      const docRef = doc(db, this.collectionName, id);

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(docRef, updateData);

      // Fetch updated document
      const updatedDoc = await getDoc(docRef);
      const updatedData = {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as SocialPostData;

      return { success: true, data: updatedData };
    } catch (error) {
      console.error('Failed to update social post:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update social post',
      };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const db = await this.getDb();
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete social post:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete social post',
      };
    }
  }

  async updateOrder(
    projectId: string,
    postIds: string[]
  ): Promise<ApiResponse<void>> {
    try {
      const db = await this.getDb();
      const batch = writeBatch(db);

      for (let index = 0; index < postIds.length; index++) {
        const postId = postIds[index];
        const docRef = doc(db, this.collectionName, postId);
        batch.update(docRef, {
          order: index,
          updatedAt: new Date(),
        });
      }

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Failed to update social post order:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update social post order',
      };
    }
  }
}

// Export service instance
export const socialPostService = new SocialPostService();
