import { FirebaseError } from 'firebase/app';
import { AuthError } from 'firebase/auth';
import { FirestoreError } from 'firebase/firestore';
import { StorageError } from 'firebase/storage';
import type { ApiResponse } from '@/types';

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
  technicalDetails?: Record<string, any>;
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
    'storage/canceled'
  ],
  onRetry: () => {}
};

// User-friendly error messages in Spanish (primary language)
const ERROR_MESSAGES: Record<string, { es: string; en: string; pt: string }> = {
  // Network errors
  'unavailable': {
    es: 'El servicio no está disponible temporalmente. Intenta nuevamente en unos momentos.',
    en: 'Service temporarily unavailable. Please try again in a few moments.',
    pt: 'Serviço temporariamente indisponível. Tente novamente em alguns momentos.'
  },
  'network-request-failed': {
    es: 'Error de conexión. Verifica tu conexión a internet.',
    en: 'Connection error. Please check your internet connection.',
    pt: 'Erro de conexão. Verifique sua conexão com a internet.'
  },
  'deadline-exceeded': {
    es: 'La operación tardó demasiado tiempo. Intenta nuevamente.',
    en: 'Operation timed out. Please try again.',
    pt: 'Operação expirou. Tente novamente.'
  },
  
  // Auth errors
  'unauthenticated': {
    es: 'Debes iniciar sesión para realizar esta acción.',
    en: 'You must sign in to perform this action.',
    pt: 'Você deve fazer login para executar esta ação.'
  },
  'permission-denied': {
    es: 'No tienes permisos para realizar esta acción.',
    en: 'You don\'t have permission to perform this action.',
    pt: 'Você não tem permissão para executar esta ação.'
  },
  
  // Validation errors
  'invalid-argument': {
    es: 'Los datos proporcionados no son válidos.',
    en: 'The provided data is not valid.',
    pt: 'Os dados fornecidos não são válidos.'
  },
  'failed-precondition': {
    es: 'No se pueden completar las condiciones necesarias para esta operación.',
    en: 'Required conditions for this operation cannot be met.',
    pt: 'As condições necessárias para esta operação não podem ser atendidas.'
  },
  
  // Resource errors
  'not-found': {
    es: 'El recurso solicitado no fue encontrado.',
    en: 'The requested resource was not found.',
    pt: 'O recurso solicitado não foi encontrado.'
  },
  'already-exists': {
    es: 'El recurso ya existe.',
    en: 'The resource already exists.',
    pt: 'O recurso já existe.'
  },
  
  // Quota errors
  'resource-exhausted': {
    es: 'Se ha excedido el límite de uso del servicio.',
    en: 'Service usage limit has been exceeded.',
    pt: 'O limite de uso do serviço foi excedido.'
  },
  'quota-exceeded': {
    es: 'Se ha excedido la cuota disponible.',
    en: 'Available quota has been exceeded.',
    pt: 'A cota disponível foi excedida.'
  },
  
  // Server errors
  'internal': {
    es: 'Error interno del servidor. Intenta nuevamente más tarde.',
    en: 'Internal server error. Please try again later.',
    pt: 'Erro interno do servidor. Tente novamente mais tarde.'
  },
  'data-loss': {
    es: 'Se detectó pérdida de datos. Contacta al soporte técnico.',
    en: 'Data loss detected. Please contact technical support.',
    pt: 'Perda de dados detectada. Entre em contato com o suporte técnico.'
  },
  
  // Storage errors
  'storage/unauthorized': {
    es: 'No tienes autorización para acceder a este archivo.',
    en: 'You are not authorized to access this file.',
    pt: 'Você não tem autorização para acessar este arquivo.'
  },
  'storage/quota-exceeded': {
    es: 'Se ha excedido el límite de almacenamiento.',
    en: 'Storage limit has been exceeded.',
    pt: 'O limite de armazenamento foi excedido.'
  },
  'storage/retry-limit-exceeded': {
    es: 'Se ha excedido el límite de intentos de subida.',
    en: 'Upload retry limit has been exceeded.',
    pt: 'O limite de tentativas de upload foi excedido.'
  },
  
  // Default fallback
  'unknown': {
    es: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
    en: 'An unexpected error occurred. Please try again.',
    pt: 'Ocorreu um erro inesperado. Tente novamente.'
  }
};

/**
 * Firebase Error Handler
 * Provides comprehensive error handling, retry logic, and user-friendly messaging
 */
export class FirebaseErrorHandler {
  private static instance: FirebaseErrorHandler;
  private language: 'es' | 'en' | 'pt' = 'es';
  private errorLog: Array<{ timestamp: Date; error: ErrorDetails; context?: string }> = [];
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

    if (error instanceof FirebaseError || error instanceof AuthError || 
        error instanceof FirestoreError || error instanceof StorageError) {
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
        technicalDetails: { originalError: error }
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
    const suggestedAction = this.getSuggestedAction(code, category);

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
        stack: error.stack
      }
    };
  }

  /**
   * Parse generic errors
   */
  private parseGenericError(error: Error): ErrorDetails {
    const isNetworkError = error.message.toLowerCase().includes('network') ||
                          error.message.toLowerCase().includes('fetch') ||
                          error.message.toLowerCase().includes('connection');

    const category: ErrorCategory = isNetworkError ? 'network' : 'client';
    const severity: ErrorSeverity = isNetworkError ? 'high' : 'medium';

    return {
      category,
      severity,
      code: error.name || 'generic-error',
      message: error.message,
      userMessage: this.getUserMessage(isNetworkError ? 'network-request-failed' : 'unknown'),
      retryable: isNetworkError,
      technicalDetails: {
        stack: error.stack
      }
    };
  }

  /**
   * Categorize error by code
   */
  private categorizeError(code: string): ErrorCategory {
    if (code.includes('network') || code.includes('unavailable') || code.includes('deadline')) {
      return 'network';
    }
    if (code.includes('auth') || code.includes('unauthenticated') || code.includes('permission')) {
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
  private determineSeverity(code: string, category: ErrorCategory): ErrorSeverity {
    if (code.includes('data-loss') || code.includes('internal')) {
      return 'critical';
    }
    if (category === 'network' || category === 'server' || category === 'quota') {
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
  private getSuggestedAction(code: string, category: ErrorCategory): string | undefined {
    const actionMap: Record<string, { es: string; en: string; pt: string }> = {
      'network-request-failed': {
        es: 'Verifica tu conexión a internet y vuelve a intentar',
        en: 'Check your internet connection and try again',
        pt: 'Verifique sua conexão com a internet e tente novamente'
      },
      'unauthenticated': {
        es: 'Inicia sesión nuevamente',
        en: 'Sign in again',
        pt: 'Faça login novamente'
      },
      'permission-denied': {
        es: 'Contacta al administrador si crees que deberías tener acceso',
        en: 'Contact the administrator if you believe you should have access',
        pt: 'Entre em contato com o administrador se você acredita que deveria ter acesso'
      },
      'quota-exceeded': {
        es: 'Espera un momento antes de intentar nuevamente',
        en: 'Wait a moment before trying again',
        pt: 'Aguarde um momento antes de tentar novamente'
      }
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
      context
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
    let lastError: Error;

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
        
        console.log(`🔄 Retrying operation (attempt ${attempt + 1}/${config.maxAttempts}) in ${delay}ms...`);
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
      metadata: {
        errorCode: errorDetails.code,
        errorCategory: errorDetails.category,
        severity: errorDetails.severity,
        retryable: errorDetails.retryable,
        suggestedAction: errorDetails.suggestedAction,
        technicalDetails: errorDetails.technicalDetails
      }
    };
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(): Array<{ timestamp: Date; error: ErrorDetails; context?: string }> {
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
      retryableErrors: 0
    };

    this.errorLog.forEach(({ error }) => {
      stats.errorsByCategory[error.category] = (stats.errorsByCategory[error.category] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
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

// Export types for use in other modules
export type { ErrorDetails, RetryOptions, ErrorCategory, ErrorSeverity }; 