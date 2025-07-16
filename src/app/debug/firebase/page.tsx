'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FirebaseDebugInfo {
  isClient: boolean;
  user: {
    uid?: string;
    email?: string;
    displayName?: string;
  } | null;
  loading: boolean;
}

export default function FirebaseDebugPage() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<FirebaseDebugInfo | null>(null);

  useEffect(() => {
    setDebugInfo({
      isClient: typeof window !== 'undefined',
      user: user
        ? {
            uid: user.uid,
            email: user.email || undefined,
            displayName: user.displayName || undefined,
          }
        : null,
      loading,
    });
  }, [user, loading]);

  if (!debugInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Debug</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
