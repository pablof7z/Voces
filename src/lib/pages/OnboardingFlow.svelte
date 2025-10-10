<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { goto } from '$app/navigation';
  import { NDKPrivateKeySigner, NDKEvent } from '@nostr-dev-kit/ndk';
  import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
  import { bytesToHex } from '@noble/hashes/utils';
  import { followPackUsers } from '$lib/utils/followPacks';
  import Step1Community from './onboarding/Step1Community.svelte';
  import Step2FollowPacks from './onboarding/Step2FollowPacks.svelte';
  import Step3Marketplace from './onboarding/Step3Marketplace.svelte';
  import Step4P2PTrades from './onboarding/Step4P2PTrades.svelte';
  import Step5News from './onboarding/Step5News.svelte';
  import Step6Profile from './onboarding/Step6Profile.svelte';
  import Step7Introduction from './onboarding/Step7Introduction.svelte';
  import Step8Welcome from './onboarding/Step8Welcome.svelte';

  let currentStep = $state(1);
  let selectedCommunity = $state<string | null>(null);
  let selectedPacks = $state<string[]>([]);
  let profileData = $state({
    name: '',
    bio: '',
    location: '',
    banner: 0,
  });
  let privateKey = $state<string | null>(null);
  let publicKey = $state<string | null>(null);

  const totalSteps = 8;
  const progressPercentage = $derived((currentStep / totalSteps) * 100);

  $effect(() => {
    (async () => {
      const secretKey = generateSecretKey();
      const privKey = bytesToHex(secretKey);
      const pubKey = getPublicKey(secretKey);
      privateKey = privKey;
      publicKey = pubKey;

      // Create signer and login
      const newSigner = new NDKPrivateKeySigner(privKey);
      try {
        await ndk.$sessions.login(newSigner, true);
        console.log('Logged in with new keypair:', pubKey);
      } catch (err) {
        console.error('Error logging in with new keypair:', err);
      }
    })();
  });

  function goToStep(step: number) {
    currentStep = step;
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  function goBack() {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }

  async function handleStep2Next() {
    // Publish kind:3 contact list when follow packs are selected
    if (selectedPacks.length > 0 && publicKey) {
      try {
        await followPackUsers(ndk, selectedPacks);
        console.log(`Published kind:3 with follows from ${selectedPacks.length} packs`);
      } catch (err) {
        console.error('Error publishing contact list:', err);
      }
    }
    goToStep(3);
  }

  async function handleStep6Next() {
    // Publish kind:0 profile metadata
    if (publicKey && profileData.name) {
      try {
        const profileEvent = new NDKEvent(ndk);
        profileEvent.kind = 0;
        profileEvent.content = JSON.stringify({
          name: profileData.name,
          about: profileData.bio,
          ...(profileData.location && { location: profileData.location })
        });
        await profileEvent.publish();
        console.log('Published kind:0 profile metadata');
      } catch (err) {
        console.error('Error publishing profile:', err);
      }
    }
    goToStep(7);
  }

  function completeOnboarding() {
    goto('/');
  }
</script>

<div class="min-h-screen bg-white dark:bg-black">
  <!-- Progress Bar -->
  <div class="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-black">
    <div class="h-1 bg-neutral-200 dark:bg-neutral-800">
      <div
        class="h-full bg-black dark:bg-white transition-all duration-300 ease-out"
        style={`width: ${progressPercentage}%`}
      />
    </div>
  </div>

  <!-- Back Button -->
  {#if currentStep > 1}
    <button
      onclick={goBack}
      class="fixed top-6 left-6 z-50 w-9 h-9 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  {/if}

  <!-- Steps -->
  <div class="relative pt-8">
    {#if currentStep === 1}
      <Step1Community
        {selectedCommunity}
        onSelectCommunity={(c) => selectedCommunity = c}
        onNext={() => goToStep(2)}
      />
    {/if}

    {#if currentStep === 2}
      <Step2FollowPacks
        {selectedCommunity}
        {selectedPacks}
        onSelectPacks={(p) => selectedPacks = p}
        onNext={handleStep2Next}
      />
    {/if}

    {#if currentStep === 3}
      <Step3Marketplace
        onNext={() => goToStep(4)}
      />
    {/if}

    {#if currentStep === 4}
      <Step4P2PTrades
        onNext={() => goToStep(5)}
      />
    {/if}

    {#if currentStep === 5}
      <Step5News
        onNext={() => goToStep(6)}
      />
    {/if}

    {#if currentStep === 6}
      <Step6Profile
        {profileData}
        onUpdateProfile={(d) => profileData = d}
        onNext={handleStep6Next}
      />
    {/if}

    {#if currentStep === 7}
      <Step7Introduction
        {publicKey}
        {profileData}
        onNext={() => goToStep(8)}
        onSkip={() => goToStep(8)}
      />
    {/if}

    {#if currentStep === 8}
      <Step8Welcome
        {selectedPacks}
        {profileData}
        onComplete={completeOnboarding}
      />
    {/if}
  </div>
</div>
