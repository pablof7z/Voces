<script lang="ts">
  import type { NDKEvent, NDKImetaTag } from '@nostr-dev-kit/ndk';
  import { mapImetaTag } from '@nostr-dev-kit/ndk';
  import MediaViewerModal from './MediaViewerModal.svelte';

  interface Props {
    events: NDKEvent[];
  }

  const { events }: Props = $props();

  let selectedMedia = $state<{ event: NDKEvent; imeta: NDKImetaTag; mediaType: 'image' | 'video' | 'audio' | 'file' } | null>(null);

  function openMediaViewer(event: NDKEvent, imeta: NDKImetaTag, mediaType: 'image' | 'video' | 'audio' | 'file') {
    selectedMedia = { event, imeta, mediaType };
  }

  function closeMediaViewer() {
    selectedMedia = null;
  }

  function extractMediaUrls(content: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|webm|mov|avi|mkv))/gi;
    return content.match(urlRegex) || [];
  }

  function getMediaType(imeta: NDKImetaTag): 'image' | 'video' | 'audio' | 'file' {
    const mime = imeta.m;
    const url = imeta.url;

    if (mime) {
      if (mime.startsWith('image/')) return 'image';
      if (mime.startsWith('video/')) return 'video';
      if (mime.startsWith('audio/')) return 'audio';
    } else if (url) {
      const ext = url.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext || '')) return 'image';
      if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '')) return 'video';
      if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext || '')) return 'audio';
    }

    return 'file';
  }

  const mediaItems = $derived(events.flatMap(event => {
    const imetaTags = event.tags.filter(tag => tag[0] === 'imeta');
    const imetas = imetaTags.map(tag => mapImetaTag(tag));

    const imetaItems = imetas
      .filter(imeta => imeta.url)
      .map(imeta => ({ event, imeta }));

    if (imetaItems.length > 0) {
      return imetaItems;
    }

    const contentUrls = extractMediaUrls(event.content);
    return contentUrls.map(url => {
      const ext = url.split('.').pop()?.toLowerCase();
      const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '');

      return {
        event,
        imeta: {
          url,
          m: isVideo ? 'video/' + ext : 'image/' + ext,
        } as NDKImetaTag
      };
    });
  }));
</script>

{#if mediaItems.length === 0}
  <div class="text-center py-8 text-neutral-400">
    No media uploaded yet
  </div>
{:else}
  <div class="grid grid-cols-3 gap-1">
    {#each mediaItems as { event, imeta }, index (`${event.id}-${index}`)}
      {@const mediaType = getMediaType(imeta)}
      {@const fileSize = imeta.size ? (parseInt(imeta.size) / (1024 * 1024)).toFixed(1) : null}

      <button
        type="button"
        onclick={() => openMediaViewer(event, imeta, mediaType)}
        class="group relative aspect-square overflow-hidden bg-black cursor-pointer w-full"
      >
        {#if mediaType === 'image'}
          <img
            src={imeta.url}
            alt={imeta.alt || event.content || 'Image'}
            class="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        {:else if mediaType === 'video'}
          <div class="relative w-full h-full bg-black flex items-center justify-center">
            <video
              src={imeta.url}
              class="max-w-full max-h-full"
              preload="metadata"
            >
              <track kind="captions" />
            </video>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-neutral-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        {:else if mediaType === 'audio'}
          <div class="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        {:else}
          <div class="w-full h-full bg-black flex flex-col items-center justify-center gap-2">
            <svg class="w-16 h-16 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {#if imeta.url}
              <span class="text-xs text-neutral-400 px-2 text-center">
                {imeta.url.split('/').pop()?.substring(0, 20)}...
              </span>
            {/if}
          </div>
        {/if}

        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {#if event.content}
            <p class="text-white text-sm line-clamp-2 mb-1">
              {event.content.trim()}
            </p>
          {/if}
          <div class="flex items-center gap-2 text-white/80 text-xs">
            {#if fileSize}
              <span>{fileSize} MB</span>
            {/if}
            {#if imeta.dim}
              <span>{imeta.dim}</span>
            {/if}
          </div>
        </div>

        {#if mediaType !== 'image'}
          <div class="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
            {#if mediaType === 'video'}Video{/if}
            {#if mediaType === 'audio'}Audio{/if}
            {#if mediaType === 'file'}File{/if}
          </div>
        {/if}
      </button>
    {/each}
  </div>
{/if}

{#if selectedMedia}
  <MediaViewerModal
    open={true}
    event={selectedMedia.event}
    imeta={selectedMedia.imeta}
    mediaType={selectedMedia.mediaType}
    onClose={closeMediaViewer}
  />
{/if}
