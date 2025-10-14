<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import PictureUpload from '$lib/components/onboarding/PictureUpload.svelte';
  import { isAgoraRelay } from '$lib/utils/relayUtils';
  import { extractDomainFromRelay, checkNip05Availability, formatNip05 } from '$lib/utils/nip05';
  import { t } from 'svelte-i18n';
  import { NDKBlossom } from '@nostr-dev-kit/blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    profileData: {
      name: string;
      bio: string;
      location: string;
      banner?: string;
      picture?: string;
      nip05: string;
    };
    onUpdateProfile: (data: { name: string; bio: string; location: string; banner?: string; picture?: string; nip05: string }) => void;
    onNext: () => void;
    inviteRelay?: string;
  }

  let { profileData, onUpdateProfile, onNext, inviteRelay }: Props = $props();

  // NIP-05 state
  const showNip05 = $derived(inviteRelay && isAgoraRelay(inviteRelay));
  const nip05Domain = $derived(inviteRelay ? extractDomainFromRelay(inviteRelay) : '');
  let nip05Username = $state('');
  let isCheckingAvailability = $state(false);
  let availabilityMessage = $state<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  let isNip05Available = $state(false);

  // Check username availability with debounce
  let checkTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleUsernameInput(username: string) {
    nip05Username = username;

    if (!username || !nip05Domain) {
      availabilityMessage = null;
      isNip05Available = false;
      return;
    }

    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Set checking state
    isCheckingAvailability = true;
    availabilityMessage = { type: 'info', text: $t('onboarding.step4Profile.availability.checking') };

    // Debounce the check
    checkTimeout = setTimeout(async () => {
      const result = await checkNip05Availability(username, nip05Domain);

      if (result.available) {
        availabilityMessage = { type: 'success', text: $t('onboarding.step4Profile.availability.available') };
        isNip05Available = true;
      } else {
        availabilityMessage = { type: 'error', text: result.error || $t('onboarding.step4Profile.availability.notAvailable') };
        isNip05Available = false;
      }

      isCheckingAvailability = false;
    }, 500);
  }

  // Initialize Blossom for banner uploads
  const user = $derived(ndk.$currentUser);
  const blossom = $derived.by(() => {
    if (!user) return null;
    return new NDKBlossom(ndk);
  });

  const bannerUpload = $derived.by(() => {
    if (!blossom) return null;
    return useBlossomUpload(blossom);
  });

  let bannerInput: HTMLInputElement;
  let uploadError = $state<string | null>(null);

  async function handleBannerUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!bannerUpload) {
      uploadError = 'Upload not available. Please ensure you are logged in.';
      return;
    }

    if (!file.type.startsWith('image/')) {
      uploadError = 'Please select an image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      uploadError = 'Image size must be less than 5MB';
      return;
    }

    uploadError = null;
    try {
      await bannerUpload.upload(file, {
        fallbackServer: 'https://blossom.primal.net'
      });
      if (bannerUpload.result?.url) {
        onUpdateProfile({ ...profileData, banner: bannerUpload.result.url });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      uploadError = 'Failed to upload banner. Please try again.';
    }
  }

  function getInitials(name: string) {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function updateField(field: string, value: string) {
    onUpdateProfile({ ...profileData, [field]: value });
  }

  async function handleNext() {
    // Update profile data with NIP-05 if available
    if (isNip05Available && nip05Username && nip05Domain) {
      const fullNip05 = formatNip05(nip05Username, nip05Domain);
      onUpdateProfile({ ...profileData, nip05: fullNip05 });
    }

    // Publish kind:10002 relay list
    try {
      const relays = new Set<string>();

      // Add agora relay from invite if present
      if (inviteRelay) {
        relays.add(inviteRelay);
        console.log('Including agora relay from invite:', inviteRelay);
      }

      // Add default relays
      relays.add('wss://purplepag.es');
      relays.add('wss://relay.primal.net');

      console.log('Building kind:10002 relay list with relays:', Array.from(relays));

      const relayListEvent = new NDKEvent(ndk);
      relayListEvent.kind = 10002;
      relayListEvent.tags = Array.from(relays).map(url => ['r', url]);

      console.log('Publishing kind:10002 relay list...');
      await relayListEvent.publish();
      console.log('Published kind:10002 relay list');
    } catch (err) {
      console.error('Error publishing relay list:', err);
    }

    onNext();
  }

  function handlePictureUpload(url: string) {
    onUpdateProfile({ ...profileData, picture: url });
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8">
  <div class="text-center mb-8 max-w-2xl">
    <h1 class="text-4xl font-bold mb-3">{$t('onboarding.step4Profile.title')}</h1>
    <p class="text-lg text-muted-foreground">
      {$t('onboarding.step4Profile.subtitle')}
    </p>
  </div>

  <!-- Profile cards deck -->
  <div class="relative flex items-center justify-center gap-6 mb-12">
    <!-- Left card - Leopoldo López profile -->
    <div class="w-80 bg-card border border rounded-xl overflow-hidden transform -rotate-3 scale-95 opacity-80">
      <div
        class="h-32 bg-cover bg-center"
        style="background-image: url(https://m.primal.net/OQwX.jpg)"
      />
      <div class="relative -mt-12 px-6 pb-6">
        <img
          src="https://m.primal.net/OQwW.jpg"
          alt="Leopoldo López"
          class="w-24 h-24 rounded-full border-4 border-background object-cover"
        />
        <div class="mt-4">
          <h3 class="text-xl font-bold">Leopoldo López</h3>
          <p class="text-sm text-muted-foreground mb-2">✓ leo@primal.net</p>
          <p class="text-sm text-muted-foreground">
            Former Mayor of Caracas (2000-08). Political prisoner 2014-21. Co-founder of World Liberty Congress.
          </p>
        </div>
      </div>
    </div>

    <!-- Center card - User's editable profile -->
    <div class="w-96 bg-card border-2 border-foreground rounded-xl overflow-hidden shadow-2xl transform scale-105 z-10">
      <input
        bind:this={bannerInput}
        type="file"
        accept="image/*"
        onchange={handleBannerUpload}
        class="hidden"
      />
      <button
        type="button"
        onclick={() => bannerInput?.click()}
        disabled={bannerUpload?.status === 'uploading'}
        class="h-36 relative w-full group bg-gradient-to-br from-primary-500 to-primary-600"
        style={profileData.banner ? `background-image: url(${profileData.banner}); background-size: cover; background-position: center;` : ''}
      >
        <div class="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          {#if bannerUpload?.status === 'uploading'}
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span class="text-foreground text-sm font-medium">{bannerUpload.progress?.percentage}%</span>
          {:else}
            <svg class="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          {/if}
        </div>
      </button>
      {#if uploadError}
        <div class="px-2 py-1 bg-red-500/10 border-t border-red-500/20">
          <p class="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
        </div>
      {/if}
      <div class="relative -mt-14 px-6 pb-6">
        <PictureUpload
          ndk={ndk}
          onUploadComplete={handlePictureUpload}
          currentImageUrl={profileData.picture}
          fallbackInitials={getInitials(profileData.name)}
        />
        <div class="space-y-3">
          <div>
            <input
              type="text"
              value={profileData.name}
              oninput={(e) => updateField('name', e.currentTarget.value)}
              placeholder={$t('onboarding.step4Profile.namePlaceholder')}
              class="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border !ring-0 outline-none transition-colors w-full text-foreground"
            />
          </div>
          <div>
            <input
              type="text"
              value={profileData.location}
              oninput={(e) => updateField('location', e.currentTarget.value)}
              placeholder={$t('onboarding.step4Profile.locationPlaceholder')}
              class="text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border !ring-0 focus:outline-none transition-colors w-full"
            />
          </div>
          <div>
            <textarea
              value={profileData.bio}
              oninput={(e) => updateField('bio', e.currentTarget.value)}
              placeholder={$t('onboarding.step4Profile.bioPlaceholder')}
              class="text-sm text-muted-foreground bg-transparent border border-transparent hover:border !ring-0 outline-none transition-colors w-full resize-none rounded p-2"
              rows={3}
            />
          </div>
          {#if showNip05}
            <div class="space-y-1">
              <div class="text-xs text-muted-foreground font-medium">
                {$t('onboarding.step4Profile.usernameLabel')}
              </div>
              <div class="flex items-center gap-1">
                <input
                  type="text"
                  value={nip05Username}
                  oninput={(e) => handleUsernameInput(e.currentTarget.value)}
                  placeholder={$t('onboarding.step4Profile.usernamePlaceholder')}
                  class="text-sm text-foreground bg-transparent border-b-2 border hover:border focus:border-primary dark:focus:border-primary outline-none transition-colors flex-1 min-w-0"
                />
                <span class="text-sm text-muted-foreground">@{nip05Domain}</span>
              </div>
              {#if availabilityMessage}
                <div class={`text-xs ${
                  availabilityMessage.type === 'success' ? 'text-green-600 dark:text-green-400' :
                  availabilityMessage.type === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-muted-foreground'
                }`}>
                  {availabilityMessage.text}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Right card - Enderson Sequera profile -->
    <div class="w-80 bg-card border border rounded-xl overflow-hidden transform rotate-3 scale-95 opacity-80">
      <div
        class="h-32 bg-cover bg-center"
        style="background-image: url(https://m.primal.net/OTue.jpg)"
      />
      <div class="relative -mt-12 px-6 pb-6">
        <img
          src="https://m.primal.net/OTkq.jpg"
          alt="Enderson Sequera"
          class="w-24 h-24 rounded-full border-4 border-background object-cover"
        />
        <div class="mt-4">
          <h3 class="text-xl font-bold">Enderson Sequera</h3>
          <p class="text-sm text-muted-foreground mb-2">🇻🇪 Political Scientist</p>
          <p class="text-sm text-muted-foreground">
            Political advisor & freedom fighter. Bitcoin is freedom - in the fight against dictatorship it saves lives.
          </p>
        </div>
      </div>
    </div>
  </div>

  <button
    onclick={handleNext}
    disabled={!profileData.name}
    class={`
      px-8 py-3 rounded-lg font-medium transition-all
      ${profileData.name
        ? 'bg-card dark:bg-white text-foreground dark:text-black hover:bg-muted dark:hover:bg-neutral-100'
        : 'bg-neutral-100 dark:bg-muted text-muted-foreground cursor-not-allowed'
      }
    `}
  >
    {$t('onboarding.step4Profile.continue')} →
  </button>
</div>
