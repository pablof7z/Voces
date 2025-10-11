<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { NDKKind, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';

  // Only show when a specific relay is selected
  const shouldShow = $derived(!!settings.selectedRelay);

  // Subscribe to kind 514 events (community join events) from the selected relay
  const newMembersSubscription = $derived.by(() => {
    if (!settings.selectedRelay) return null;

    return ndk.$subscribe(() => ({
      filters: [{
        kinds: [514],
        limit: 10
      }],
      relayUrls: [settings.selectedRelay!],
      cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
      subId: 'new-members-514'
    }));
  });

  // Get events and extract member info
  const newMembers = $derived.by(() => {
    if (!newMembersSubscription) return [];

    const events = newMembersSubscription.events;

    // Map events to member data
    const members = events
      .map(event => {
        // Find the p-tag that contains the inviter's pubkey
        const inviterTag = event.tags.find(tag => tag[0] === 'p');
        const inviterPubkey = inviterTag ? inviterTag[1] : null;

        return {
          pubkey: event.pubkey,
          inviterPubkey,
          timestamp: event.created_at || 0
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5); // Show only the 5 most recent

    return members;
  });

  // Fetch profiles for each member
  function getMemberProfile(pubkey: string) {
    return ndk.$fetchProfile(() => pubkey);
  }

  function getInviterProfile(pubkey: string | null) {
    if (!pubkey) return null;
    return ndk.$fetchProfile(() => pubkey);
  }
</script>

{#if shouldShow && newMembers.length > 0}
  <div class="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      <h2 class="text-lg font-semibold text-white">New Members</h2>
    </div>
    <div class="space-y-3">
      {#each newMembers as member (member.pubkey)}
        {@const memberProfile = getMemberProfile(member.pubkey)}
        {@const inviterProfile = getInviterProfile(member.inviterPubkey)}
        <div class="flex items-center gap-3">
          <a href="/p/{member.pubkey}" class="flex-shrink-0">
            <Avatar {ndk} pubkey={member.pubkey} class="w-10 h-10 rounded-full" />
          </a>
          <div class="flex-1 min-w-0">
            <a href="/p/{member.pubkey}" class="block">
              <p class="text-sm font-medium text-white truncate">
                {memberProfile?.displayName || memberProfile?.name || 'Anonymous'}
              </p>
            </a>
            {#if member.inviterPubkey && inviterProfile}
              <div class="text-xs text-neutral-500 truncate">
                Invited by
                <a href="/p/{member.inviterPubkey}" class="text-orange-500 hover:underline">
                  {inviterProfile?.displayName || inviterProfile?.name || 'Anonymous'}
                </a>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
