/**
 * Shamir's Secret Sharing utilities using the shakespeare library
 */

import { split, join } from 'shakespeare';
import { symmetricEncrypt, symmetricDecrypt } from './passphrase';
import { BackupError, BackupErrorCode, withBackupErrorHandling } from '../errors';

export interface ShardConfig {
  threshold: number;
  totalShards: number;
}

export interface EncryptedShard {
  index: number;
  encryptedData: string;
  totalShards: number;
  threshold: number;
}

/**
 * Constants for shard configuration limits
 */
export const SHARD_CONSTANTS = {
  MIN_THRESHOLD: 2,
  MAX_THRESHOLD: 5,
  MIN_TOTAL_SHARDS: 3,
  MAX_TOTAL_SHARDS: 10,
} as const;

/**
 * Validates shard configuration parameters
 * 
 * @param config - Shard configuration to validate
 * @throws BackupError with appropriate code if invalid
 */
function validateShardConfig(config: ShardConfig): void {
  const { threshold, totalShards } = config;

  if (threshold < SHARD_CONSTANTS.MIN_THRESHOLD || threshold > SHARD_CONSTANTS.MAX_THRESHOLD) {
    throw new BackupError(
      BackupErrorCode.INVALID_THRESHOLD,
      `Threshold must be between ${SHARD_CONSTANTS.MIN_THRESHOLD} and ${SHARD_CONSTANTS.MAX_THRESHOLD}`
    );
  }

  if (totalShards < SHARD_CONSTANTS.MIN_TOTAL_SHARDS || totalShards > SHARD_CONSTANTS.MAX_TOTAL_SHARDS) {
    throw new BackupError(
      BackupErrorCode.INVALID_SHARD_COUNT,
      `Total shards must be between ${SHARD_CONSTANTS.MIN_TOTAL_SHARDS} and ${SHARD_CONSTANTS.MAX_TOTAL_SHARDS}`
    );
  }

  if (threshold > totalShards) {
    throw new BackupError(
      BackupErrorCode.INVALID_THRESHOLD,
      'Threshold cannot be greater than total shards'
    );
  }
}

/**
 * Splits a secret using Shamir's Secret Sharing algorithm
 * 
 * @param secret - The secret to split
 * @param threshold - Minimum shares needed to reconstruct
 * @param totalShards - Total number of shares to create
 * @returns Array of shard strings
 * @throws BackupError with SHAMIR_SPLIT_FAILED code on failure
 */
function splitSecret(
  secret: string,
  threshold: number,
  totalShards: number
): string[] {
  return withBackupErrorHandling(
    () => Promise.resolve(split(secret, threshold, totalShards)),
    BackupErrorCode.SHAMIR_SPLIT_FAILED,
    'Failed to split secret into shards'
  ) as unknown as string[]; // shakespeare split is sync but we wrap for consistency
}

/**
 * Encrypts a shard with a passphrase
 * 
 * @param shard - The shard to encrypt
 * @param passphrase - Passphrase for encryption
 * @param index - Index of this shard
 * @param config - Shard configuration
 * @returns Encrypted shard object
 */
async function encryptShard(
  shard: string,
  passphrase: string,
  index: number,
  config: ShardConfig
): Promise<EncryptedShard> {
  const encryptedData = await symmetricEncrypt(shard, passphrase);
  
  return {
    index,
    encryptedData,
    totalShards: config.totalShards,
    threshold: config.threshold
  };
}

/**
 * Splits a secret (nsec) into Shamir shards and encrypts each with a passphrase
 * 
 * This function performs the following steps:
 * 1. Validates configuration parameters
 * 2. Splits the secret using Shamir's Secret Sharing
 * 3. Encrypts each shard with the passphrase (AES-GCM + PBKDF2)
 * 
 * @param secret - The secret to split and encrypt (typically an nsec)
 * @param passphrase - Passphrase for encrypting shards
 * @param config - Configuration specifying threshold and total shards
 * @returns Array of encrypted shards
 * @throws BackupError on validation failure or encryption error
 */
export async function createEncryptedShards(
  secret: string,
  passphrase: string,
  config: ShardConfig
): Promise<EncryptedShard[]> {
  // Validate configuration
  validateShardConfig(config);

  // Split the secret using Shamir's Secret Sharing
  const shards = splitSecret(secret, config.threshold, config.totalShards);

  // Encrypt each shard with the passphrase
  const encryptedShards: EncryptedShard[] = [];
  for (let i = 0; i < shards.length; i++) {
    const encryptedShard = await encryptShard(
      shards[i],
      passphrase,
      i + 1, // 1-indexed for user-facing display
      config
    );
    encryptedShards.push(encryptedShard);
  }

  return encryptedShards;
}

/**
 * Decrypts an encrypted shard
 * 
 * @param encryptedShard - The encrypted shard to decrypt
 * @param passphrase - Passphrase for decryption
 * @returns Decrypted shard string
 */
async function decryptShard(
  encryptedShard: EncryptedShard,
  passphrase: string
): Promise<string> {
  return symmetricDecrypt(encryptedShard.encryptedData, passphrase);
}

/**
 * Reconstructs a secret from Shamir shards using the join algorithm
 * 
 * @param shards - Array of decrypted shard strings
 * @returns Reconstructed secret
 * @throws BackupError with SHAMIR_JOIN_FAILED code on failure
 */
function joinShards(shards: string[]): string {
  return withBackupErrorHandling(
    () => Promise.resolve(join(shards)),
    BackupErrorCode.SHAMIR_JOIN_FAILED,
    'Failed to reconstruct secret from shards'
  ) as unknown as string; // shakespeare join is sync but we wrap for consistency
}

/**
 * Decrypts shards and reconstructs the original secret
 * 
 * This function performs the following steps:
 * 1. Validates that enough shards are provided
 * 2. Decrypts each shard with the passphrase
 * 3. Reconstructs the secret using Shamir's algorithm
 * 
 * @param encryptedShards - Array of encrypted shards (must have at least threshold shards)
 * @param passphrase - Passphrase for decrypting shards
 * @returns Reconstructed secret
 * @throws BackupError if insufficient shards or decryption fails
 */
export async function reconstructSecret(
  encryptedShards: EncryptedShard[],
  passphrase: string
): Promise<string> {
  if (encryptedShards.length === 0) {
    throw new BackupError(
      BackupErrorCode.INSUFFICIENT_SHARDS,
      'No shards provided'
    );
  }

  const threshold = encryptedShards[0].threshold;
  if (encryptedShards.length < threshold) {
    throw new BackupError(
      BackupErrorCode.INSUFFICIENT_SHARDS,
      `Need at least ${threshold} shards to reconstruct the secret`
    );
  }

  // Decrypt each shard
  const decryptedShards: string[] = [];
  for (const shard of encryptedShards) {
    const decrypted = await decryptShard(shard, passphrase);
    decryptedShards.push(decrypted);
  }

  // Reconstruct the secret using Shamir's algorithm
  // Only use the threshold number of shards (extra shards are ignored)
  return joinShards(decryptedShards.slice(0, threshold));
}