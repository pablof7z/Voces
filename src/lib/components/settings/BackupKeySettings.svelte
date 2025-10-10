<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import type { Trustee, BackupProgress } from '$lib/backup/types';
  import { BackupError, BackupErrorCode } from '$lib/backup/errors';
  import { createEncryptedShards } from '$lib/backup/utils/shamir';
  import { publishShard, storeShardLocally } from '$lib/backup/services/shardPublisher';
  import { publishBackupMetadata } from '$lib/backup/services/metadataPublisher';
  import TrusteeSelector from '$lib/components/backup/TrusteeSelector.svelte';
  import QuorumSelector from '$lib/components/backup/QuorumSelector.svelte';
  import PassphraseInput from '$lib/components/backup/PassphraseInput.svelte';
  import WarningBanner from '$lib/components/backup/WarningBanner.svelte';

  const MAX_PUBLISH_OFFSET_DAYS = 2;
  const OFFSET_INCREMENT_DAYS = 3;
  const MAX_RELAYS = 5;

  let step = $state<'setup' | 'progress'>('setup');
  let threshold = $state(2);
  let totalShards = $state(3);
  let trustees = $state<Trustee[]>([]);
  let passphrase = $state('');
  let confirmPassphrase = $state('');
  let isPassphraseValid = $state(false);

  let progress = $state<BackupProgress>({
    status: 'idle',
    currentStep: 0,
    totalSteps: 0,
    message: ''
  });

  let canProceed = $derived(trustees.length >= totalShards && isPassphraseValid);

  function getUserRelays(): string[] {
    return Array.from($ndk.pool?.relays.values() || [])
      .map(relay => relay.url)
      .slice(0, MAX_RELAYS);
  }

  function getPrivateKey(): string {
    const nsec = localStorage.getItem('nostr_private_key');
    if (!nsec) {
      throw new BackupError(
        BackupErrorCode.NO_PRIVATE_KEY,
        'Private key not found in storage'
      );
    }
    return nsec;
  }

  async function handleCreateBackup() {
    const currentUser = ndk.$currentUser;
    if (!currentUser) {
      throw new BackupError(BackupErrorCode.NO_USER, 'No authenticated user found');
    }

    try {
      step = 'progress';
      const privateKey = getPrivateKey();
      const totalSteps = totalShards + 2;

      progress = {
        status: 'creating-shards',
        currentStep: 0,
        totalSteps,
        message: 'Starting backup creation...'
      };

      const encryptedShards = await createEncryptedShards(
        privateKey,
        passphrase,
        { threshold, totalShards }
      );

      progress = {
        ...progress,
        currentStep: 2,
        status: 'publishing',
        message: 'Publishing shards...'
      };

      const publishedShards = [];
      const userRelays = getUserRelays();
      const selectedTrustees = trustees.slice(0, totalShards);

      for (let i = 0; i < encryptedShards.length; i++) {
        const shard = encryptedShards[i];
        const trustee = selectedTrustees[i];

        progress = {
          ...progress,
          currentStep: 2 + i,
          message: `Publishing shard ${i + 1} of ${totalShards}...`
        };

        const createdAtOffset = i === 0 ? 0 : i * OFFSET_INCREMENT_DAYS;

        if (createdAtOffset > MAX_PUBLISH_OFFSET_DAYS) {
          storeShardLocally(shard, trustee.pubkey, userRelays);
        } else {
          const published = await publishShard($ndk, {
            shard,
            recipientPubkey: trustee.pubkey,
            createdAtOffset,
            relays: userRelays
          });
          publishedShards.push(published);
        }
      }

      progress = {
        ...progress,
        currentStep: totalShards + 1,
        message: 'Publishing metadata...'
      };

      await publishBackupMetadata($ndk, publishedShards, threshold, privateKey);

      progress = {
        ...progress,
        status: 'complete',
        currentStep: totalSteps,
        message: 'Backup created successfully!'
      };
    } catch (error) {
      console.error('Backup creation failed:', error);
      const backupError = error instanceof BackupError
        ? error
        : new BackupError(
            BackupErrorCode.UNKNOWN_ERROR,
            error instanceof Error ? error.message : 'Unknown error',
            error
          );

      progress = {
        ...progress,
        status: 'error',
        message: backupError.getUserMessage(),
        error: backupError.message
      };
    }
  }

  function resetProgress() {
    step = 'setup';
    progress = {
      status: 'idle',
      currentStep: 0,
      totalSteps: 0,
      message: ''
    };
  }
</script>

<div class="space-y-6">
  {#if step === 'progress'}
    <!-- Progress View -->
    <div class="flex flex-col items-center justify-center py-12">
      {#if progress.status === 'complete'}
        <div class="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      {:else if progress.status === 'error'}
        <div class="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      {:else}
        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-4 animate-spin">
          <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      {/if}

      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {progress.message}
      </h3>

      {#if progress.status !== 'complete' && progress.status !== 'error'}
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Step {progress.currentStep} of {progress.totalSteps}
        </p>
      {/if}

      {#if progress.status === 'error' && progress.error}
        <p class="text-sm text-red-600 dark:text-red-400 mt-2 text-center max-w-md">
          {progress.error}
        </p>
      {/if}

      {#if progress.status === 'complete' || progress.status === 'error'}
        <button
          onclick={resetProgress}
          class="mt-6 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
        >
          Close
        </button>
      {/if}
    </div>
  {:else}
    <!-- Setup View -->
    <WarningBanner
      title="Security Warning"
      description="Key backup splits your private key into encrypted pieces. Choose trustworthy contacts and a strong passphrase you won't forget."
      variant="danger"
    />

    <QuorumSelector
      {threshold}
      {totalShards}
      onThresholdChange={(t) => threshold = t}
      onTotalShardsChange={(t) => totalShards = t}
      maxShards={10}
    />

    <TrusteeSelector
      {trustees}
      maxTrustees={totalShards}
      onTrusteesChange={(t) => trustees = t}
    />

    {#if trustees.length >= totalShards}
      <PassphraseInput
        value={passphrase}
        confirmValue={confirmPassphrase}
        onChange={(v) => passphrase = v}
        onConfirmChange={(v) => confirmPassphrase = v}
        onValidChange={(v) => isPassphraseValid = v}
      />
    {/if}

    {#if canProceed}
      <button
        onclick={handleCreateBackup}
        class="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Create Backup
      </button>
    {/if}
  {/if}
</div>
