<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { NDKPrivateKeySigner, NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';
  import { getPublicKey } from 'nostr-tools/pure';
  import { bytesToHex } from '@noble/hashes/utils';
  import { followPackUsers } from '$lib/utils/followPacks';
  import { settings } from '$lib/stores/settings.svelte';
  import { untrack } from 'svelte';
  import { getAgoraLanguage } from '$lib/utils/relayUtils';
  import { locale } from 'svelte-i18n';
  import Step1Community from '$lib/pages/onboarding/Step1Community.svelte';
  import Step2FollowPacks from '$lib/pages/onboarding/Step2FollowPacks.svelte';
  import Step3Features from '$lib/pages/onboarding/Step3Features.svelte';
  import Step4Profile from '$lib/pages/onboarding/Step6Profile.svelte';
  import Step5Introduction from '$lib/pages/onboarding/Step7Introduction.svelte';
  import Step6Welcome from '$lib/pages/onboarding/Step8Welcome.svelte';

  interface Props {
    inviteCode?: string;
  }

  let currentStep = $state(1);
  let selectedCommunity = $state<string | null>(null);
  let selectedPacks = $state<string[]>([]);
  let profileData = $state({
    name: '',
    bio: '',
    location: '',
    banner: 0,
    picture: undefined as string | undefined,
    nip05: '',
  });
  let publicKey = $state<string | null>(null);
  let inviteData = $state<any>(null);
  let hasPublishedInviteConfirmation = $state(false);
  let hasInitialized = $state(false);

  // If we have an invite, we skip community selection (step 1) and follow packs (step 2)
  const totalSteps = $derived(inviteData ? 4 : 6);
  const progressPercentage = $derived((currentStep / totalSteps) * 100);

  // Load invite data (runs once on mount)
  $effect(() => {
    if (inviteData) return; // Already loaded

    untrack(() => {
      const pageInviteData = $page.state?.inviteData;
      if (pageInviteData) {
        inviteData = pageInviteData;

        // Pre-fill profile data if available
        if (inviteData.recipientName) {
          profileData.name = inviteData.recipientName;
        }

        // Set language based on agora relay
        if (inviteData.inviteRelay) {
          const agoraLanguage = getAgoraLanguage(inviteData.inviteRelay);
          if (agoraLanguage) {
            console.log(`Setting language to ${agoraLanguage} based on agora relay ${inviteData.inviteRelay}`);
            settings.setLanguage(agoraLanguage);
            locale.set(agoraLanguage);
          }
        }

        // Skip community selection and follow packs, start at features
        currentStep = 3;

        console.log('Loaded invite data:', inviteData);
      }
    });
  });

  // Generate key and login (runs once)
  $effect(() => {
    if (hasInitialized) return;
    hasInitialized = true;

    (async () => {
      // Create signer and login
      const newSigner = NDKPrivateKeySigner.generate();
      try {
        await ndk.$sessions?.login(newSigner);
        console.log('Logged in with new keypair');
      } catch (err) {
        console.error('Error logging in with new keypair:', err);
      }
    })();
  });

  // Publish invite confirmation when session is ready
  async function publishInviteConfirmation() {
    if (!inviteData?.inviteEventId || !inviteData?.inviter || !inviteData?.inviteRelay || !inviteData?.inviteCode) {
      return;
    }

    try {
      const confirmationEvent = new NDKEvent(ndk);
      confirmationEvent.kind = 514;
      confirmationEvent.content = '';
      confirmationEvent.tags = [
        ['e', inviteData.inviteEventId],
        ['p', inviteData.inviter],
        ['code', inviteData.inviteCode],
      ];
      confirmationEvent.isProtected = true;

      await confirmationEvent.sign();

      // Publish ONLY to the invite relay
      const relay = ndk.pool.getRelay(inviteData.inviteRelay, true);
      if (relay) {
        const relaySet = new NDKRelaySet(new Set([relay]), ndk);
        console.log('Publishing kind:514 invite confirmation to', inviteData.inviteRelay);
        await confirmationEvent.publish(relaySet);
        console.log('Successfully published kind:514 invite confirmation');

        // Set the invite relay as the selected relay in settings
        untrack(() => {
          settings.setSelectedRelay(inviteData.inviteRelay);

          // Also ensure the relay is in the user's relay list
          const existingRelay = settings.relays.find(r => r.url === inviteData.inviteRelay);
          if (!existingRelay) {
            settings.addRelay({
              url: inviteData.inviteRelay,
              read: true,
              write: true,
              enabled: true
            });
          }
        });

        // Automatically follow everyone the inviter is following
        try {
          console.log('Fetching inviter contacts...');
          const inviterContactEvent = await ndk.fetchEvent({
            kinds: [3],
            authors: [inviteData.inviter]
          });

          if (inviterContactEvent) {
            const pTags = inviterContactEvent.tags.filter(tag => tag[0] === 'p');
            console.log(`Found ${pTags.length} contacts from inviter`);

            // Create our contact list with the inviter's contacts
            const contactListEvent = new NDKEvent(ndk);
            contactListEvent.kind = 3;
            contactListEvent.content = '';
            contactListEvent.tags = pTags; // Copy all p-tags

            await contactListEvent.publish();
            console.log('Published kind:3 contact list with inviter\'s follows');
          }
        } catch (err) {
          console.error('Error copying inviter contacts:', err);
        }
      }
    } catch (err) {
      console.error('Error publishing invite confirmation:', err);
      throw err;
    }
  }

  // Trigger invite confirmation publishing when user is ready
  $effect(() => {
    if (!ndk.$currentUser || hasPublishedInviteConfirmation || !inviteData) return;

    hasPublishedInviteConfirmation = true;

    publishInviteConfirmation().catch((err) => {
      console.error('Failed to publish invite confirmation:', err);
      hasPublishedInviteConfirmation = false;
    });
  });

  function goToStep(step: number) {
    currentStep = step;
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  function goBack() {
    // If we have an invite, don't let them go back to step 1 or 2
    const minStep = inviteData ? 3 : 1;
    if (currentStep > minStep) {
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

  async function handleStep4Next() {
    // Publish kind:0 profile metadata
    if (publicKey && profileData.name) {
      try {
        const profileEvent = new NDKEvent(ndk);
        profileEvent.kind = 0;
        profileEvent.content = JSON.stringify({
          name: profileData.name,
          about: profileData.bio,
          ...(profileData.location && { location: profileData.location }),
          ...(profileData.picture && { picture: profileData.picture }),
          ...(profileData.nip05 && { nip05: profileData.nip05 })
        });
        await profileEvent.publish();
        console.log('Published kind:0 profile metadata');
      } catch (err) {
        console.error('Error publishing profile:', err);
      }
    }
    goToStep(5);
  }

  async function completeOnboarding() {
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
        onSelectCommunity={(c) => selectedCommunity = c}
        onNext={() => goToStep(2)}
      />
    {/if}

    {#if currentStep === 2 && !inviteData}
      <Step2FollowPacks
        {selectedCommunity}
        {selectedPacks}
        onSelectPacks={(p) => selectedPacks = p}
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
        onUpdateProfile={(d) => profileData = d}
        onNext={handleStep4Next}
        inviteRelay={inviteData?.inviteRelay}
      />
    {/if}

    {#if currentStep === 5}
      <Step5Introduction
        {publicKey}
        {profileData}
        inviterPubkey={inviteData?.inviter}
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
