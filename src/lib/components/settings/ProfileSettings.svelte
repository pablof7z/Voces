<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';
  import { NDKBlossom } from '@nostr-dev-kit/blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/svelte';
    import { AGORA_RELAYS } from '$lib/utils/relayUtils';

  let user = $derived(ndk.$currentUser);
  let profile = ndk.$fetchProfile(() => user?.pubkey);

  let isSubmitting = $state(false);
  let isSaved = $state(false);
  let error = $state<string | null>(null);

  // Initialize Blossom for image uploads
  const blossom = new NDKBlossom(ndk);
  const pictureUpload = useBlossomUpload(blossom);
  const bannerUpload = useBlossomUpload(blossom);

  // Form state
  let formData = $state({
    name: profile?.name || '',
    displayName: profile?.displayName || '',
    about: profile?.about || '',
    picture: profile?.image || '',
    banner: profile?.banner || '',
    nip05: profile?.nip05 || '',
    lud16: profile?.lud16 || '',
    website: profile?.website || '',
    hashtags: '' // Comma-separated hashtags
  });

  // Load existing hashtags from user's profile event
  async function loadHashtags() {
    if (!user) return '';

    try {
      const profileEvent = await ndk.fetchEvent({
        kinds: [0],
        authors: [user.pubkey]
      });

      if (profileEvent) {
        const tTags = profileEvent.tags.filter(tag => tag[0] === 't');
        return tTags.map(tag => tag[1]).join(', ');
      }
    } catch (err) {
      console.error('Failed to load hashtags:', err);
    }
    return '';
  }

  // Update form when profile loads
  $effect(() => {
    if (profile) {
      formData = {
        name: profile.name || '',
        displayName: profile.displayName || '',
        about: profile.about || '',
        picture: profile.image || '',
        banner: profile.banner || '',
        nip05: profile.nip05 || '',
        lud16: profile.lud16 || '',
        website: profile.website || '',
        hashtags: ''
      };

      // Load hashtags asynchronously
      loadHashtags().then(tags => {
        formData.hashtags = tags;
      });
    }
  });

  let pictureInput: HTMLInputElement;
  let bannerInput: HTMLInputElement;

  async function handlePictureUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error = 'Please select an image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error = 'Image size must be less than 5MB';
      return;
    }

    error = null;
    try {
      await pictureUpload.upload(file, {
        fallbackServer: 'https://blossom.primal.net'
      });
      if (pictureUpload.result?.url) {
        formData.picture = pictureUpload.result.url;
      }
    } catch (err) {
      console.error('Upload failed:', err);
      error = 'Failed to upload image. Please try again.';
    }
  }

  async function handleBannerUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error = 'Please select an image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error = 'Image size must be less than 5MB';
      return;
    }

    error = null;
    try {
      await bannerUpload.upload(file, {
        fallbackServer: 'https://blossom.primal.net'
      });
      if (bannerUpload.result?.url) {
        formData.banner = bannerUpload.result.url;
      }
    } catch (err) {
      console.error('Upload failed:', err);
      error = 'Failed to upload banner. Please try again.';
    }
  }

  async function handleSubmit() {
    if (!ndk.signer) {
      error = 'No signer available';
      return;
    }

    isSubmitting = true;
    error = null;
    isSaved = false;

    try {
      const event = new NDKEvent(ndk);
      event.kind = 0;
      event.content = JSON.stringify({
        name: formData.name,
        display_name: formData.displayName,
        about: formData.about,
        picture: formData.picture,
        banner: formData.banner,
        nip05: formData.nip05,
        lud16: formData.lud16,
        website: formData.website
      });

      // Add hashtags as "t" tags (lowercase)
      if (formData.hashtags.trim()) {
        const hashtags = formData.hashtags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        event.tags = hashtags.map(tag => ['t', tag]);
      }

      await event.publishReplaceable();
      const profileRelaySet = NDKRelaySet.fromRelayUrls([ 'wss://purplapag.es', ...AGORA_RELAYS ], ndk)
      event.publishReplaceable(profileRelaySet);

      isSaved = true;
      setTimeout(() => isSaved = false, 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      error = 'Failed to save profile. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function getInitials(name: string) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
</script>

<div class="max-w-2xl mx-auto space-y-8">
  <!-- Success/Error Messages -->
  {#if isSaved}
    <div class="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
      <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span class="text-sm font-medium text-green-800 dark:text-green-200">Profile updated successfully!</span>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
      <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm font-medium text-red-800 dark:text-red-200">{error}</span>
    </div>
  {/if}

  <!-- Banner -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      Banner Image
    </label>
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
      disabled={bannerUpload.status === 'uploading'}
      class="w-full h-48 rounded-xl overflow-hidden relative group bg-gradient-to-br from-orange-500 to-red-500 hover:opacity-90 transition-opacity"
      style={formData.banner ? `background-image: url(${formData.banner}); background-size: cover; background-position: center;` : ''}
    >
      <div class="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        {#if bannerUpload.status === 'uploading'}
          <div class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span class="text-foreground text-sm font-medium">{bannerUpload.progress?.percentage}%</span>
        {:else}
          <svg class="w-10 h-10 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-foreground text-sm font-medium">Click to upload banner</span>
        {/if}
      </div>
    </button>
  </div>

  <!-- Profile Picture -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      Profile Picture
    </label>
    <input
      bind:this={pictureInput}
      type="file"
      accept="image/*"
      onchange={handlePictureUpload}
      class="hidden"
    />
    <div class="flex items-center gap-4">
      <button
        type="button"
        onclick={() => pictureInput?.click()}
        disabled={pictureUpload.status === 'uploading'}
        class="w-24 h-24 rounded-full overflow-hidden relative group bg-gradient-to-br from-orange-500 to-red-500 hover:ring-4 hover:ring-orange-500/20 transition-all flex items-center justify-center"
      >
        {#if formData.picture}
          <img src={formData.picture} alt="Profile" class="w-full h-full object-cover" />
        {:else}
          <span class="text-foreground text-2xl font-bold">{getInitials(formData.name)}</span>
        {/if}
        <div class="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {#if pictureUpload.status === 'uploading'}
            <div class="flex flex-col items-center gap-1">
              <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="text-foreground text-xs">{pictureUpload.progress?.percentage}%</span>
            </div>
          {:else}
            <svg class="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          {/if}
        </div>
      </button>
      <div class="flex-1">
        <input
          type="url"
          bind:value={formData.picture}
          placeholder="Or paste image URL"
          class="w-full px-4 py-2 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          disabled={pictureUpload.status === 'uploading'}
        />
      </div>
    </div>
  </div>

  <!-- Name -->
  <div class="space-y-2">
    <label for="name" class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      Name
    </label>
    <input
      id="name"
      type="text"
      bind:value={formData.name}
      placeholder="Satoshi Nakamoto"
      class="w-full px-4 py-2 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    />
  </div>

  <!-- Display Name -->
  <div class="space-y-2">
    <label for="displayName" class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      Display Name
      <span class="text-muted-foreground text-xs font-normal">(optional)</span>
    </label>
    <input
      id="displayName"
      type="text"
      bind:value={formData.displayName}
      placeholder="satoshi"
      class="w-full px-4 py-2 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    />
  </div>

  <!-- About -->
  <div class="space-y-2">
    <label for="about-textarea" class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      About
    </label>
    <textarea
      id="about-textarea"
      bind:value={formData.about}
      placeholder="Tell the world about yourself..."
      rows="5"
      class="w-full px-4 py-3 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    ></textarea>
  </div>

  <!-- NIP-05 -->
  <div class="space-y-2">
    <label for="nip05" class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      NIP-05 Verification
      <span class="text-muted-foreground text-xs font-normal">(optional)</span>
    </label>
    <input
      id="nip05"
      type="text"
      bind:value={formData.nip05}
      placeholder="name@domain.com"
      class="w-full px-4 py-2 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    />
  </div>

  <!-- Lightning Address -->
  <div class="space-y-2">
    <label for="lud16" class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      Lightning Address
      <span class="text-muted-foreground text-xs font-normal">(optional)</span>
    </label>
    <input
      id="lud16"
      type="text"
      bind:value={formData.lud16}
      placeholder="name@getalby.com"
      class="w-full px-4 py-2 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    />
  </div>

  <!-- Website -->
  <div class="space-y-2">
    <label for="website" class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      Website
      <span class="text-muted-foreground text-xs font-normal">(optional)</span>
    </label>
    <input
      id="website"
      type="url"
      bind:value={formData.website}
      placeholder="https://example.com"
      class="w-full px-4 py-2 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    />
  </div>

  <!-- Hashtags -->
  <div class="space-y-2">
    <label for="hashtags" class="block text-sm font-medium text-neutral-900 dark:text-foreground">
      Interest Hashtags
      <span class="text-muted-foreground text-xs font-normal">(optional)</span>
    </label>
    <input
      id="hashtags"
      type="text"
      bind:value={formData.hashtags}
      placeholder="bitcoin, nostr, freedom (comma-separated)"
      class="w-full px-4 py-2 rounded-lg border border bg-white dark:bg-card text-neutral-900 dark:text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
    />
    <p class="text-xs text-muted-foreground dark:text-muted-foreground">
      Add hashtags that describe your interests. Separate multiple tags with commas.
    </p>
  </div>

  <!-- Save Button -->
  <div class="flex justify-end pt-4">
    <button
      type="button"
      onclick={handleSubmit}
      disabled={isSubmitting || pictureUpload.status === 'uploading' || bannerUpload.status === 'uploading'}
      class="px-6 py-3 bg-primary hover:bg-accent-dark text-foreground font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {#if isSubmitting}
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Saving...</span>
      {:else}
        <span>Save Profile</span>
      {/if}
    </button>
  </div>
</div>
