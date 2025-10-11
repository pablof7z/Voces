import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser, NDKKind } from '@nostr-dev-kit/ndk';
import type { PublishedShard } from './shardPublisher';
import { MetadataBuilder, type BackupMetadata } from './metadataBuilder';
import { BackupError, BackupErrorCode, withBackupErrorHandling } from '../errors';

const METADATA_CONSTANTS = {
  EVENT_KIND: 1115,
  D_TAG: 'key-backup',
} as const;

function createMetadataEvent(ndk: NDK): NDKEvent {
  const event = new NDKEvent(ndk);
  event.kind = METADATA_CONSTANTS.EVENT_KIND as NDKKind;
  event.created_at = Math.floor(Date.now() / 1000);
  event.tags = [['d', METADATA_CONSTANTS.D_TAG]];
  return event;
}

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

async function publishMetadataEvent(
  event: NDKEvent,
  signer: NDKPrivateKeySigner
): Promise<void> {
  return withBackupErrorHandling(async () => {
    await event.sign(signer);
    await event.publish();
  }, BackupErrorCode.METADATA_PUBLISHING_FAILED, 'Failed to publish metadata event');
}

export async function publishBackupMetadata(
  ndk: NDK,
  publishedShards: PublishedShard[],
  threshold: number,
  userPrivateKey: string
): Promise<string> {
  const userPubkey = ndk.activeUser?.pubkey;
  if (!userPubkey) {
    throw new BackupError(
      BackupErrorCode.NO_USER,
      'No active user found'
    );
  }

  const metadata = new MetadataBuilder()
    .withThreshold(threshold)
    .withPublishedShards(publishedShards)
    .build();

  const event = createMetadataEvent(ndk);

  const userSigner = new NDKPrivateKeySigner(userPrivateKey);
  event.content = await encryptMetadataPayload(
    userSigner,
    userPubkey,
    JSON.stringify(metadata)
  );

  await publishMetadataEvent(event, userSigner);

  return event.id!;
}

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

export async function fetchBackupMetadata(
  ndk: NDK,
  userPrivateKey: string
): Promise<BackupMetadata | null> {
  const userPubkey = ndk.activeUser?.pubkey;
  if (!userPubkey) {
    return null;
  }

  return withBackupErrorHandling(async () => {
    const events = await ndk.fetchEvents({
      kinds: [METADATA_CONSTANTS.EVENT_KIND as NDKKind],
      authors: [userPubkey],
      '#d': [METADATA_CONSTANTS.D_TAG]
    });

    if (events.size === 0) {
      return null;
    }

    const sortedEvents = Array.from(events).sort((a, b) =>
      b.created_at! - a.created_at!
    );
    const latestEvent = sortedEvents[0];

    const userSigner = new NDKPrivateKeySigner(userPrivateKey);
    return await decryptMetadataContent(userSigner, userPubkey, latestEvent.content);
  }, BackupErrorCode.METADATA_FETCH_FAILED, 'Failed to fetch backup metadata');
}

export async function checkShardHealth(
  ndk: NDK,
  metadata: BackupMetadata
): Promise<Array<{ shardIndex: number; healthy: boolean; relays: string[] }>> {
  const healthChecks = await Promise.all(
    metadata.shardEvents.map(async (shardEvent) => {
      let healthy = false;
      const healthyRelays: string[] = [];

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
          // Continue to next relay
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

export type { BackupMetadata } from './metadataBuilder';
