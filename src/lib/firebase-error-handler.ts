import { FirebaseError } from 'firebase/app';
import { FirestoreError } from 'firebase/firestore';
import { StorageError } from 'firebase/storage';
import type { ApiResponse } from '@/types';
import { db } from './firebase';
import {
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { reinitializeFirebase } from './firebase-reinit';
import { getFirestoreService } from './firebase';

// Error types and categories
export type ErrorCategory =
  | 'network'
  | 'auth'
  | 'permission'
  | 'validation'
  | 'quota'
  | 'not_found'
  | 'conflict'
  | 'server'
  | 'client'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorDetails {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  suggestedAction?: string;
  technicalDetails?: Record<string, unknown>;
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

// Default retry configuration
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'internal',
    'data-loss',
    'network-request-failed',
    'storage/retry-limit-exceeded',
    'storage/canceled',
  ],
  onRetry: () => {},
};

// User-friendly error messages in Spanish (primary language)
const ERROR_MESSAGES: Record<string, { es: string; en: string; pt: string }> = {
  // Network errors
  unavailable: {
    es: 'El servicio no está disponible temporalmente. Intenta nuevamente en unos momentos.',
    en: 'Service temporarily unavailable. Please try again in a few moments.',
    pt: 'Serviço temporariamente indisponível. Tente novamente em alguns momentos.',
  },
  'network-request-failed': {
    es: 'Error de conexión. Verifica tu conexión a internet.',
    en: 'Connection error. Please check your internet connection.',
    pt: 'Erro de conexão. Verifique sua conexão com a internet.',
  },
  'deadline-exceeded': {
    es: 'La operación tardó demasiado tiempo. Intenta nuevamente.',
    en: 'Operation timed out. Please try again.',
    pt: 'Operação expirou. Tente novamente.',
  },

  // Auth errors
  unauthenticated: {
    es: 'Debes iniciar sesión para realizar esta acción.',
    en: 'You must sign in to perform this action.',
    pt: 'Você deve fazer login para executar esta ação.',
  },
  'permission-denied': {
    es: 'No tienes permisos para realizar esta acción.',
    en: "You don't have permission to perform this action.",
    pt: 'Você não tem permissão para executar esta ação.',
  },

  // Validation errors
  'invalid-argument': {
    es: 'Los datos proporcionados no son válidos.',
    en: 'The provided data is not valid.',
    pt: 'Os dados fornecidos não são válidos.',
  },
  'failed-precondition': {
    es: 'No se pueden completar las condiciones necesarias para esta operación.',
    en: 'Required conditions for this operation cannot be met.',
    pt: 'As condições necessárias para esta operação não podem ser atendidas.',
  },

  // Resource errors
  'not-found': {
    es: 'El recurso solicitado no fue encontrado.',
    en: 'The requested resource was not found.',
    pt: 'O recurso solicitado não foi encontrado.',
  },
  'already-exists': {
    es: 'El recurso ya existe.',
    en: 'The resource already exists.',
    pt: 'O recurso já existe.',
  },

  // Quota errors
  'resource-exhausted': {
    es: 'Se ha excedido el límite de uso del servicio.',
    en: 'Service usage limit has been exceeded.',
    pt: 'O limite de uso do serviço foi excedido.',
  },
  'quota-exceeded': {
    es: 'Se ha excedido la cuota disponible.',
    en: 'Available quota has been exceeded.',
    pt: 'A cota disponível foi excedida.',
  },

  // Server errors
  internal: {
    es: 'Error interno del servidor. Intenta nuevamente más tarde.',
    en: 'Internal server error. Please try again later.',
    pt: 'Erro interno do servidor. Tente novamente mais tarde.',
  },
  'data-loss': {
    es: 'Se detectó pérdida de datos. Contacta al soporte técnico.',
    en: 'Data loss detected. Please contact technical support.',
    pt: 'Perda de dados detectada. Entre em contato com o suporte técnico.',
  },

  // Storage errors
  'storage/unauthorized': {
    es: 'No tienes autorización para acceder a este archivo.',
    en: 'You are not authorized to access this file.',
    pt: 'Você não tem autorização para acessar este arquivo.',
  },
  'storage/quota-exceeded': {
    es: 'Se ha excedido el límite de almacenamiento.',
    en: 'Storage limit has been exceeded.',
    pt: 'O limite de armazenamento foi excedido.',
  },
  'storage/retry-limit-exceeded': {
    es: 'Se ha excedido el límite de intentos de subida.',
    en: 'Upload retry limit has been exceeded.',
    pt: 'O limite de tentativas de upload foi excedido.',
  },

  // Default fallback
  unknown: {
    es: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
    en: 'An unexpected error occurred. Please try again.',
    pt: 'Ocorreu um erro inesperado. Tente novamente.',
  },
};

// Global state tracking
let isRecovering = false;
let recoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_COOLDOWN = 5000; // 5 seconds between recovery attempts

// Error tracking and monitoring
interface ErrorEvent {
  timestamp: Date;
  error: string;
  errorType: 'internal' | 'network' | 'permission' | 'other';
  recoveryAttempted: boolean;
  recoverySuccessful: boolean;
  operation?: string;
}

const errorHistory: ErrorEvent[] = [];
const MAX_ERROR_HISTORY = 100;

/**
 * Firebase Error Handler
 * Provides comprehensive error handling, retry logic, and user-friendly messaging
 */
export class FirebaseErrorHandler {
  private static instance: FirebaseErrorHandler;
  private language: 'es' | 'en' | 'pt' = 'es';
  private errorLog: Array<{
    timestamp: Date;
    error: ErrorDetails;
    context?: string;
  }> = [];
  private maxLogSize = 100;

  private constructor() {}

  static getInstance(): FirebaseErrorHandler {
    if (!FirebaseErrorHandler.instance) {
      FirebaseErrorHandler.instance = new FirebaseErrorHandler();
    }
    return FirebaseErrorHandler.instance;
  }

  /**
   * Set the language for error messages
   */
  setLanguage(lang: 'es' | 'en' | 'pt'): void {
    this.language = lang;
  }

  /**
   * Parse and categorize a Firebase error
   */
  parseError(error: unknown, context?: string): ErrorDetails {
    let errorDetails: ErrorDetails;

    if (
      error instanceof FirebaseError ||
      error instanceof FirestoreError ||
      error instanceof StorageError
    ) {
      errorDetails = this.parseFirebaseError(error);
    } else if (error instanceof Error) {
      errorDetails = this.parseGenericError(error);
    } else {
      errorDetails = {
        category: 'unknown',
        severity: 'medium',
        code: 'unknown',
        message: 'Unknown error occurred',
        userMessage: this.getUserMessage('unknown'),
        retryable: false,
        technicalDetails: { originalError: error },
      };
    }

    // Log the error
    this.logError(errorDetails, context);

    return errorDetails;
  }

  /**
   * Parse Firebase-specific errors
   */
  private parseFirebaseError(error: FirebaseError): ErrorDetails {
    const code = error.code;
    const category = this.categorizeError(code);
    const severity = this.determineSeverity(code, category);
    const retryable = this.isRetryable(code);
    const userMessage = this.getUserMessage(code);
    const suggestedAction = this.getSuggestedAction(code);

    return {
      category,
      severity,
      code,
      message: error.message,
      userMessage,
      retryable,
      suggestedAction,
      technicalDetails: {
        customData: error.customData,
        stack: error.stack,
      },
    };
  }

  /**
   * Parse generic errors
   */
  private parseGenericError(error: Error): ErrorDetails {
    const isNetworkError =
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('connection');

    const category: ErrorCategory = isNetworkError ? 'network' : 'client';
    const severity: ErrorSeverity = isNetworkError ? 'high' : 'medium';

    return {
      category,
      severity,
      code: error.name || 'generic-error',
      message: error.message,
      userMessage: this.getUserMessage(
        isNetworkError ? 'network-request-failed' : 'unknown'
      ),
      retryable: isNetworkError,
      technicalDetails: {
        stack: error.stack,
      },
    };
  }

  /**
   * Categorize error by code
   */
  private categorizeError(code: string): ErrorCategory {
    if (
      code.includes('network') ||
      code.includes('unavailable') ||
      code.includes('deadline')
    ) {
      return 'network';
    }
    if (
      code.includes('auth') ||
      code.includes('unauthenticated') ||
      code.includes('permission')
    ) {
      return 'auth';
    }
    if (code.includes('permission') || code.includes('unauthorized')) {
      return 'permission';
    }
    if (code.includes('invalid') || code.includes('failed-precondition')) {
      return 'validation';
    }
    if (code.includes('quota') || code.includes('resource-exhausted')) {
      return 'quota';
    }
    if (code.includes('not-found') || code.includes('notfound')) {
      return 'not_found';
    }
    if (code.includes('already-exists') || code.includes('conflict')) {
      return 'conflict';
    }
    if (code.includes('internal') || code.includes('data-loss')) {
      return 'server';
    }
    return 'client';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    code: string,
    category: ErrorCategory
  ): ErrorSeverity {
    if (code.includes('data-loss') || code.includes('internal')) {
      return 'critical';
    }
    if (
      category === 'network' ||
      category === 'server' ||
      category === 'quota'
    ) {
      return 'high';
    }
    if (category === 'auth' || category === 'permission') {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(code: string): boolean {
    return DEFAULT_RETRY_OPTIONS.retryableErrors.includes(code);
  }

  /**
   * Get user-friendly message
   */
  private getUserMessage(code: string): string {
    const messages = ERROR_MESSAGES[code] || ERROR_MESSAGES['unknown'];
    return messages[this.language];
  }

  /**
   * Get suggested action for error
   */
  private getSuggestedAction(code: string): string | undefined {
    const actionMap: Record<string, { es: string; en: string; pt: string }> = {
      'network-request-failed': {
        es: 'Verifica tu conexión a internet y vuelve a intentar',
        en: 'Check your internet connection and try again',
        pt: 'Verifique sua conexão com a internet e tente novamente',
      },
      unauthenticated: {
        es: 'Inicia sesión nuevamente',
        en: 'Sign in again',
        pt: 'Faça login novamente',
      },
      'permission-denied': {
        es: 'Contacta al administrador si crees que deberías tener acceso',
        en: 'Contact the administrator if you believe you should have access',
        pt: 'Entre em contato com o administrador se você acredita que deveria ter acesso',
      },
      'quota-exceeded': {
        es: 'Espera un momento antes de intentar nuevamente',
        en: 'Wait a moment before trying again',
        pt: 'Aguarde um momento antes de tentar novamente',
      },
    };

    const action = actionMap[code];
    return action ? action[this.language] : undefined;
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(error: ErrorDetails, context?: string): void {
    const logEntry = {
      timestamp: new Date(),
      error,
      context,
    };

    this.errorLog.unshift(logEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging based on severity
    if (error.severity === 'critical') {
      console.error('🚨 Critical Firebase Error:', error, context);
    } else if (error.severity === 'high') {
      console.error('❌ High Priority Firebase Error:', error, context);
    } else if (error.severity === 'medium') {
      console.warn('⚠️ Firebase Warning:', error, context);
    } else {
      console.log('ℹ️ Firebase Info:', error, context);
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    context?: string
  ): Promise<T> {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error = new Error('Retry failed');

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        const errorDetails = this.parseError(error, context);

        // Don't retry if error is not retryable
        if (!errorDetails.retryable) {
          throw error;
        }

        // Don't retry if this is the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
          config.maxDelay
        );

        config.onRetry(attempt, lastError);

        console.log(
          `🔄 Retrying operation (attempt ${attempt + 1}/${config.maxAttempts}) in ${delay}ms...`
        );
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Create a typed API response from error
   */
  createErrorResponse<T>(error: unknown, context?: string): ApiResponse<T> {
    const errorDetails = this.parseError(error, context);

    return {
      success: false,
      error: errorDetails.userMessage,
      data: undefined,
    };
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(): Array<{
    timestamp: Date;
    error: ErrorDetails;
    context?: string;
  }> {
    return [...this.errorLog];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    retryableErrors: number;
  } {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      retryableErrors: 0,
    };

    this.errorLog.forEach(({ error }) => {
      stats.errorsByCategory[error.category] =
        (stats.errorsByCategory[error.category] || 0) + 1;
      stats.errorsBySeverity[error.severity] =
        (stats.errorsBySeverity[error.severity] || 0) + 1;
      if (error.retryable) {
        stats.retryableErrors++;
      }
    });

    return stats;
  }

  /**
   * Utility function for sleep/delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const firebaseErrorHandler = FirebaseErrorHandler.getInstance();

// Export convenience functions
export const parseFirebaseError = (error: unknown, context?: string) =>
  firebaseErrorHandler.parseError(error, context);

export const withRetry = <T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
  context?: string
) => firebaseErrorHandler.withRetry(fn, options, context);

export const createErrorResponse = <T>(error: unknown, context?: string) =>
  firebaseErrorHandler.createErrorResponse<T>(error, context);

// Data migration helpers for project schema updates
export const migrateProjectData = (data: any): any => {
  if (!data) return data;

  // Ensure heroMediaConfig exists
  if (!data.heroMediaConfig) {
    data.heroMediaConfig = {
      aspectRatio: '16:9',
      autoplay: true,
      muted: true,
      loop: true,
    };
  }

  // Ensure mediaBlocks exists
  if (!data.mediaBlocks) {
    data.mediaBlocks = [];
  }

  // Ensure crewMembers exists
  if (data.crewMembers === undefined) {
    data.crewMembers = [];
  }

  // Ensure mediaCount exists
  if (!data.mediaCount) {
    data.mediaCount = { photos: 0, videos: 0 };
  }

  return data;
};

// Validate project data structure
export const validateProjectData = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check for required fields
  const requiredFields = ['title', 'description', 'eventType', 'status'];
  for (const field of requiredFields) {
    if (!data[field]) {
      return false;
    }
  }

  return true;
};

// Track active listeners to prevent conflicts
const activeListeners = new Set<() => void>();

// Add listener to tracking
export const trackListener = (unsubscribe: () => void) => {
  activeListeners.add(unsubscribe);
  return () => {
    activeListeners.delete(unsubscribe);
    unsubscribe();
  };
};

// Cleanup all active listeners
export const cleanupAllListeners = () => {
  console.log(`🧹 Cleaning up ${activeListeners.size} active listeners`);
  activeListeners.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (error) {
      console.warn('Error during listener cleanup:', error);
    }
  });
  activeListeners.clear();
};

// Enhanced error detection for Firestore internal errors
export const isFirestoreInternalError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const errorMessage = (error as { message?: string }).message || '';
  const errorCode = (error as { code?: string }).code || '';

  return (
    errorMessage.includes('INTERNAL ASSERTION FAILED') ||
    errorMessage.includes('Unexpected state') ||
    errorMessage.includes('Target ID') ||
    errorMessage.includes('WatchChangeAggregator') ||
    errorMessage.includes('onWatchStreamChange') ||
    errorCode === 'internal' ||
    (errorMessage.includes('FIRESTORE') && errorMessage.includes('INTERNAL')) ||
    errorMessage.includes('ID: ca9') ||
    errorMessage.includes('ID: b815') ||
    errorMessage.includes('CONTEXT: {"Fe":-1}')
  );
};

// Error tracking and logging
export const trackError = (error: unknown, operation?: string): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorType = isFirestoreInternalError(error)
    ? 'internal'
    : errorMessage.includes('network')
      ? 'network'
      : errorMessage.includes('permission')
        ? 'permission'
        : 'other';

  const errorEvent: ErrorEvent = {
    timestamp: new Date(),
    error: errorMessage,
    errorType,
    recoveryAttempted: false,
    recoverySuccessful: false,
    operation,
  };

  errorHistory.push(errorEvent);

  // Keep history size manageable
  if (errorHistory.length > MAX_ERROR_HISTORY) {
    errorHistory.shift();
  }

  console.warn(`🔥 Firebase error tracked: ${errorType} - ${errorMessage}`);
};

// Get error statistics
export const getErrorStatistics = () => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const recentErrors = errorHistory.filter(
    e => e.timestamp.getTime() > oneHourAgo
  );
  const dailyErrors = errorHistory.filter(
    e => e.timestamp.getTime() > oneDayAgo
  );

  const errorTypes = {
    internal: 0,
    network: 0,
    permission: 0,
    other: 0,
  };

  recentErrors.forEach(error => {
    errorTypes[error.errorType]++;
  });

  return {
    totalErrors: errorHistory.length,
    recentErrors: recentErrors.length,
    dailyErrors: dailyErrors.length,
    errorTypes,
    lastError: errorHistory[errorHistory.length - 1],
  };
};

// Automatic recovery trigger
export const triggerAutomaticRecovery = async (): Promise<boolean> => {
  if (isRecovering || recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
    console.warn(
      '🔥 Automatic recovery skipped - already in progress or max attempts reached'
    );
    return false;
  }

  try {
    isRecovering = true;
    recoveryAttempts++;

    console.log(
      `🔥 Triggering automatic Firestore recovery (attempt ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS})`
    );

    // Track recovery attempt
    const recoveryStartTime = Date.now();

    // 1. Cleanup all active listeners
    cleanupAllListeners();

    // 2. Disable network to stop all operations
    const db = await getFirestoreService();
    if (db) {
      try {
        await disableNetwork(db);
        console.log('✅ Network disabled for recovery');
      } catch (error) {
        console.warn('⚠️ Could not disable network during recovery:', error);
      }
    }

    // 3. Reinitialize Firebase completely
    const reinitSuccess = await reinitializeFirebase();
    if (!reinitSuccess) {
      console.error(
        '❌ Firebase reinitialization failed during automatic recovery'
      );

      // Track failed recovery
      const lastError = errorHistory[errorHistory.length - 1];
      if (lastError) {
        lastError.recoveryAttempted = true;
        lastError.recoverySuccessful = false;
      }

      return false;
    }

    // 4. Re-enable network
    const newDb = await getFirestoreService();
    if (newDb) {
      try {
        await enableNetwork(newDb);
        console.log('✅ Network re-enabled after recovery');
      } catch (error) {
        console.warn('⚠️ Could not re-enable network after recovery:', error);
      }
    }

    const recoveryDuration = Date.now() - recoveryStartTime;
    console.log(
      `✅ Automatic Firestore recovery completed successfully in ${recoveryDuration}ms`
    );

    // Track successful recovery
    const lastError = errorHistory[errorHistory.length - 1];
    if (lastError) {
      lastError.recoveryAttempted = true;
      lastError.recoverySuccessful = true;
    }

    return true;
  } catch (error) {
    console.error('❌ Automatic Firestore recovery failed:', error);

    // Track failed recovery
    const lastError = errorHistory[errorHistory.length - 1];
    if (lastError) {
      lastError.recoveryAttempted = true;
      lastError.recoverySuccessful = false;
    }

    return false;
  } finally {
    isRecovering = false;

    // Reset recovery attempts after cooldown
    setTimeout(() => {
      recoveryAttempts = 0;
      console.log('🔄 Recovery attempts reset after cooldown');
    }, RECOVERY_COOLDOWN);
  }
};

// Comprehensive Firestore recovery
export const recoverFirestore = async (): Promise<boolean> => {
  return triggerAutomaticRecovery();
};

// Enhanced safe operation wrapper with automatic recovery
export const withFirestoreRecovery = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    // Track the error
    trackError(error);

    if (isFirestoreInternalError(error)) {
      console.warn(
        '🔥 Detected Firestore internal error, attempting automatic recovery...'
      );

      const recoverySuccess = await triggerAutomaticRecovery();
      if (recoverySuccess) {
        try {
          console.log('🔥 Retrying operation after automatic recovery...');
          return await operation();
        } catch (retryError) {
          console.error(
            '🔥 Operation failed after automatic recovery:',
            retryError
          );
          trackError(retryError);
          if (fallback !== undefined) {
            console.warn('🔥 Using fallback value');
            return fallback;
          }
          throw retryError;
        }
      } else {
        console.error('🔥 Automatic Firestore recovery failed, cannot recover');
        if (fallback !== undefined) {
          console.warn('🔥 Using fallback value');
          return fallback;
        }
        throw error;
      }
    } else {
      // Not a Firestore internal error, rethrow
      throw error;
    }
  }
};

// Global error handler for unhandled Firebase errors
export const setupGlobalFirebaseErrorHandler = () => {
  if (typeof window === 'undefined') return;

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args.join(' ');

    // Check if this is a Firestore internal error
    if (isFirestoreInternalError({ message: errorMessage })) {
      console.warn('🔥 Global error handler detected Firestore internal error');
      trackError(new Error(errorMessage), 'global-error-handler');

      // Trigger automatic recovery in the background
      triggerAutomaticRecovery().then(success => {
        if (success) {
          console.log('🔥 Global error handler: Automatic recovery completed');
        } else {
          console.error('🔥 Global error handler: Automatic recovery failed');
        }
      });
    }

    // Call original console.error
    originalConsoleError.apply(console, args);
  };

  console.log('✅ Global Firebase error handler installed');
};

// Initialize global error handler
if (typeof window !== 'undefined') {
  setupGlobalFirebaseErrorHandler();
}

// Enhanced timeout wrapper
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`)
        );
      }, timeoutMs);
    }),
  ]);
};

// Cleanup function to be called on app unmount
export const cleanupFirebase = async () => {
  console.log('🧹 Cleaning up Firebase resources...');
  cleanupAllListeners();

  const db = await getFirestoreService();
  if (db) {
    try {
      await disableNetwork(db);
      console.log('✅ Network disabled during cleanup');
    } catch (error) {
      console.warn('⚠️ Could not disable network during cleanup:', error);
    }
  }
};

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupAllListeners();
  });
}
