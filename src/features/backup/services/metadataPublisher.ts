/**
 * Service for publishing kind:1115 backup metadata events
 */

import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from '@nostr-dev-kit/ndk';
import type { PublishedShard } from './shardPublisher';
import { MetadataBuilder, type BackupMetadata } from './metadataBuilder';
import { BackupError, BackupErrorCode, withBackupErrorHandling } from '../errors';

/**
 * Constants for metadata publishing
 */
const METADATA_CONSTANTS = {
  // Custom event kind for backup metadata (not in NIPs)
  EVENT_KIND: 1115,
  
  // Tag identifier for backup metadata events
  D_TAG: 'key-backup',
} as const;

/**
 * Creates a Nostr event for backup metadata
 * 
 * @param ndk - NDK instance
 * @returns Prepared NDKEvent
 */
function createMetadataEvent(ndk: NDK): NDKEvent {
  const event = new NDKEvent(ndk);
  event.kind = METADATA_CONSTANTS.EVENT_KIND as any;
  event.created_at = Math.floor(Date.now() / 1000);
  event.tags = [['d', METADATA_CONSTANTS.D_TAG]];
  return event;
}

/**
 * Encrypts metadata payload to self using NIP-44
 * 
 * @param userSigner - User's private key signer
 * @param userPubkey - User's public key (for self-encryption)
 * @param payload - Metadata JSON string
 * @returns Encrypted content
 * @throws BackupError with ENCRYPTION_FAILED code on failure
 */
async function encryptMetadataPayload(
  userSigner: NDKPrivateKeySigner,
  userPubkey: string,
  payload: string
): Promise<string> {
  return withBackupErrorHandling(async () => {
    const selfUser = new NDKUser({ pubkey: userPubkey });
    return await userSigner.encrypt(selfUser, payload);
  }, BackupErrorCode.ENCRYPTION_FAILED, 'Failed to encrypt metadata');
}

/**
 * Signs and publishes a metadata event
 * 
 * @param event - Event to publish
 * @param signer - Signer to use
 * @throws BackupError with METADATA_PUBLISHING_FAILED code on failure
 */
async function publishMetadataEvent(
  event: NDKEvent,
  signer: NDKPrivateKeySigner
): Promise<void> {
  return withBackupErrorHandling(async () => {
    await event.sign(signer);
    await event.publish();
  }, BackupErrorCode.METADATA_PUBLISHING_FAILED, 'Failed to publish metadata event');
}

/**
 * Publishes a kind:1115 event with self-encrypted backup metadata
 * 
 * This event contains the mapping of shards to trustees and relay health info.
 * The metadata is encrypted to the user's own key for privacy while allowing
 * the user to later check shard health and trustee mappings.
 * 
 * @param ndk - NDK instance
 * @param publishedShards - Array of successfully published shards
 * @param threshold - Number of shards needed for recovery
 * @param userPrivateKey - User's private key (hex format)
 * @returns Event ID of the published metadata event
 * @throws BackupError on any failure in the publishing workflow
 */
export async function publishBackupMetadata(
  ndk: NDK,
  publishedShards: PublishedShard[],
  threshold: number,
  userPrivateKey: string
): Promise<string> {
  // Validate we have an active user
  const userPubkey = ndk.activeUser?.pubkey;
  if (!userPubkey) {
    throw new BackupError(
      BackupErrorCode.NO_USER,
      'No active user found'
    );
  }

  // Build metadata using builder pattern
  const metadata = new MetadataBuilder()
    .withThreshold(threshold)
    .withPublishedShards(publishedShards)
    .build();

  // Create event
  const event = createMetadataEvent(ndk);

  // Create signer and encrypt metadata
  const userSigner = new NDKPrivateKeySigner(userPrivateKey);
  event.content = await encryptMetadataPayload(
    userSigner,
    userPubkey,
    JSON.stringify(metadata)
  );

  // Sign and publish
  await publishMetadataEvent(event, userSigner);

  return event.id!;
}

/**
 * Decrypts metadata content from an event
 * 
 * @param userSigner - User's private key signer
 * @param userPubkey - User's public key
 * @param content - Encrypted content from event
 * @returns Decrypted metadata object
 * @throws BackupError with DECRYPTION_FAILED code on failure
 */
async function decryptMetadataContent(
  userSigner: NDKPrivateKeySigner,
  userPubkey: string,
  content: string
): Promise<BackupMetadata> {
  return withBackupErrorHandling(async () => {
    const selfUser = new NDKUser({ pubkey: userPubkey });
    const decrypted = await userSigner.decrypt(selfUser, content);
    return JSON.parse(decrypted) as BackupMetadata;
  }, BackupErrorCode.DECRYPTION_FAILED, 'Failed to decrypt metadata');
}

/**
 * Fetches the latest backup metadata for the current user
 * 
 * Queries for kind:1115 events authored by the user with the backup tag,
 * decrypts the most recent one, and returns the metadata.
 * 
 * @param ndk - NDK instance
 * @param userPrivateKey - User's private key for decryption
 * @returns BackupMetadata or null if no backup exists
 * @throws BackupError with METADATA_FETCH_FAILED code on failure
 */
export async function fetchBackupMetadata(
  ndk: NDK,
  userPrivateKey: string
): Promise<BackupMetadata | null> {
  const userPubkey = ndk.activeUser?.pubkey;
  if (!userPubkey) {
    return null;
  }

  return withBackupErrorHandling(async () => {
    // Fetch kind:1115 events authored by the user
    const events = await ndk.fetchEvents({
      kinds: [METADATA_CONSTANTS.EVENT_KIND as any],
      authors: [userPubkey],
      '#d': [METADATA_CONSTANTS.D_TAG]
    });

    if (events.size === 0) {
      return null;
    }

    // Get the most recent event
    const sortedEvents = Array.from(events).sort((a, b) => 
      b.created_at! - a.created_at!
    );
    const latestEvent = sortedEvents[0];

    // Decrypt the content
    const userSigner = new NDKPrivateKeySigner(userPrivateKey);
    return await decryptMetadataContent(userSigner, userPubkey, latestEvent.content);
  }, BackupErrorCode.METADATA_FETCH_FAILED, 'Failed to fetch backup metadata');
}

/**
 * Checks the health of shard events on their respective relays
 * 
 * For each shard in the metadata, attempts to fetch the event from its
 * designated relays to verify it's still available.
 * 
 * @param ndk - NDK instance
 * @param metadata - Backup metadata containing shard event information
 * @returns Array of health check results for each shard
 */
export async function checkShardHealth(
  ndk: NDK,
  metadata: BackupMetadata
): Promise<Array<{ shardIndex: number; healthy: boolean; relays: string[] }>> {
  const healthChecks = await Promise.all(
    metadata.shardEvents.map(async (shardEvent) => {
      let healthy = false;
      const healthyRelays: string[] = [];

      // Try to fetch the event from each relay
      for (const relayUrl of shardEvent.relays) {
        try {
          const events = await ndk.fetchEvents({
            ids: [shardEvent.eventId]
          });

          if (events.size > 0) {
            healthy = true;
            healthyRelays.push(relayUrl);
          }
        } catch {
          // Relay failed or event not found - continue to next relay
        }
      }

      return {
        shardIndex: shardEvent.shardIndex,
        healthy,
        relays: healthyRelays
      };
    })
  );

  return healthChecks;
}

// Re-export BackupMetadata type for convenience
export type { BackupMetadata } from './metadataBuilder';