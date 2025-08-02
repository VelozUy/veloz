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
      return false;
    }

    const adminDoc = await getDoc(doc(db, 'adminUsers', userEmail));
    if (!adminDoc.exists()) {
      return false;
    }

    const adminData = adminDoc.data() as AdminUser;
    const isActive = adminData.status === 'active';

    return isActive;
  } catch (error) {
    return false;
  }
}

export async function getCurrentAdminUser(
  userEmail: string
): Promise<AdminUser | null> {
  try {
    const db = await getFirestoreService();
    if (!db) {
      return null;
    }

    const adminDoc = await getDoc(doc(db, 'adminUsers', userEmail));
    if (!adminDoc.exists()) {
      return null;
    }

    return adminDoc.data() as AdminUser;
  } catch (error) {
    return null;
  }
}
