import { split, combine } from 'shamirs-secret-sharing-ts';
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

export const SHARD_CONSTANTS = {
  MIN_THRESHOLD: 2,
  MAX_THRESHOLD: 5,
  MIN_TOTAL_SHARDS: 3,
  MAX_TOTAL_SHARDS: 10,
} as const;

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

function splitSecret(
  secret: string,
  threshold: number,
  totalShards: number
): string[] {
  try {
    const secretBuffer = Buffer.from(secret, 'hex');
    const shardBuffers = split(secretBuffer, { shares: totalShards, threshold });
    return shardBuffers.map(buffer => buffer.toString('hex'));
  } catch (error) {
    throw BackupError.from(error, BackupErrorCode.SHAMIR_SPLIT_FAILED, 'Failed to split secret into shards');
  }
}

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

export async function createEncryptedShards(
  secret: string,
  passphrase: string,
  config: ShardConfig
): Promise<EncryptedShard[]> {
  validateShardConfig(config);

  const shards = splitSecret(secret, config.threshold, config.totalShards);

  const encryptedShards: EncryptedShard[] = [];
  for (let i = 0; i < shards.length; i++) {
    const encryptedShard = await encryptShard(
      shards[i],
      passphrase,
      i + 1,
      config
    );
    encryptedShards.push(encryptedShard);
  }

  return encryptedShards;
}

async function decryptShard(
  encryptedShard: EncryptedShard,
  passphrase: string
): Promise<string> {
  return symmetricDecrypt(encryptedShard.encryptedData, passphrase);
}

function joinShards(shards: string[]): string {
  try {
    const shardBuffers = shards.map(shard => Buffer.from(shard, 'hex'));
    const secretBuffer = combine(shardBuffers);
    return secretBuffer.toString('hex');
  } catch (error) {
    throw BackupError.from(error, BackupErrorCode.SHAMIR_JOIN_FAILED, 'Failed to reconstruct secret from shards');
  }
}

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

  const decryptedShards: string[] = [];
  for (const shard of encryptedShards) {
    const decrypted = await decryptShard(shard, passphrase);
    decryptedShards.push(decrypted);
  }

  return joinShards(decryptedShards.slice(0, threshold));
}
