export enum BackupErrorCode {
  NO_USER = 'NO_USER',
  NO_PRIVATE_KEY = 'NO_PRIVATE_KEY',
  INVALID_PASSPHRASE = 'INVALID_PASSPHRASE',
  INVALID_PUBKEY = 'INVALID_PUBKEY',
  DUPLICATE_TRUSTEE = 'DUPLICATE_TRUSTEE',
  MAX_TRUSTEES_EXCEEDED = 'MAX_TRUSTEES_EXCEEDED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  KEY_DERIVATION_FAILED = 'KEY_DERIVATION_FAILED',
  SHAMIR_SPLIT_FAILED = 'SHAMIR_SPLIT_FAILED',
  SHAMIR_JOIN_FAILED = 'SHAMIR_JOIN_FAILED',
  EVENT_CREATION_FAILED = 'EVENT_CREATION_FAILED',
  EVENT_SIGNING_FAILED = 'EVENT_SIGNING_FAILED',
  EVENT_PUBLISHING_FAILED = 'EVENT_PUBLISHING_FAILED',
  METADATA_PUBLISHING_FAILED = 'METADATA_PUBLISHING_FAILED',
  METADATA_FETCH_FAILED = 'METADATA_FETCH_FAILED',
  SHARD_FETCH_FAILED = 'SHARD_FETCH_FAILED',
  INVALID_THRESHOLD = 'INVALID_THRESHOLD',
  INVALID_SHARD_COUNT = 'INVALID_SHARD_COUNT',
  INSUFFICIENT_SHARDS = 'INSUFFICIENT_SHARDS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class BackupError extends Error {
  constructor(
    public readonly code: BackupErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'BackupError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BackupError);
    }
  }

  static from(error: unknown, code: BackupErrorCode, defaultMessage: string): BackupError {
    if (error instanceof BackupError) {
      return error;
    }

    const message = error instanceof Error ? error.message : defaultMessage;
    return new BackupError(code, message, error);
  }

  static is(error: unknown, code: BackupErrorCode): error is BackupError {
    return error instanceof BackupError && error.code === code;
  }

  getUserMessage(): string {
    const messages: Record<BackupErrorCode, string> = {
      [BackupErrorCode.NO_USER]: 'Please log in to create a backup',
      [BackupErrorCode.NO_PRIVATE_KEY]: 'Private key not found. Please log in with a private key.',
      [BackupErrorCode.INVALID_PASSPHRASE]: 'Passphrase does not meet security requirements',
      [BackupErrorCode.INVALID_PUBKEY]: 'Invalid public key format',
      [BackupErrorCode.DUPLICATE_TRUSTEE]: 'This person is already in your trustee list',
      [BackupErrorCode.MAX_TRUSTEES_EXCEEDED]: 'Maximum number of trustees reached',
      [BackupErrorCode.ENCRYPTION_FAILED]: 'Failed to encrypt data',
      [BackupErrorCode.DECRYPTION_FAILED]: 'Failed to decrypt data',
      [BackupErrorCode.KEY_DERIVATION_FAILED]: 'Failed to derive encryption key',
      [BackupErrorCode.SHAMIR_SPLIT_FAILED]: 'Failed to split secret into shards',
      [BackupErrorCode.SHAMIR_JOIN_FAILED]: 'Failed to reconstruct secret from shards',
      [BackupErrorCode.EVENT_CREATION_FAILED]: 'Failed to create event',
      [BackupErrorCode.EVENT_SIGNING_FAILED]: 'Failed to sign event',
      [BackupErrorCode.EVENT_PUBLISHING_FAILED]: 'Failed to publish event to relays',
      [BackupErrorCode.METADATA_PUBLISHING_FAILED]: 'Failed to publish backup metadata',
      [BackupErrorCode.METADATA_FETCH_FAILED]: 'Failed to fetch backup metadata',
      [BackupErrorCode.SHARD_FETCH_FAILED]: 'Failed to fetch shard',
      [BackupErrorCode.INVALID_THRESHOLD]: 'Invalid threshold value',
      [BackupErrorCode.INVALID_SHARD_COUNT]: 'Invalid shard count',
      [BackupErrorCode.INSUFFICIENT_SHARDS]: 'Not enough shards to reconstruct secret',
      [BackupErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred'
    };

    return messages[this.code] || this.message;
  }
}

export async function withBackupErrorHandling<T>(
  fn: () => Promise<T>,
  code: BackupErrorCode,
  defaultMessage: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw BackupError.from(error, code, defaultMessage);
  }
}
