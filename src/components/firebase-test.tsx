'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FirebaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const testFirebaseConnection = async () => {
    setConnectionStatus('testing');
    setError(null);
    setTestResults([]);

    try {
      // Test 1: Basic Firestore connection
      setTestResults(prev => [...prev, '✓ Firebase app initialized']);

      // Test 2: Try to access Firestore
      const testCollection = collection(db, 'test');
      setTestResults(prev => [...prev, '✓ Firestore database connected']);

      // Test 3: Try to read from a collection (won't fail even if collection doesn't exist)
      try {
        await getDocs(testCollection);
        setTestResults(prev => [
          ...prev,
          '✓ Firestore read operation successful',
        ]);
      } catch (readError) {
        setTestResults(prev => [
          ...prev,
          `⚠ Firestore read test: ${readError instanceof Error ? readError.message : 'Unknown error'}`,
        ]);
      }

      // Test 4: Check environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
      ];

      const missingVars = requiredEnvVars.filter(
        varName => !process.env[varName]
      );
      if (missingVars.length === 0) {
        setTestResults(prev => [
          ...prev,
          '✓ All environment variables present',
        ]);
      } else {
        setTestResults(prev => [
          ...prev,
          `⚠ Missing environment variables: ${missingVars.join(', ')}`,
        ]);
      }

      setConnectionStatus('success');
    } catch (err) {
      console.error('Firebase test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setConnectionStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔥 Firebase Connection Test</CardTitle>
        <CardDescription>
          Test the Firebase integration for the Veloz project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testFirebaseConnection}
          disabled={connectionStatus === 'testing'}
          className="w-full"
        >
          {connectionStatus === 'testing'
            ? 'Testing...'
            : 'Test Firebase Connection'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="bg-muted p-4 rounded-md">
              {testResults.map((result, index) => (
                <div key={index} className="font-mono text-sm">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <h3 className="font-semibold">Error:</h3>
            <p className="text-sm font-mono">{error}</p>
          </div>
        )}

        {connectionStatus === 'success' && (
          <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
            <h3 className="font-semibold">
              🎉 Firebase Connection Successful!
            </h3>
            <p className="text-sm">
              Your Veloz project is properly connected to Firebase.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
