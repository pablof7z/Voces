import { useCallback } from 'react';
import type NDK from '@nostr-dev-kit/ndk';
import type { NDKUser } from '@nostr-dev-kit/ndk';
import { createEncryptedShards } from '../utils/shamir';
import { publishShard, storeShardLocally, type PublishedShard } from '../services/shardPublisher';
import { publishBackupMetadata } from '../services/metadataPublisher';
import type { Trustee } from '../types';
import { BackupError, BackupErrorCode } from '../errors';
import type { UseBackupProgressResult } from './useBackupProgress';

const MAX_PUBLISH_OFFSET_DAYS = 2;
const OFFSET_INCREMENT_DAYS = 3;
const MAX_RELAYS = 5;

interface BackupConfig {
  threshold: number;
  totalShards: number;
  trustees: Trustee[];
  passphrase: string;
}

interface UseBackupWorkflowParams {
  ndk: NDK | null;
  currentUser: NDKUser | null;
  progress: UseBackupProgressResult;
}

export function useBackupWorkflow({ ndk, currentUser, progress }: UseBackupWorkflowParams) {
  const getUserRelays = useCallback((ndk: NDK): string[] => {
    return Array.from(ndk.pool?.relays.values() || [])
      .map(relay => relay.url)
      .slice(0, MAX_RELAYS);
  }, []);

  const getPrivateKey = useCallback((): string => {
    const nsec = localStorage.getItem('nostr_private_key');
    if (!nsec) {
      throw new BackupError(
        BackupErrorCode.NO_PRIVATE_KEY,
        'Private key not found in storage'
      );
    }
    return nsec;
  }, []);

  const createShards = useCallback(async (
    privateKey: string,
    passphrase: string,
    config: Pick<BackupConfig, 'threshold' | 'totalShards'>
  ) => {
    return await createEncryptedShards(privateKey, passphrase, {
      threshold: config.threshold,
      totalShards: config.totalShards
    });
  }, []);

  const publishShards = useCallback(async (
    ndk: NDK,
    encryptedShards: Awaited<ReturnType<typeof createEncryptedShards>>,
    trustees: Trustee[],
    totalShards: number,
    onProgress: (index: number) => void
  ): Promise<PublishedShard[]> => {
    const publishedShards: PublishedShard[] = [];
    const selectedTrustees = trustees.slice(0, totalShards);
    const userRelays = getUserRelays(ndk);

    for (let i = 0; i < encryptedShards.length; i++) {
      const shard = encryptedShards[i];
      const trustee = selectedTrustees[i];

      onProgress(i);

      const createdAtOffset = i === 0 ? 0 : i * OFFSET_INCREMENT_DAYS;

      if (createdAtOffset > MAX_PUBLISH_OFFSET_DAYS) {
        storeShardLocally(shard, trustee.pubkey, userRelays);
      } else {
        const published = await publishShard(ndk, {
          shard,
          recipientPubkey: trustee.pubkey,
          createdAtOffset,
          relays: userRelays
        });
        publishedShards.push(published);
      }
    }

    return publishedShards;
  }, [getUserRelays]);

  const createBackup = useCallback(async (config: BackupConfig) => {
    if (!currentUser || !ndk) {
      throw new BackupError(
        BackupErrorCode.NO_USER,
        'No authenticated user found'
      );
    }

    try {
      const privateKey = getPrivateKey();
      const totalSteps = config.totalShards + 2;

      progress.startProgress(totalSteps);

      const encryptedShards = await createShards(
        privateKey,
        config.passphrase,
        config
      );

      progress.updateProgress(2, 'publishing');

      const publishedShards = await publishShards(
        ndk,
        encryptedShards,
        config.trustees,
        config.totalShards,
        (index) => {
          progress.updateProgress(2 + index, 'publishing');
        }
      );

      progress.updateProgress(config.totalShards + 1, 'publishing');

      await publishBackupMetadata(ndk, publishedShards, config.threshold, privateKey);

      progress.completeProgress();
    } catch (error) {
      console.error('Backup creation failed:', error);
      const backupError = error instanceof BackupError 
        ? error 
        : new BackupError(
            BackupErrorCode.UNKNOWN_ERROR,
            error instanceof Error ? error.message : 'Unknown error',
            error
          );
      progress.failProgress(backupError);
      throw backupError;
    }
  }, [currentUser, ndk, progress, getPrivateKey, createShards, publishShards]);

  return { createBackup };
}