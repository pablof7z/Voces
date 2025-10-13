<script lang="ts">
  import { NDKBlossom } from '@nostr-dev-kit/blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/svelte';
  import type { NDK } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDK;
    onUploadComplete: (url: string) => void;
    currentImageUrl?: string;
    fallbackInitials?: string;
  }

  let { ndk, onUploadComplete, currentImageUrl, fallbackInitials }: Props = $props();

  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);

  let fileInput: HTMLInputElement;
  let previewUrl = $state<string | null>(currentImageUrl || null);
  let isDragging = $state(false);

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    try {
      await upload.upload(file, {
        fallbackServer: 'https://blossom.primal.net'
      });
      if (upload.result?.url) {
        onUploadComplete(upload.result.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      previewUrl = null;
    }
  }

  function handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      handleFileSelect(file);
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

    const file = event.dataTransfer?.files[0];
    if (file) {
      await handleFileSelect(file);
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }
</script>

<div class="w-full">
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    onchange={handleFileInputChange}
    class="hidden"
  />

  <div
    role="button"
    tabindex="0"
    onclick={triggerFileInput}
    onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    class={`
      relative w-32 h-32 rounded-full overflow-hidden cursor-pointer
      border-4 border-background
      transition-all duration-200
      ${isDragging ? 'scale-105 border-foreground' : ''}
      ${upload.status === 'uploading' ? 'pointer-events-none' : ''}
    `}
  >
    {#if previewUrl && upload.status !== 'uploading'}
      <img
        src={previewUrl}
        alt="Profile"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-background/0 hover:bg-background/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>
    {:else if upload.status === 'uploading'}
      <div class="w-full h-full bg-neutral-100 dark:bg-muted flex flex-col items-center justify-center">
        <div class="w-12 h-12 border-4 border border-t-neutral-900 dark:border-t-white rounded-full animate-spin"></div>
        {#if upload.progress}
          <p class="text-xs mt-2 text-muted-foreground dark:text-muted-foreground">{upload.progress.percentage}%</p>
        {/if}
      </div>
    {:else}
      <div class="w-full h-full bg-card dark:bg-white text-foreground dark:text-black hover:bg-muted dark:hover:bg-neutral-100 transition-colors flex flex-col items-center justify-center gap-2 group">
        {#if fallbackInitials}
          <span class="text-3xl font-bold group-hover:opacity-50 transition-opacity">
            {fallbackInitials}
          </span>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-background/40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
        {:else}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        {/if}
      </div>
    {/if}
  </div>

  {#if upload.status === 'error'}
    <p class="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
      {upload.error?.message || 'Upload failed'}
    </p>
  {/if}

  <p class="text-xs text-muted-foreground dark:text-muted-foreground mt-2 text-center">
    Click or drag to upload photo
  </p>
</div>
