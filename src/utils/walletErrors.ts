/**
 * Wallet error handling utilities
 * Provides user-friendly error messages and retry logic
 */

export class WalletError extends Error {
  code: WalletErrorCode;
  recoverable: boolean;
  originalError?: Error;

  constructor(
    message: string,
    code: WalletErrorCode,
    recoverable: boolean = true,
    originalError?: Error
  ) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
    this.recoverable = recoverable;
    this.originalError = originalError;
  }
}

export const WalletErrorCode = {
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  MINT_UNAVAILABLE: 'MINT_UNAVAILABLE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  DEPOSIT_FAILED: 'DEPOSIT_FAILED',
  WITHDRAWAL_FAILED: 'WITHDRAWAL_FAILED',
  NUTZAP_FAILED: 'NUTZAP_FAILED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type WalletErrorCode = typeof WalletErrorCode[keyof typeof WalletErrorCode];

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, delayMs, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Convert raw errors to user-friendly WalletError instances
 */
export function toWalletError(error: unknown, context?: string): WalletError {
  if (error instanceof WalletError) {
    return error;
  }

  const originalError = error instanceof Error ? error : new Error(String(error));
  const message = originalError.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return new WalletError(
      'Network connection failed. Please check your internet connection.',
      WalletErrorCode.NETWORK_ERROR,
      true,
      originalError
    );
  }

  // Mint errors
  if (message.includes('mint') || message.includes('unavailable')) {
    return new WalletError(
      'Mint service is temporarily unavailable. Please try again later.',
      WalletErrorCode.MINT_UNAVAILABLE,
      true,
      originalError
    );
  }

  // Balance errors
  if (message.includes('insufficient') || message.includes('balance')) {
    return new WalletError(
      'Insufficient balance for this transaction.',
      WalletErrorCode.INSUFFICIENT_BALANCE,
      false,
      originalError
    );
  }

  // Token errors
  if (message.includes('token') || message.includes('invalid')) {
    return new WalletError(
      'Invalid or corrupted token. Please try a different payment method.',
      WalletErrorCode.INVALID_TOKEN,
      false,
      originalError
    );
  }

  // Generic error
  return new WalletError(
    context
      ? `${context}: ${originalError.message}`
      : originalError.message,
    WalletErrorCode.UNKNOWN_ERROR,
    true,
    originalError
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: WalletError): string {
  const baseMessage = error.message;
  
  if (error.recoverable) {
    return `${baseMessage} Please try again.`;
  }
  
  return baseMessage;
}