<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
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

  let activeTab = $state<'view' | 'backup'>('view');
  let showNsec = $state(false);
  let copySuccess = $state(false);

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

  const isPrivateKeySigner = $derived(ndk.signer instanceof NDKPrivateKeySigner);

  const nsec = $derived.by(() => {
    if (!isPrivateKeySigner || !ndk.signer) return null;
    const signer = ndk.signer as NDKPrivateKeySigner;
    return signer.nsec;
  });

  let canProceed = $derived(trustees.length >= totalShards && isPassphraseValid);

  async function copyToClipboard() {
    if (!nsec) return;

    try {
      await navigator.clipboard.writeText(nsec);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function toggleShowNsec() {
    showNsec = !showNsec;
  }

  function getUserRelays(): string[] {
    return Array.from(ndk.pool?.relays.values() || [])
      .map(relay => relay.url)
      .slice(0, MAX_RELAYS);
  }

  function getPrivateKey(): string {
    if (!isPrivateKeySigner || !ndk.signer) {
      throw new BackupError(
        BackupErrorCode.NO_PRIVATE_KEY,
        'No private key signer available'
      );
    }
    const signer = ndk.signer as NDKPrivateKeySigner;
    const privateKey = signer.privateKey;
    if (!privateKey) {
      throw new BackupError(
        BackupErrorCode.NO_PRIVATE_KEY,
        'Private key not found in signer'
      );
    }
    return privateKey;
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
          const published = await publishShard(ndk, {
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

      await publishBackupMetadata(ndk, publishedShards, threshold, privateKey);

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

{#if isPrivateKeySigner && nsec}
  <div class="space-y-6">
    <!-- Tab Navigation -->
    <div class="flex gap-2 p-1 bg-neutral-100 dark:bg-card rounded-lg">
      <button
        onclick={() => activeTab = 'view'}
        class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors {activeTab === 'view'
          ? 'bg-white dark:bg-muted text-neutral-900 dark:text-foreground shadow-sm'
          : 'text-muted-foreground dark:text-muted-foreground hover:text-neutral-900 dark:hover:text-foreground'}"
      >
        View Key
      </button>
      <button
        onclick={() => activeTab = 'backup'}
        class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors {activeTab === 'backup'
          ? 'bg-white dark:bg-muted text-neutral-900 dark:text-foreground shadow-sm'
          : 'text-muted-foreground dark:text-muted-foreground hover:text-neutral-900 dark:hover:text-foreground'}"
      >
        Create Backup
      </button>
    </div>

    {#if activeTab === 'view'}
      <!-- View Private Key Tab -->
      <div class="space-y-6">
        <!-- Warning Banner -->
        <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Critical Security Warning
              </h3>
              <p class="text-xs text-red-800 dark:text-red-200">
                Your private key (nsec) is the only way to access your account. Anyone with access to this key has full control of your identity. Never share it with anyone and store it securely offline.
              </p>
            </div>
          </div>
        </div>

        <!-- Private Key Display Section -->
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-neutral-900 dark:text-foreground mb-1">
              Your Private Key (nsec)
            </h3>
            <p class="text-xs text-muted-foreground dark:text-muted-foreground">
              You are logged in with a private key signer. Save this key somewhere safe.
            </p>
          </div>

          <div class="space-y-3">
            <!-- Key Display -->
            <div class="relative">
              <div class="bg-neutral-100 dark:bg-card border border rounded-lg p-4">
                {#if showNsec}
                  <code class="text-xs text-neutral-900 dark:text-foreground break-all font-mono">
                    {nsec}
                  </code>
                {:else}
                  <div class="text-xs text-muted-foreground dark:text-muted-foreground font-mono">
                    {'•'.repeat(63)}
                  </div>
                {/if}
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                onclick={toggleShowNsec}
                class="flex-1 px-4 py-2 bg-neutral-200 dark:bg-muted text-neutral-700 dark:text-muted-foreground rounded-lg hover:bg-neutral-300 dark:hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                {#if showNsec}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide Key
                {:else}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show Key
                {/if}
              </button>

              <button
                onclick={copyToClipboard}
                disabled={!showNsec}
                class="flex-1 px-4 py-2 bg-orange-600 text-foreground rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if copySuccess}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                {:else}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Key
                {/if}
              </button>
            </div>

            <p class="text-xs text-muted-foreground dark:text-muted-foreground text-center">
              Make sure nobody is watching your screen before revealing your key
            </p>
          </div>
        </div>

        <!-- Best Practices -->
        <div class="bg-neutral-50 dark:bg-card border border rounded-lg p-4">
          <h4 class="text-sm font-medium text-neutral-900 dark:text-foreground mb-2">
            Security Best Practices
          </h4>
          <ul class="space-y-2 text-xs text-muted-foreground dark:text-muted-foreground">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Write down your nsec on paper and store it in a safe place</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Never share your nsec via email, messaging apps, or websites</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Consider using a browser extension signer for better security</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Use the "Create Backup" tab to create encrypted shards with trusted contacts</span>
            </li>
          </ul>
        </div>
      </div>
    {:else}
      <!-- Create Backup Tab -->
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

            <h3 class="text-lg font-semibold text-neutral-900 dark:text-foreground mb-2">
              {progress.message}
            </h3>

            {#if progress.status !== 'complete' && progress.status !== 'error'}
              <p class="text-sm text-muted-foreground dark:text-muted-foreground">
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
                class="mt-6 px-4 py-2 bg-neutral-200 dark:bg-muted text-neutral-700 dark:text-muted-foreground rounded-lg hover:bg-neutral-300 dark:hover:bg-muted transition-colors"
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
              class="w-full px-4 py-3 bg-orange-600 text-foreground rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Create Backup
            </button>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <div class="text-center py-8">
    <div class="w-16 h-16 bg-neutral-100 dark:bg-card rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 class="text-sm font-medium text-neutral-900 dark:text-foreground mb-2">
      Not Using Private Key Signer
    </h3>
    <p class="text-xs text-muted-foreground dark:text-muted-foreground max-w-sm mx-auto">
      You are not logged in with a private key signer. This section is only available for users who logged in with an nsec.
    </p>
  </div>
{/if}
