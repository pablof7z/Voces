<script lang="ts">
  import type { NDKEvent, NDKImetaTag } from '@nostr-dev-kit/ndk';
  import { mapImetaTag } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/ndk.svelte';
  import EventActions from './EventActions.svelte';

  interface Props {
    events: NDKEvent[];
  }

  const { events }: Props = $props();

  interface VideoItem {
    event: NDKEvent;
    imeta: NDKImetaTag;
    element?: HTMLVideoElement;
  }

  let containerRef = $state<HTMLDivElement | null>(null);
  let isMuted = $state(true);

  function extractMediaUrls(content: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+\.(mp4|webm|mov|avi|mkv))/gi;
    return content.match(urlRegex) || [];
  }

  function getMediaType(imeta: NDKImetaTag): 'video' | 'other' {
    const mime = imeta.m;
    const url = imeta.url;

    if (mime && mime.startsWith('video/')) return 'video';

    if (url) {
      const ext = url.split('.').pop()?.toLowerCase();
      if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '')) return 'video';
    }

    return 'other';
  }

  const videoItems = $derived<VideoItem[]>(events.flatMap(event => {
    const imetaTags = event.tags.filter(tag => tag[0] === 'imeta');
    const imetas = imetaTags.map(tag => mapImetaTag(tag));

    const imetaItems = imetas
      .filter(imeta => imeta.url && getMediaType(imeta) === 'video')
      .map(imeta => ({ event, imeta }));

    if (imetaItems.length > 0) {
      return imetaItems;
    }

    const contentUrls = extractMediaUrls(event.content);
    return contentUrls.map(url => {
      const ext = url.split('.').pop()?.toLowerCase();
      return {
        event,
        imeta: {
          url,
          m: 'video/' + ext,
        } as NDKImetaTag
      };
    });
  }));

  let observer: IntersectionObserver | null = null;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Play video when more than 50% is visible
            videoElement.play().catch(err => {
              console.log('Auto-play prevented:', err);
            });
          } else {
            // Pause video when not visible
            videoElement.pause();
          }
        });
      },
      {
        root: null,
        threshold: [0.5],
      }
    );

    return () => {
      observer?.disconnect();
    };
  });

  function registerVideoRef(videoElement: HTMLVideoElement) {
    if (observer) {
      observer.observe(videoElement);
    }
    return {
      destroy() {
        if (observer) {
          observer.unobserve(videoElement);
        }
      }
    };
  }
</script>

{#if videoItems.length === 0}
  <div class="flex items-center justify-center h-[calc(100vh-12rem)] text-muted-foreground">
    No videos found
  </div>
{:else}
  <div
    bind:this={containerRef}
    class="fixed inset-x-0 bottom-0 overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
    style="top: var(--header-height, 132px);"
  >
    {#each videoItems as { event, imeta }, index (`${event.id}-${index}`)}
      <div class="relative w-screen snap-start snap-always flex items-center justify-center bg-black" style="height: calc(100dvh - var(--header-height, 132px));">
        <video
          use:registerVideoRef
          src={imeta.url}
          class="w-full h-full object-contain"
          loop
          playsinline
          preload="auto"
          muted={isMuted}
        >
          <track kind="captions" />
        </video>

        <!-- Video Overlay UI -->
        <div class="absolute inset-0 pointer-events-none">
          <!-- Top gradient with author info -->
          <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-4 pointer-events-auto">
            <div class="flex items-center gap-3">
              <Avatar {ndk} pubkey={event.pubkey} class="w-10 h-10 rounded-full border-2 border-white" />
              <div class="flex-1 min-w-0">
                <div class="text-white font-semibold text-sm truncate">
                  {event.author?.profile?.name || event.author?.npub?.substring(0, 8)}
                </div>
              </div>
            </div>
          </div>

          <!-- Mute/Unmute button (right side, middle) -->
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              onclick={() => isMuted = !isMuted}
              class="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              type="button"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {#if isMuted}
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              {:else}
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              {/if}
            </button>
          </div>

          <!-- Bottom content and actions -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pointer-events-auto">
            <div class="flex items-end gap-4">
              <!-- Content area -->
              <div class="flex-1 min-w-0 mb-2">
                {#if event.content}
                  <p class="text-white text-sm mb-3 line-clamp-3">
                    {event.content.replace(imeta.url || '', '').trim()}
                  </p>
                {/if}
              </div>

              <!-- Action buttons -->
              <div class="flex flex-col items-center gap-4 pb-2">
                <EventActions {event} variant="tiktok" />
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
