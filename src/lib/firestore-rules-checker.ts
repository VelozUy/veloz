// Firestore Security Rules Checker
// This tool specifically addresses the 400 Bad Request errors from Firestore

import { getFirestoreService, getAuthService } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  limit,
  getDocs,
} from 'firebase/firestore';

export interface SecurityRulesResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  solution?: string;
}

export class FirestoreSecurityRulesChecker {
  private results: SecurityRulesResult[] = [];

  async checkSecurityRules(): Promise<SecurityRulesResult[]> {
    this.results = [];

    console.log('🔒 Checking Firestore Security Rules...');

    await this.testBasicRead();
    await this.testBasicWrite();
    await this.testCollectionRead();
    await this.testAuthenticatedAccess();

    console.log('🔒 Security Rules Check Complete:', this.results);
    return this.results;
  }

  private addResult(
    test: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    solution?: string
  ) {
    this.results.push({ test, status, message, solution });
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
  }

  private async testBasicRead() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      console.log('🔄 Testing basic read access...');
      const testDoc = doc(db, 'test', 'read-test');

      // Add timeout to prevent hanging
      await Promise.race([
        getDoc(testDoc),
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error('Read test timeout after 5 seconds')),
            5000
          );
        }),
      ]);

      this.addResult('Basic Read Access', 'pass', 'Can read from Firestore');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('timeout')) {
        this.addResult(
          'Basic Read Access',
          'fail',
          'Read test timed out - Firestore appears to be offline',
          'Try the Auto Fix button to reconnect Firestore'
        );
      } else if (errorMessage.includes('Missing or insufficient permissions')) {
        this.addResult(
          'Basic Read Access',
          'fail',
          'Firestore read permissions denied',
          "Update your Firestore Security Rules to allow read access. For development: rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if true; } } }"
        );
      } else {
        this.addResult(
          'Basic Read Access',
          'warning',
          `Read test failed: ${errorMessage}`
        );
      }
    }
  }

  private async testBasicWrite() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      const auth = await getAuthService();
      const testDoc = doc(db, 'test', 'write-test');
      await setDoc(testDoc, {
        test: true,
        timestamp: new Date(),
        user: auth?.currentUser?.email || 'anonymous',
      });

      // Clean up
      await deleteDoc(testDoc);

      this.addResult('Basic Write Access', 'pass', 'Can write to Firestore');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Missing or insufficient permissions')) {
        this.addResult(
          'Basic Write Access',
          'fail',
          'Firestore write permissions denied',
          "Update your Firestore Security Rules to allow write access. For development: rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if true; } } }"
        );
      } else {
        this.addResult(
          'Basic Write Access',
          'warning',
          `Write test failed: ${errorMessage}`
        );
      }
    }
  }

  private async testCollectionRead() {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      const testCollection = collection(db, 'test');
      const q = query(testCollection, limit(1));
      await getDocs(q);
      this.addResult(
        'Collection Read Access',
        'pass',
        'Can read collections from Firestore'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Missing or insufficient permissions')) {
        this.addResult(
          'Collection Read Access',
          'fail',
          'Firestore collection read permissions denied',
          'Your security rules may be blocking collection queries. Ensure your rules allow list operations.'
        );
      } else {
        this.addResult(
          'Collection Read Access',
          'warning',
          `Collection read test failed: ${errorMessage}`
        );
      }
    }
  }

  private async testAuthenticatedAccess() {
    const auth = await getAuthService();
    const user = auth?.currentUser;

    if (!user) {
      this.addResult(
        'Authenticated Access',
        'warning',
        'No authenticated user - cannot test authenticated access patterns',
        'Sign in to test authenticated access patterns'
      );
      return;
    }

    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      // Test access to a user-specific document
      const userDoc = doc(db, 'users', user.uid);
      await getDoc(userDoc);
      this.addResult(
        'Authenticated Access',
        'pass',
        'Authenticated access working'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Missing or insufficient permissions')) {
        this.addResult(
          'Authenticated Access',
          'fail',
          'Authenticated access denied',
          'Your security rules may require authentication. Check if your rules use request.auth properly.'
        );
      } else {
        this.addResult(
          'Authenticated Access',
          'warning',
          `Authenticated access test failed: ${errorMessage}`
        );
      }
    }
  }
}

// Quick security rules check
export const checkFirestoreSecurityRules = async (): Promise<
  SecurityRulesResult[]
> => {
  const checker = new FirestoreSecurityRulesChecker();
  return await checker.checkSecurityRules();
};

// Get recommended security rules based on current setup
export const getRecommendedSecurityRules = (
  isDevelopment: boolean = true
): string => {
  if (isDevelopment) {
    return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
  } else {
    return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write admin data if they're in adminUsers
    match /adminUsers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated admin users to read/write homepage content
    match /homepage/{document} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }
    
    // Allow authenticated admin users to read/write gallery content
    match /gallery/{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }
    
    // Allow public read access to certain collections
    match /pages/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }
  }
}`;
  }
};
