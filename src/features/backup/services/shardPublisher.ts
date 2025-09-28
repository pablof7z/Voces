/**
 * Service for publishing encrypted shards to Nostr relays
 */

import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from '@nostr-dev-kit/ndk';
import type { EncryptedShard } from '../utils/shamir';
import { BackupError, BackupErrorCode, withBackupErrorHandling } from '../errors';

/**
 * Configuration for publishing a single shard
 */
export interface ShardPublishConfig {
  shard: EncryptedShard;
  recipientPubkey: string;
  createdAtOffset: number; // Days to offset the created_at timestamp
  relays: string[];
}

/**
 * Result of publishing a shard
 */
export interface PublishedShard {
  eventId: string;
  recipientPubkey: string;
  relays: string[];
  shardIndex: number;
  publishedAt: number;
  disposableKey: string; // The pubkey of the disposable key used
}

/**
 * Constants for shard publishing
 */
const SHARD_PUBLISH_CONSTANTS = {
  // Kind 3 is used for stealth mode (masquerade as contact list)
  EVENT_KIND: 3,
  
  // Seconds per day for timestamp calculations
  SECONDS_PER_DAY: 24 * 60 * 60,
} as const;

/**
 * Generates a disposable key pair for publishing a single shard
 * This prevents correlation between different shards
 * 
 * @returns Tuple of [signer, pubkey]
 * @throws BackupError with EVENT_CREATION_FAILED code on failure
 */
async function generateDisposableKey(): Promise<[NDKPrivateKeySigner, string]> {
  return withBackupErrorHandling(async () => {
    const signer = NDKPrivateKeySigner.generate();
    const user = await signer.user();
    return [signer, user.pubkey];
  }, BackupErrorCode.EVENT_CREATION_FAILED, 'Failed to generate disposable key');
}

/**
 * Calculates the timestamp for the shard event
 * 
 * @param offsetDays - Number of days to offset from current time
 * @returns Unix timestamp in seconds
 */
function calculateShardTimestamp(offsetDays: number): number {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const offsetSeconds = offsetDays * SHARD_PUBLISH_CONSTANTS.SECONDS_PER_DAY;
  return currentTimestamp + offsetSeconds;
}

/**
 * Creates the payload for the shard event
 * 
 * @param shard - The encrypted shard to include in the payload
 * @returns JSON string payload
 */
function createShardPayload(shard: EncryptedShard): string {
  return JSON.stringify({
    encryptedShard: shard.encryptedData,
    index: shard.index,
    threshold: shard.threshold,
    totalShards: shard.totalShards
  });
}

/**
 * Creates a Nostr event for a shard
 * 
 * @param ndk - NDK instance
 * @param recipientPubkey - Public key of the trustee receiving this shard
 * @param timestamp - Created_at timestamp for the event
 * @returns Prepared NDKEvent
 */
function createShardEvent(
  ndk: NDK,
  recipientPubkey: string,
  timestamp: number
): NDKEvent {
  const event = new NDKEvent(ndk);
  event.kind = SHARD_PUBLISH_CONSTANTS.EVENT_KIND;
  event.created_at = timestamp;
  event.tags = [['p', recipientPubkey]];
  return event;
}

/**
 * Encrypts the shard payload to the recipient using NIP-44
 * 
 * @param signer - Disposable key signer
 * @param recipientPubkey - Recipient's public key
 * @param payload - Shard payload to encrypt
 * @returns Encrypted content string
 * @throws BackupError with ENCRYPTION_FAILED code on failure
 */
async function encryptShardPayload(
  signer: NDKPrivateKeySigner,
  recipientPubkey: string,
  payload: string
): Promise<string> {
  return withBackupErrorHandling(async () => {
    const recipient = new NDKUser({ pubkey: recipientPubkey });
    return await signer.encrypt(recipient, payload);
  }, BackupErrorCode.ENCRYPTION_FAILED, 'Failed to encrypt shard payload');
}

/**
 * Signs an event with the provided signer
 * 
 * @param event - Event to sign
 * @param signer - Signer to use
 * @throws BackupError with EVENT_SIGNING_FAILED code on failure
 */
async function signShardEvent(
  event: NDKEvent,
  signer: NDKPrivateKeySigner
): Promise<void> {
  return withBackupErrorHandling(async () => {
    await event.sign(signer);
  }, BackupErrorCode.EVENT_SIGNING_FAILED, 'Failed to sign shard event');
}

/**
 * Publishes an event to Nostr relays
 * 
 * @param event - Event to publish
 * @throws BackupError with EVENT_PUBLISHING_FAILED code on failure
 */
async function publishShardEvent(event: NDKEvent): Promise<void> {
  return withBackupErrorHandling(async () => {
    await event.publish();
  }, BackupErrorCode.EVENT_PUBLISHING_FAILED, 'Failed to publish shard event');
}

/**
 * Publishes a single encrypted shard as a kind:3 event
 * 
 * This function orchestrates the full shard publishing workflow:
 * 1. Generate disposable key pair
 * 2. Calculate timestamp
 * 3. Create event
 * 4. Encrypt payload with NIP-44 (double encryption with passphrase already applied)
 * 5. Sign event
 * 6. Publish to relays
 * 
 * Uses disposable keys to prevent correlation between different shards.
 * Uses kind:3 (contact list) for stealth mode to avoid detection.
 * 
 * @param ndk - NDK instance
 * @param config - Configuration for publishing
 * @returns PublishedShard with event details
 * @throws BackupError on any failure in the publishing workflow
 */
export async function publishShard(
  ndk: NDK,
  config: ShardPublishConfig
): Promise<PublishedShard> {
  // Step 1: Generate disposable key pair
  const [disposableSigner, disposablePubkey] = await generateDisposableKey();

  // Step 2: Calculate timestamp
  const createdAt = calculateShardTimestamp(config.createdAtOffset);

  // Step 3: Create event
  const event = createShardEvent(ndk, config.recipientPubkey, createdAt);

  // Step 4: Encrypt payload (double encryption: passphrase + NIP-44)
  const payload = createShardPayload(config.shard);
  event.content = await encryptShardPayload(
    disposableSigner,
    config.recipientPubkey,
    payload
  );

  // Step 5: Sign event
  await signShardEvent(event, disposableSigner);

  // Step 6: Publish to relays
  await publishShardEvent(event);

  return {
    eventId: event.id!,
    recipientPubkey: config.recipientPubkey,
    relays: config.relays,
    shardIndex: config.shard.index,
    publishedAt: createdAt,
    disposableKey: disposablePubkey
  };
}

/**
 * Stores a shard in localStorage for delayed publishing
 * 
 * Used when the calculated timestamp for a shard is too far in the future
 * to publish immediately (to avoid relay rejection).
 * 
 * @param shard - The encrypted shard to store
 * @param recipientPubkey - Public key of the trustee
 * @param relays - List of relays to publish to later
 */
export function storeShardLocally(
  shard: EncryptedShard,
  recipientPubkey: string,
  relays: string[]
): void {
  const STORAGE_KEY = 'pending_shards';
  const stored = localStorage.getItem(STORAGE_KEY) || '[]';
  const pendingShards = JSON.parse(stored);
  
  pendingShards.push({
    shard,
    recipientPubkey,
    relays,
    storedAt: Date.now()
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingShards));
}

/**
 * Retrieves and removes pending shards from localStorage
 * 
 * Used to get shards that were stored for delayed publishing.
 * Clears the storage after retrieval.
 * 
 * @returns Array of pending shard configurations
 */
export function getPendingShards(): Array<{
  shard: EncryptedShard;
  recipientPubkey: string;
  relays: string[];
  storedAt: number;
}> {
  const STORAGE_KEY = 'pending_shards';
  const stored = localStorage.getItem(STORAGE_KEY) || '[]';
  const pendingShards = JSON.parse(stored);
  localStorage.removeItem(STORAGE_KEY);
  return pendingShards;
}