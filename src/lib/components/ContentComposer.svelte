<script lang="ts">
  import { NDKBlossom } from '@nostr-dev-kit/blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/ndk.svelte';
  import { Button } from '$lib/components/ui/button';
  import { toast } from '$lib/stores/toast.svelte';
  import UserSelector from '$lib/components/UserSelector.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    placeholder?: string;
    autofocus?: boolean;
    disabled?: boolean;
    class?: string;
    relayButton?: Snippet;
    selectedMentions?: string[];
    onMentionsChange?: (mentions: string[]) => void;
  }

  let {
    value = $bindable(''),
    placeholder = "What's on your mind?",
    autofocus = false,
    disabled = false,
    class: className = '',
    relayButton,
    selectedMentions = $bindable([]),
    onMentionsChange
  }: Props = $props();

  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);

  let textareaElement: HTMLTextAreaElement;
  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let uploadedImages = $state<Array<{ url: string; preview: string }>>([]);
  let isUploading = $state(false);

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Add to images array with preview
    const imageIndex = uploadedImages.length;
    uploadedImages = [...uploadedImages, { url: '', preview: previewUrl }];

    isUploading = true;
    try {
      await upload.upload(file, {
        fallbackServer: 'https://blossom.primal.net'
      });

      if (upload.result?.url) {
        // Update the image with the actual URL
        uploadedImages[imageIndex] = {
          url: upload.result.url,
          preview: previewUrl
        };

        // Add image URL to content at cursor position
        insertImageUrl(upload.result.url);
        toast.success('Image uploaded');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
      // Remove the failed upload
      uploadedImages = uploadedImages.filter((_, i) => i !== imageIndex);
    } finally {
      isUploading = false;
    }
  }

  function insertImageUrl(url: string) {
    const textarea = textareaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const imageMarkdown = `\n${url}\n`;

    value = value.slice(0, start) + imageMarkdown + value.slice(end);

    // Set cursor position after the inserted URL
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
      textarea.focus();
    }, 0);
  }

  function removeImage(index: number) {
    const image = uploadedImages[index];

    // Remove the URL from the content
    if (image.url) {
      value = value.replace(`\n${image.url}\n`, '').replace(image.url, '');
    }

    // Revoke the preview URL to free memory
    URL.revokeObjectURL(image.preview);

    // Remove from array
    uploadedImages = uploadedImages.filter((_, i) => i !== index);
  }

  function handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so the same file can be selected again
    input.value = '';
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      // Handle multiple files
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          await handleFileSelect(file);
        }
      }
    }
  }

  async function handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleFileSelect(file);
        }
      }
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }
</script>

<div class="relative flex-1 flex flex-col {className}">
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    onchange={handleFileInputChange}
    class="hidden"
  />

  <div
    class="flex-1 flex flex-col {isDragging ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}"
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
  >
    <textarea
      bind:this={textareaElement}
      bind:value={value}
      {placeholder}
      {autofocus}
      {disabled}
      onpaste={handlePaste}
      class="w-full min-h-[120px] max-md:flex-1 max-md:min-h-0 bg-transparent text-foreground placeholder-neutral-500 resize-none focus:outline-none focus:ring-0 text-lg"
    ></textarea>

    <!-- Image previews -->
    {#if uploadedImages.length > 0}
      <div class="flex flex-wrap gap-2 mt-2">
        {#each uploadedImages as image, index (image.preview)}
          <div class="relative group">
            <img
              src={image.preview}
              alt="Upload preview"
              class="w-20 h-20 object-cover rounded-lg border border {image.url ? '' : 'opacity-50 animate-pulse'}"
            />
            {#if !image.url}
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            {:else}
              <button
                type="button"
                onclick={() => removeImage(index)}
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                aria-label="Remove image"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Toolbar -->
  <div class="flex items-center gap-2 mt-2 pt-2 border-t border-border">
    {#if relayButton}
      {@render relayButton()}
    {/if}
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onclick={triggerFileInput}
      disabled={disabled || isUploading}
      class="h-8 w-8"
      title="Add image"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </Button>
    <UserSelector
      bind:selectedPubkeys={selectedMentions}
      onSelect={onMentionsChange}
      {disabled}
    />
  </div>
</div>
