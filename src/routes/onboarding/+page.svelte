<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { goto } from '$app/navigation';
  import { NDKPrivateKeySigner, NDKEvent } from '@nostr-dev-kit/ndk';
  import { followPackUsers } from '$lib/utils/followPacks';
  import { onboardingStore } from '$lib/stores/onboarding.svelte';
  import Step1Community from '$lib/pages/onboarding/Step1Community.svelte';
  import Step2FollowPacks from '$lib/pages/onboarding/Step2FollowPacks.svelte';
  import Step3Features from '$lib/pages/onboarding/Step3Features.svelte';
  import Step4Profile from '$lib/pages/onboarding/Step6Profile.svelte';
  import Step5Introduction from '$lib/pages/onboarding/Step7Introduction.svelte';
  import Step6Welcome from '$lib/pages/onboarding/Step8Welcome.svelte';

  let hasInitialized = $state(false);
  let signer = $state<NDKPrivateKeySigner>(NDKPrivateKeySigner.generate());

  // Derived values from store
  const currentStep = $derived(onboardingStore.currentStep);
  const totalSteps = $derived(onboardingStore.totalSteps);
  const progressPercentage = $derived((currentStep / totalSteps) * 100);
  const inviteData = $derived(onboardingStore.invite);
  const hasCompletedInviteSetup = $derived(onboardingStore.hasCompletedInviteSetup);
  const selectedCommunity = $derived(onboardingStore.selectedCommunity);
  const selectedPacks = $derived(onboardingStore.selectedPacks);
  const profileData = $derived(onboardingStore.profileData);

  // Generate key and login (runs once)
  $effect(() => {
    console.log('[Onboarding] Login effect triggered:', { hasInitialized, hasSigner: !!signer });
    if (hasInitialized || !signer) return;
    hasInitialized = true;

    (async () => {
      try {
        console.log('[Onboarding] Attempting login with signer...');
        await ndk.$sessions?.login(signer);
        console.log('[Onboarding] ✓ Logged in with new keypair, pubkey:', signer.pubkey);
      } catch (err) {
        console.error('[Onboarding] ✗ Error logging in with new keypair:', err);
      }
    })();
  });

  // Publish invite confirmation and copy contacts when user is ready
  $effect(() => {
    console.log('[Onboarding] Invite effect triggered:', {
      hasCurrentUser: !!ndk.$currentUser,
      hasInviteData: !!inviteData,
      hasCompletedInviteSetup,
      inviteData: inviteData ? {
        inviter: inviteData.inviter,
        inviteRelay: inviteData.inviteRelay,
        inviteCode: inviteData.inviteCode,
        inviteEventId: inviteData.inviteEventId
      } : null
    });

    if (hasCompletedInviteSetup) {
      console.log('[Onboarding] ⊘ Invite setup already completed, skipping');
      return;
    }

    if (!ndk.$currentUser) {
      console.log('[Onboarding] Waiting for currentUser...');
      return;
    }

    if (!inviteData) {
      console.log('[Onboarding] No invite data, skipping invite setup');
      return;
    }

    console.log('[Onboarding] Starting invite setup...');

    (async () => {
      try {
        await onboardingStore.completeInviteSetup(signer);
        console.log('[Onboarding] ✓ Invite setup complete');
      } catch (err) {
        console.error('[Onboarding] ✗ Failed to complete invite setup:', err);
      }
    })();
  });

  function goToStep(step: number) {
    onboardingStore.setStep(step);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  function goBack() {
    if (currentStep > onboardingStore.minStep) {
      goToStep(currentStep - 1);
    }
  }

  async function handleStep2Next() {
    // Publish kind:3 contact list when follow packs are selected
    if (selectedPacks.length > 0) {
      try {
        await followPackUsers(ndk, selectedPacks);
        console.log(`Published kind:3 with follows from ${selectedPacks.length} packs`);
      } catch (err) {
        console.error('Error publishing contact list:', err);
      }
    }
    goToStep(3);
  }

  async function handleStep4Next() {
    console.log('[Onboarding] handleStep4Next called');
    try {
      await onboardingStore.publishProfile();
      console.log('[Onboarding] ✓ Profile published');
    } catch (err) {
      console.error('[Onboarding] ✗ Error publishing profile:', err);
    }
    goToStep(5);
  }

  async function completeOnboarding() {
    // Create wallet for users without invite
    if (!inviteData) {
      try {
        console.log('[Onboarding] Creating default wallet for non-invited user');
        await onboardingStore.createDefaultWallet();
      } catch (err) {
        console.error('[Onboarding] ✗ Failed to create wallet:', err);
      }
    }

    onboardingStore.clear();
    goto('/');
  }
</script>

<div class="min-h-screen bg-card">
  <!-- Progress Bar -->
  <div class="fixed top-0 left-0 right-0 z-40 bg-card">
    <div class="h-1 bg-neutral-200 dark:bg-muted">
      <div
        class="h-full bg-background dark:bg-white transition-all duration-300 ease-out"
        style={`width: ${progressPercentage}%`}
      />
    </div>
  </div>

  <!-- Back Button -->
  {#if currentStep > (inviteData ? 3 : 1)}
    <button
      onclick={goBack}
      class="fixed top-6 left-6 z-50 w-9 h-9 bg-card border border rounded-full flex items-center justify-center hover:bg-accent transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  {/if}

  <!-- Steps -->
  <div class="relative pt-8">
    {#if currentStep === 1 && !inviteData}
      <Step1Community
        {selectedCommunity}
        onSelectCommunity={(c) => onboardingStore.setSelectedCommunity(c)}
        onNext={() => goToStep(2)}
      />
    {/if}

    {#if currentStep === 2 && !inviteData}
      <Step2FollowPacks
        {selectedCommunity}
        {selectedPacks}
        onSelectPacks={(p) => onboardingStore.setSelectedPacks(p)}
        onNext={handleStep2Next}
      />
    {/if}

    {#if currentStep === 3}
      <Step3Features
        onNext={() => goToStep(4)}
      />
    {/if}

    {#if currentStep === 4}
      <Step4Profile
        {profileData}
        onUpdateProfile={(d) => onboardingStore.setProfileData(d)}
        onNext={handleStep4Next}
        inviteRelay={inviteData?.inviteRelay}
      />
    {/if}

    {#if currentStep === 5}
      <Step5Introduction
        {profileData}
        inviterPubkey={inviteData?.inviter}
        inviteRelay={inviteData?.inviteRelay}
        onNext={() => goToStep(6)}
        onSkip={() => goToStep(6)}
      />
    {/if}

    {#if currentStep === 6}
      <Step6Welcome
        {selectedPacks}
        {profileData}
        onComplete={completeOnboarding}
      />
    {/if}
  </div>
</div>
