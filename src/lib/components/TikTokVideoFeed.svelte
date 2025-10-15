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
    class="h-[calc(100vh-8rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide -mx-4"
  >
    {#each videoItems as { event, imeta }, index (`${event.id}-${index}`)}
      <div class="relative h-full w-full snap-start snap-always flex items-center justify-center bg-black">
        <video
          use:registerVideoRef
          src={imeta.url}
          class="max-h-full w-full object-contain"
          loop
          playsinline
          preload="metadata"
          muted={false}
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

          <!-- Bottom content and actions -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pointer-events-auto">
            <div class="flex items-end gap-4">
              <!-- Content area -->
              <div class="flex-1 min-w-0 mb-2">
                {#if event.content}
                  <p class="text-white text-sm mb-3 line-clamp-3">
                    {event.content.replace(imeta.url, '').trim()}
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
