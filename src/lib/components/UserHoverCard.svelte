<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { EventContent } from '@nostr-dev-kit/svelte';
  import FollowButton from './FollowButton.svelte';
  import { generateBannerGradient } from '$lib/utils/bannerGradient';

  interface Props {
    pubkey: string;
    isVisible: boolean;
    position: { x: number; y: number };
  }

  const { pubkey, isVisible, position }: Props = $props();

  const profile = ndk.$fetchProfile(() => pubkey);
  const currentUser = ndk.$currentUser;
  const isOwnProfile = $derived(currentUser?.pubkey === pubkey);

  // Subscribe to user's notes to get note count
  const notesSubscription = ndk.$subscribe(
    () => pubkey && isVisible ? ({
      filters: [{ kinds: [1], authors: [pubkey], limit: 100 }],
      bufferMs: 100,
    }) : undefined
  );

  // Subscribe to contact list to get following count
  const contactListSubscription = ndk.$subscribe(
    () => pubkey && isVisible ? ({
      filters: [{ kinds: [3], authors: [pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  const noteCount = $derived.by(() => {
    return notesSubscription.events.filter(e => !e.tags.some(tag => tag[0] === 'e')).length;
  });

  const followingCount = $derived.by(() => {
    const contactList = contactListSubscription.events[0];
    if (!contactList) return 0;
    return contactList.tags.filter(tag => tag[0] === 'p').length;
  });
</script>

{#if isVisible}
  <div
    class="fixed z-50 pointer-events-none animate-in fade-in duration-200"
    style="left: {position.x}px; top: {position.y}px;"
  >
    <div class="relative pointer-events-auto">
      <!-- Main card -->
      <div class="relative w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <!-- Banner section -->
        <div class="relative h-20" style={`background: ${profile?.banner ? 'transparent' : generateBannerGradient(pubkey)}`}>
          {#if profile?.banner}
            <img
              src={profile.banner}
              alt="Banner"
              class="w-full h-full object-cover opacity-80"
            />
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900"></div>
          {/if}
        </div>

        <!-- Profile content -->
        <div class="relative px-5 pb-5 -mt-10">
          <!-- Avatar -->
          <div class="relative inline-block mb-3">
            <Avatar
              {ndk}
              {pubkey}
              class="w-20 h-20 rounded-full border-4 border-foreground shadow-xl"
            />
          </div>

          <!-- Name and username -->
          <div class="mb-3">
            <h3 class="text-base font-semibold text-foreground flex items-center gap-1.5 mb-0.5">
              <span class="truncate">
                {profile?.displayName || profile?.name || 'Anonymous'}
              </span>
              {#if profile?.nip05}
                <svg class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              {/if}
            </h3>
            <p class="text-sm text-muted-foreground truncate">
              {#if profile?.nip05}
                {profile.nip05}
              {:else}
                {pubkey.slice(0, 16)}...
              {/if}
            </p>
          </div>

          <!-- Bio -->
          {#if profile?.about}
            <div class="mb-4">
              <div class="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                <EventContent
                  content={profile.about}
                  class="text-muted-foreground"
                />
              </div>
            </div>
          {/if}

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-4 text-sm border-t border-border pt-3">
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-foreground">{noteCount}</span>
              <span class="text-muted-foreground">notes</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-foreground">{followingCount}</span>
              <span class="text-muted-foreground">following</span>
            </div>
          </div>

          <!-- Follow button -->
          {#if !isOwnProfile}
            <FollowButton {pubkey} />
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-in {
    animation: animate-in 0.2s ease-out;
  }

  .fade-in {
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
