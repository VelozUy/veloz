import { getFirestoreService } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface AdminUser {
  email: string;
  status: 'active' | 'inactive';
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function checkAdminStatus(userEmail: string): Promise<boolean> {
  try {
    const db = await getFirestoreService();
    if (!db) {
      console.error('Firestore not available');
      return false;
    }

    const adminDoc = await getDoc(doc(db, 'adminUsers', userEmail));
    if (!adminDoc.exists()) {
      console.log('User not found in adminUsers collection:', userEmail);
      return false;
    }

    const adminData = adminDoc.data() as AdminUser;
    const isActive = adminData.status === 'active';
    
    console.log('Admin check result:', {
      email: userEmail,
      status: adminData.status,
      isActive,
    });

    return isActive;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getCurrentAdminUser(userEmail: string): Promise<AdminUser | null> {
  try {
    const db = await getFirestoreService();
    if (!db) {
      console.error('Firestore not available');
      return null;
    }

    const adminDoc = await getDoc(doc(db, 'adminUsers', userEmail));
    if (!adminDoc.exists()) {
      return null;
    }

    return adminDoc.data() as AdminUser;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
} 