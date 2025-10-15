<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';
  import { NDKBlossom } from '@nostr-dev-kit/blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import RelayPublishSelector from '$lib/components/RelayPublishSelector.svelte';
  import { browser } from '$app/environment';

  interface Props {
    open?: boolean;
    onClose?: () => void;
  }

  let { open = $bindable(false), onClose }: Props = $props();

  let isPublishing = $state(false);
  let currentImageIndex = $state(0);
  let showAdvanced = $state(false);

  // Form fields
  let content = $state('');
  let location = $state('');
  let newTag = $state('');
  let tags = $state<string[]>([]);
  let newMention = $state('');
  let mentions = $state<string[]>([]);
  let isNsfw = $state(false);

  // Upload state
  let uploadedImages = $state<Array<{
    url: string;
    mimeType: string;
    hash: string;
    blurhash?: string;
    dimensions?: { width: number; height: number };
  }>>([]);
  let fileInput: HTMLInputElement;
  let isDragging = $state(false);

  // Relay selector
  let selectedRelayUrls = $state<string[]>([]);
  let isProtected = $state(false);

  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);

  const currentUser = ndk.$currentUser;
  const isMobile = $derived(browser && window.innerWidth < 768);

  // Auto-open file picker on mobile when modal opens
  $effect(() => {
    if (open && isMobile && uploadedImages.length === 0) {
      setTimeout(() => {
        fileInput?.click();
      }, 300);
    }
  });

  function encodeGeohash(lat: number, lon: number, precision = 5): string {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let idx = 0;
    let bit = 0;
    let evenBit = true;
    let geohash = '';

    let latRange = [-90.0, 90.0];
    let lonRange = [-180.0, 180.0];

    while (geohash.length < precision) {
      if (evenBit) {
        const mid = (lonRange[0] + lonRange[1]) / 2;
        if (lon >= mid) {
          idx |= (1 << (4 - bit));
          lonRange[0] = mid;
        } else {
          lonRange[1] = mid;
        }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if (lat >= mid) {
          idx |= (1 << (4 - bit));
          latRange[0] = mid;
        } else {
          latRange[1] = mid;
        }
      }

      evenBit = !evenBit;
      bit++;

      if (bit === 5) {
        geohash += base32[idx];
        bit = 0;
        idx = 0;
      }
    }

    return geohash;
  }

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      await upload.upload(file, {
        fallbackServer: 'https://blossom.primal.net'
      });

      if (upload.result?.url) {
        // Get image dimensions
        const img = new Image();
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = URL.createObjectURL(file);
        });

        uploadedImages = [...uploadedImages, {
          url: upload.result.url,
          mimeType: file.type,
          hash: upload.result.sha256 || '',
          blurhash: upload.result.blurhash,
          dimensions
        }];

        currentImageIndex = uploadedImages.length - 1;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  }

  function handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      // Handle multiple files
      Array.from(files).forEach(file => handleFileSelect(file));
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      Array.from(files).forEach(file => handleFileSelect(file));
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }

  function removeImage(index: number) {
    uploadedImages = uploadedImages.filter((_, i) => i !== index);
    if (currentImageIndex >= uploadedImages.length) {
      currentImageIndex = Math.max(0, uploadedImages.length - 1);
    }
  }

  function addTag() {
    if (newTag && !tags.includes(newTag.toLowerCase())) {
      tags = [...tags, newTag.toLowerCase()];
      newTag = '';
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter(t => t !== tag);
  }

  function addMention() {
    if (newMention && !mentions.includes(newMention)) {
      mentions = [...mentions, newMention];
      newMention = '';
    }
  }

  function removeMention(mention: string) {
    mentions = mentions.filter(m => m !== mention);
  }

  function handleLocationRequest() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const gh = encodeGeohash(lat, lon, 5);
          location = `Near ${gh}`;
          toast.success('Location detected');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported');
    }
  }

  async function publishMediaPost() {
    if (!content.trim() || uploadedImages.length === 0 || isPublishing) {
      if (uploadedImages.length === 0) {
        toast.error('Please add at least one image');
      } else {
        toast.error('Please add a caption');
      }
      return;
    }

    if (!currentUser) {
      toast.error('Please log in to create a media post');
      return;
    }

    if (selectedRelayUrls.length === 0) {
      toast.error('Please select at least one relay to publish to');
      return;
    }

    try {
      isPublishing = true;

      const event = new NDKEvent(ndk);
      event.kind = 20;
      event.content = content.trim();
      event.isProtected = isProtected;

      // Add imeta tags for each image
      uploadedImages.forEach(img => {
        const imetaTag = ['imeta', `url ${img.url}`, `m ${img.mimeType}`];
        if (img.hash) imetaTag.push(`x ${img.hash}`);
        if (img.blurhash) imetaTag.push(`blurhash ${img.blurhash}`);
        if (img.dimensions) imetaTag.push(`dim ${img.dimensions.width}x${img.dimensions.height}`);
        event.tags.push(imetaTag);
      });

      // Add hashtags
      tags.forEach(tag => {
        event.tags.push(['t', tag]);
      });

      // Add mentions
      mentions.forEach(mention => {
        event.tags.push(['p', mention]);
      });

      // Add location with geohash
      if (location.trim()) {
        if (location.startsWith('Near ')) {
          const geohash = location.replace('Near ', '');
          // Add multiple precision levels
          for (let i = 3; i <= geohash.length; i++) {
            event.tags.push(['g', geohash.substring(0, i)]);
          }
        } else {
          event.tags.push(['location', location.trim()]);
        }
      }

      // Add content warning if NSFW
      if (isNsfw) {
        event.tags.push(['content-warning', 'nsfw']);
      }

      await event.sign();

      const relaySet = NDKRelaySet.fromRelayUrls(selectedRelayUrls, ndk);
      await event.publish(relaySet);

      if (event.publishStatus === 'error') {
        const error = event.publishError;
        const relayErrors = error?.relayErrors || {};
        const errorMessages = Object.entries(relayErrors)
          .map(([relay, err]) => `${relay}: ${err}`)
          .join('\n');
        toast.error(`Failed to publish:\n${errorMessages || 'Unknown error'}`);
        return;
      }

      toast.success('Posted!');
      resetForm();
      open = false;
      onClose?.();
    } catch (error) {
      console.error('Failed to publish media post:', error);
      toast.error(`Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isPublishing = false;
    }
  }

  function resetForm() {
    content = '';
    location = '';
    tags = [];
    mentions = [];
    newTag = '';
    newMention = '';
    uploadedImages = [];
    currentImageIndex = 0;
    isNsfw = false;
    showAdvanced = false;
  }

  function handleClose() {
    if (!isPublishing) {
      resetForm();
      open = false;
      onClose?.();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isPublishing) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog.Root {open} onOpenChange={(newOpen) => {
    open = newOpen;
    if (!newOpen) handleClose();
  }}>
  <Dialog.Content class="max-md:!max-w-none max-md:!w-full max-md:!h-[100vh] max-md:!m-0 max-md:!rounded-none max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background">
      <button
        onclick={handleClose}
        disabled={isPublishing}
        class="text-foreground hover:text-muted-foreground transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <Dialog.Title class="text-lg md:text-xl font-semibold">New Post</Dialog.Title>
      <Button
        onclick={publishMediaPost}
        disabled={!content.trim() || uploadedImages.length === 0 || isPublishing || selectedRelayUrls.length === 0}
        size="sm"
        class="h-9 px-4"
      >
        {isPublishing ? 'Posting...' : 'Post'}
      </Button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto">
      <input
        bind:this={fileInput}
        type="file"
        accept="image/*"
        multiple
        onchange={handleFileInputChange}
        class="hidden"
      />

      {#if uploadedImages.length > 0}
        <!-- Mobile: Image-first layout -->
        <div class="md:grid md:grid-cols-[2fr,3fr] md:h-full">
          <!-- Images Section -->
          <div class="md:border-r border-border md:p-6 p-0">
            <!-- Main Image Preview -->
            <div class="relative w-full md:aspect-square md:rounded-lg overflow-hidden bg-black">
              <img
                src={uploadedImages[currentImageIndex].url}
                alt={`Image ${currentImageIndex + 1}`}
                class="w-full h-full object-contain"
              />
              <button
                onclick={() => removeImage(currentImageIndex)}
                class="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {#if uploadedImages.length > 1}
                <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                  {#each uploadedImages as _, index}
                    <button
                      onclick={() => currentImageIndex = index}
                      class="w-2 h-2 rounded-full transition-all {currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'}"
                    ></button>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Thumbnail Navigation (desktop only) -->
            <div class="hidden md:flex items-center gap-2 overflow-x-auto pb-2 mt-4">
              {#each uploadedImages as img, index}
                <button
                  onclick={() => currentImageIndex = index}
                  class="w-16 h-16 rounded border-2 transition-all flex-shrink-0 {currentImageIndex === index ? 'border-primary' : 'border-border'}"
                >
                  <img src={img.url} alt="" class="w-full h-full object-cover rounded" />
                </button>
              {/each}

              <button
                onclick={triggerFileInput}
                class="w-16 h-16 rounded border-2 border-dashed border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center flex-shrink-0"
              >
                <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Caption & Options Section -->
          <div class="p-4 md:p-6 space-y-4 md:overflow-auto">
            <!-- Caption -->
            <Textarea
              bind:value={content}
              placeholder="Write a caption..."
              rows={4}
              autofocus={!isMobile}
              class="resize-none border-0 focus-visible:ring-0 px-0 text-base placeholder:text-muted-foreground"
            />

            <!-- Quick actions -->
            <div class="flex items-center gap-3 flex-wrap">
              <button
                onclick={triggerFileInput}
                class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add more
              </button>

              <button
                onclick={handleLocationRequest}
                class="inline-flex items-center gap-1.5 text-sm {location ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {location || 'Add location'}
              </button>

              <button
                onclick={() => showAdvanced = !showAdvanced}
                class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
              >
                <svg class="w-4 h-4 transition-transform {showAdvanced ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                {showAdvanced ? 'Less' : 'More'}
              </button>
            </div>

            <!-- Tags -->
            {#if tags.length > 0 || showAdvanced}
              <div class="flex flex-wrap gap-2 items-center">
                {#each tags as tag}
                  <button
                    onclick={() => removeTag(tag)}
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                  >
                    <span>#{tag}</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                {/each}
                {#if showAdvanced}
                  <Input
                    type="text"
                    bind:value={newTag}
                    placeholder="tag"
                    class="w-24 h-8 text-sm"
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                {/if}
              </div>
            {/if}

            <!-- Advanced Options -->
            {#if showAdvanced}
              <div class="space-y-4 pt-4 border-t border-border">
                <!-- Manual Location -->
                {#if !location.startsWith('Near ')}
                  <div>
                    <Input
                      type="text"
                      bind:value={location}
                      placeholder="Enter location manually"
                      class="text-sm"
                    />
                  </div>
                {/if}

                <!-- Tag People -->
                <div class="space-y-2">
                  <div class="flex gap-2">
                    <Input
                      type="text"
                      bind:value={newMention}
                      placeholder="Tag someone (npub or hex)"
                      class="text-sm flex-1"
                      onkeydown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addMention();
                        }
                      }}
                    />
                    <Button type="button" onclick={addMention} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                  {#if mentions.length > 0}
                    <div class="flex flex-wrap gap-2">
                      {#each mentions as mention}
                        <button
                          onclick={() => removeMention(mention)}
                          class="inline-flex items-center gap-1 px-2.5 py-1 bg-muted text-foreground rounded-full text-sm hover:bg-muted/80 transition-colors"
                        >
                          <span>@{mention.substring(0, 8)}...</span>
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>

                <!-- NSFW Toggle -->
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={isNsfw}
                    class="w-4 h-4 rounded border-border"
                  />
                  <span class="text-sm text-muted-foreground">Sensitive content (NSFW)</span>
                </label>

                <!-- Relay Selector -->
                <div>
                  <p class="text-sm text-muted-foreground mb-2">Publish to</p>
                  <RelayPublishSelector bind:selectedRelayUrls bind:isProtected disabled={isPublishing} />
                </div>
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <!-- Desktop: Show dropzone when no images -->
        <div class="hidden md:flex items-center justify-center p-12 h-full">
          <div
            role="button"
            tabindex="0"
            onclick={triggerFileInput}
            onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
            ondrop={handleDrop}
            class="w-full max-w-md aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center justify-center cursor-pointer {isDragging ? 'border-primary bg-muted/50' : ''} {upload.status === 'uploading' ? 'pointer-events-none' : ''}"
          >
            {#if upload.status === 'uploading'}
              <div class="flex flex-col items-center gap-2">
                <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                {#if upload.progress}
                  <p class="text-sm text-muted-foreground">{upload.progress.percentage}%</p>
                {/if}
              </div>
            {:else}
              <svg class="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-lg font-medium text-foreground mb-2">Drop images here</p>
              <p class="text-sm text-muted-foreground">or click to browse</p>
              <p class="text-xs text-muted-foreground mt-2">Multiple images supported</p>
            {/if}
          </div>
        </div>

        <!-- Mobile: Show loading or prompt to select from camera roll -->
        <div class="md:hidden flex items-center justify-center p-8 h-full min-h-[60vh]">
          <div class="text-center">
            {#if upload.status === 'uploading'}
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                <p class="text-sm text-muted-foreground">Uploading...</p>
                {#if upload.progress}
                  <p class="text-xs text-muted-foreground">{upload.progress.percentage}%</p>
                {/if}
              </div>
            {:else}
              <svg class="w-16 h-16 text-muted-foreground mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-muted-foreground mb-4">No images selected</p>
              <Button onclick={triggerFileInput}>
                Choose Photos
              </Button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
