import { 
  AppError, 
  isError,
  isApiError,
  isFirebaseError,
  isNetworkError,
  isValidationError,
  isRTKQueryError,
  getErrorMessage,
  getErrorCode,
  getErrorStatus
} from '@/types';

// ===== ERROR HANDLING UTILITIES =====

/**
 * Safely handle any error type and extract useful information
 */
export function handleError(error: unknown): {
  message: string;
  code?: string;
  status?: number | string;
  type: 'api' | 'firebase' | 'network' | 'validation' | 'rtk' | 'unknown';
  retryable: boolean;
} {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const status = getErrorStatus(error);
  
  let type: 'api' | 'firebase' | 'network' | 'validation' | 'rtk' | 'unknown' = 'unknown';
  let retryable = false;
  
  if (isApiError(error)) {
    type = 'api';
    retryable = error.status >= 500 || error.status === 429; // Server errors or rate limited
  } else if (isFirebaseError(error)) {
    type = 'firebase';
    retryable = ['unavailable', 'deadline-exceeded', 'resource-exhausted'].includes(error.code);
  } else if (isNetworkError(error)) {
    type = 'network';
    retryable = error.retryable;
  } else if (isValidationError(error)) {
    type = 'validation';
    retryable = false;
  } else if (isRTKQueryError(error)) {
    type = 'rtk';
    retryable = typeof error.status === 'number' && error.status >= 500;
  }
  
  return { message, code, status, type, retryable };
}

/**
 * Create a user-friendly error message from any error type
 */
export function getUserFriendlyMessage(error: unknown): string {
  const { message, type, status } = handleError(error);
  
  // Provide user-friendly messages for common error types
  switch (type) {
    case 'network':
      return 'Connection error. Please check your internet connection and try again.';
    case 'api':
      if (status === 401) return 'Please log in again to continue.';
      if (status === 403) return 'You don\'t have permission to perform this action.';
      if (status === 404) return 'The requested resource was not found.';
      if (status === 429) return 'Too many requests. Please wait a moment and try again.';
      if (status && typeof status === 'number' && status >= 500) return 'Server error. Please try again later.';
      break;
    case 'firebase':
      if (message.includes('permission-denied')) return 'Access denied. Please check your permissions.';
      if (message.includes('not-found')) return 'The requested data was not found.';
      if (message.includes('already-exists')) return 'This item already exists.';
      break;
    case 'validation':
      return `Please check your input: ${message}`;
  }
  
  return message;
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}): void {
  const errorInfo = handleError(error);
  
  console.error('Application Error:', {
    ...errorInfo,
    context,
    originalError: error,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined
  });
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return handleError(error).retryable;
}

/**
 * Create a standardized error object from any error type
 */
export function createStandardError(error: unknown): AppError {
  const { message, code, status } = handleError(error);
  
  return {
    name: 'AppError',
    message,
    code,
    status,
    details: error
  };
}

/**
 * Safely execute a function and handle any errors
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      logError(error);
    }
    return null;
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Re-export all the type guards and extractors for convenience
export {
  isError,
  isApiError,
  isFirebaseError,
  isNetworkError,
  isValidationError,
  isRTKQueryError,
  getErrorMessage,
  getErrorCode,
  getErrorStatus
};
