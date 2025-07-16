'use client';

import { useState, useEffect } from 'react';
import { firebaseConfig, validateFirebaseConfig } from '@/lib/firebase-config';

interface ConfigDebug {
  isValid: boolean;
  missing: string[];
  config: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  };
}

export default function FirebaseConfigDebugPage() {
  const [configDebug, setConfigDebug] = useState<ConfigDebug | null>(null);

  useEffect(() => {
    const debug = validateFirebaseConfig();
    setConfigDebug(debug);
  }, []);

  if (!configDebug) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Config Debug</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(configDebug, null, 2)}
      </pre>
    </div>
  );
}
