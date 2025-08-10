// Custom React Hooks
// Export all custom hooks here when created

// Example exports (will be created later):
// export { default as useAuth } from './useAuth';
// export { default as useLocalStorage } from './useLocalStorage';
// export { default as useLanguage } from './useLanguage';
// export { default as useFirestore } from './useFirestore';
// export { default as useFileUpload } from './useFileUpload';
// export { default as useDebounce } from './useDebounce';

// Firebase hooks
export { useFirebaseVideo } from './useFirebaseVideo';

// Analytics hooks
export { useAnalytics, useScrollDepthTracking } from './useAnalytics';

// Background system hooks
export {
  useBackground,
  useBackgroundConfig,
  useHeroBackground,
  useContentBackground,
  useFormBackground,
  useCTABackground,
  useTestimonialBackground,
  useMetaBackground,
} from './useBackground';

// Scroll behavior hooks
export { useScrollDirection } from './useScrollDirection';

// Data loading hooks
export { useDataLoading } from './useDataLoading';

// Network status hooks
export {
  useNetworkStatus,
  useSlowConnection,
  useDataSaving,
} from './useNetworkStatus';
