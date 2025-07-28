import '@testing-library/jest-dom';

// Set up environment variables for testing
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';

// Mock Next.js router
const useRouter = jest.fn();
useRouter.mockReturnValue({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
});

jest.mock('next/router', () => ({
  useRouter,
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  connectFirestoreEmulator: jest.fn(),
  enableIndexedDbPersistence: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Mock Firebase configuration
jest.mock('@/lib/firebase-config', () => ({
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id',
  },
  validateFirebaseConfig: jest.fn(() => ({
    isValid: true,
    missing: [],
    config: {},
  })),
  debugFirebaseConfig: jest.fn(() => ({
    isValid: true,
    missing: [],
  })),
}));

// Mock Firebase service
jest.mock(
  '@/lib/firebase',
  () => ({
    db: {},
    auth: {},
    storage: {},
    getFirestoreService: jest.fn(() => Promise.resolve({})),
    getStorageService: jest.fn(() => Promise.resolve({})),
    getAuthService: jest.fn(() => Promise.resolve({})),
    getFirestoreSync: jest.fn(() => ({})),
    getStorageSync: jest.fn(() => ({})),
    getAuthSync: jest.fn(() => ({})),
  }),
  { virtual: true }
);

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock TextEncoder and TextDecoder for QR code generation
global.TextEncoder = class TextEncoder {
  encode(input) {
    return new Uint8Array(Buffer.from(input, 'utf8'));
  }
};

global.TextDecoder = class TextDecoder {
  decode(input) {
    return Buffer.from(input).toString('utf8');
  }
};

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
