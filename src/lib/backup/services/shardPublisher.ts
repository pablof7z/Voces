import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from '@nostr-dev-kit/ndk';
import type { EncryptedShard } from '../utils/shamir';
import { BackupErrorCode, withBackupErrorHandling } from '../errors';

export interface ShardPublishConfig {
  shard: EncryptedShard;
  recipientPubkey: string;
  createdAtOffset: number;
  relays: string[];
}

export interface PublishedShard {
  eventId: string;
  recipientPubkey: string;
  relays: string[];
  shardIndex: number;
  publishedAt: number;
  disposableKey: string;
}

const SHARD_PUBLISH_CONSTANTS = {
  EVENT_KIND: 3,
  SECONDS_PER_DAY: 24 * 60 * 60,
} as const;

async function generateDisposableKey(): Promise<[NDKPrivateKeySigner, string]> {
  return withBackupErrorHandling(async () => {
    const signer = NDKPrivateKeySigner.generate();
    const user = await signer.user();
    return [signer, user.pubkey];
  }, BackupErrorCode.EVENT_CREATION_FAILED, 'Failed to generate disposable key');
}

function calculateShardTimestamp(offsetDays: number): number {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const offsetSeconds = offsetDays * SHARD_PUBLISH_CONSTANTS.SECONDS_PER_DAY;
  return currentTimestamp + offsetSeconds;
}

function createShardPayload(shard: EncryptedShard): string {
  return JSON.stringify({
    encryptedShard: shard.encryptedData,
    index: shard.index,
    threshold: shard.threshold,
    totalShards: shard.totalShards
  });
}

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

async function signShardEvent(
  event: NDKEvent,
  signer: NDKPrivateKeySigner
): Promise<void> {
  return withBackupErrorHandling(async () => {
    await event.sign(signer);
  }, BackupErrorCode.EVENT_SIGNING_FAILED, 'Failed to sign shard event');
}

async function publishShardEvent(event: NDKEvent): Promise<void> {
  return withBackupErrorHandling(async () => {
    await event.publish();
  }, BackupErrorCode.EVENT_PUBLISHING_FAILED, 'Failed to publish shard event');
}

export async function publishShard(
  ndk: NDK,
  config: ShardPublishConfig
): Promise<PublishedShard> {
  const [disposableSigner, disposablePubkey] = await generateDisposableKey();
  const createdAt = calculateShardTimestamp(config.createdAtOffset);
  const event = createShardEvent(ndk, config.recipientPubkey, createdAt);

  const payload = createShardPayload(config.shard);
  event.content = await encryptShardPayload(
    disposableSigner,
    config.recipientPubkey,
    payload
  );

  await signShardEvent(event, disposableSigner);
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
