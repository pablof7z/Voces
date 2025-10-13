<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import PictureUpload from '$lib/components/onboarding/PictureUpload.svelte';
  import { isAgoraRelay } from '$lib/utils/relayUtils';
  import { extractDomainFromRelay, checkNip05Availability, formatNip05 } from '$lib/utils/nip05';

  interface Props {
    profileData: {
      name: string;
      bio: string;
      location: string;
      banner: number;
      picture?: string;
      nip05: string;
    };
    onUpdateProfile: (data: { name: string; bio: string; location: string; banner: number; picture?: string; nip05: string }) => void;
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
    availabilityMessage = { type: 'info', text: 'Checking availability...' };

    // Debounce the check
    checkTimeout = setTimeout(async () => {
      const result = await checkNip05Availability(username, nip05Domain);

      if (result.available) {
        availabilityMessage = { type: 'success', text: '✓ Username is available' };
        isNip05Available = true;
      } else {
        availabilityMessage = { type: 'error', text: result.error || 'Username is not available' };
        isNip05Available = false;
      }

      isCheckingAvailability = false;
    }, 500);
  }

  const bannerColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

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

  function handleNext() {
    // Update profile data with NIP-05 if available
    if (isNip05Available && nip05Username && nip05Domain) {
      const fullNip05 = formatNip05(nip05Username, nip05Domain);
      onUpdateProfile({ ...profileData, nip05: fullNip05 });
    }
    onNext();
  }

  function cycleBanner() {
    const nextBanner = (profileData.banner + 1) % bannerColors.length;
    onUpdateProfile({ ...profileData, banner: nextBanner });
  }

  function handlePictureUpload(url: string) {
    onUpdateProfile({ ...profileData, picture: url });
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8">
  <div class="text-center mb-8 max-w-2xl">
    <h1 class="text-4xl font-bold mb-3">You're joining these leaders</h1>
    <p class="text-lg text-muted-foreground dark:text-muted-foreground">
      Create your profile to stand alongside influential voices in your community.
    </p>
  </div>

  <!-- Profile cards deck -->
  <div class="relative flex items-center justify-center gap-6 mb-12">
    <!-- Left card - Leopoldo López profile -->
    <div class="w-80 bg-white dark:bg-card border border rounded-xl overflow-hidden transform -rotate-3 scale-95 opacity-80">
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
          <p class="text-sm text-muted-foreground dark:text-muted-foreground">
            Former Mayor of Caracas (2000-08). Political prisoner 2014-21. Co-founder of World Liberty Congress.
          </p>
        </div>
      </div>
    </div>

    <!-- Center card - User's editable profile -->
    <div class="w-96 bg-white dark:bg-card border-2 border-foreground rounded-xl overflow-hidden shadow-2xl transform scale-105 z-10">
      <button
        onclick={cycleBanner}
        class="h-36 relative w-full group"
        style={`background-image: ${bannerColors[profileData.banner]}`}
      >
        <div class="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span class="text-foreground text-sm font-medium">Click to change</span>
        </div>
      </button>
      <div class="relative -mt-14 px-6 pb-6">
        <div class="relative w-28 h-28">
          <PictureUpload
            ndk={ndk}
            onUploadComplete={handlePictureUpload}
            currentImageUrl={profileData.picture}
            fallbackInitials={getInitials(profileData.name)}
          />
        </div>
        <div class="mt-4 space-y-3">
          <div>
            <input
              type="text"
              value={profileData.name}
              oninput={(e) => updateField('name', e.currentTarget.value)}
              placeholder="Your name"
              class="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border focus:border-foreground outline-none transition-colors w-full text-neutral-900 dark:text-foreground"
            />
          </div>
          <div>
            <input
              type="text"
              value={profileData.location}
              oninput={(e) => updateField('location', e.currentTarget.value)}
              placeholder="📍 Your location (optional)"
              class="text-sm text-muted-foreground dark:text-muted-foreground bg-transparent border-b border-transparent hover:border focus:border-foreground outline-none transition-colors w-full"
            />
          </div>
          <div>
            <textarea
              value={profileData.bio}
              oninput={(e) => updateField('bio', e.currentTarget.value)}
              placeholder="Tell your community about yourself..."
              class="text-sm text-muted-foreground dark:text-muted-foreground bg-transparent border border-transparent hover:border focus:border-foreground outline-none transition-colors w-full resize-none rounded p-2"
              rows={3}
            />
          </div>
          {#if showNip05}
            <div class="space-y-1">
              <div class="text-xs text-muted-foreground dark:text-muted-foreground font-medium">
                Choose your username
              </div>
              <div class="flex items-center gap-1">
                <input
                  type="text"
                  value={nip05Username}
                  oninput={(e) => handleUsernameInput(e.currentTarget.value)}
                  placeholder="username"
                  class="text-sm text-neutral-900 dark:text-foreground bg-transparent border-b-2 border hover:border focus:border-orange-500 dark:focus:border-orange-500 outline-none transition-colors flex-1 min-w-0"
                />
                <span class="text-sm text-muted-foreground dark:text-muted-foreground">@{nip05Domain}</span>
              </div>
              {#if availabilityMessage}
                <div class={`text-xs ${
                  availabilityMessage.type === 'success' ? 'text-green-600 dark:text-green-400' :
                  availabilityMessage.type === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-muted-foreground dark:text-muted-foreground'
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
    <div class="w-80 bg-white dark:bg-card border border rounded-xl overflow-hidden transform rotate-3 scale-95 opacity-80">
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
          <p class="text-sm text-muted-foreground dark:text-muted-foreground">
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
        : 'bg-neutral-100 dark:bg-muted text-muted-foreground dark:text-muted-foreground cursor-not-allowed'
      }
    `}
  >
    Continue →
  </button>
</div>
