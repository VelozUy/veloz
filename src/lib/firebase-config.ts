// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Google Analytics 4 configuration
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
export const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ] as const;

  const missing = requiredFields.filter(field => !firebaseConfig[field]);

  return {
    isValid: missing.length === 0,
    missing,
    config: firebaseConfig,
  };
};

// Debug function
export const debugFirebaseConfig = () => {
  const validation = validateFirebaseConfig();

  console.log('🔥 Firebase Config Debug:', {
    isClient: typeof window !== 'undefined',
    isValid: validation.isValid,
    missing: validation.missing,
    hasApiKey: !!firebaseConfig.apiKey,
    hasStorageBucket: !!firebaseConfig.storageBucket,
    configValues: {
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
      storageBucket: firebaseConfig.storageBucket,
      projectId: firebaseConfig.projectId,
    },
  });

  return validation;
};
