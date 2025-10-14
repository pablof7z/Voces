<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
  import NewMemberCard from './agora/NewMemberCard.svelte';

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
      relayUrls: [settings.selectedRelay],
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
        const inviterPubkey = event.tagValue('p');

        return {
          memberPubkey: event.pubkey,
          inviterPubkey,
          joinedAt: event.created_at || 0
        };
      })
      .sort((a, b) => b.joinedAt - a.joinedAt)
      .slice(0, 5); // Show only the 5 most recent

    return members;
  });
</script>

{#if shouldShow && newMembers.length > 0}
  <div class="p-4 bg-card rounded-lg border border-border">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      <h2 class="text-lg font-semibold text-card-foreground">New Members</h2>
    </div>
    <div class="space-y-3">
      {#each newMembers as member (member.memberPubkey)}
        <NewMemberCard
          memberPubkey={member.memberPubkey}
          inviterPubkey={member.inviterPubkey}
          joinedAt={member.joinedAt}
        />
      {/each}
    </div>
  </div>
{/if}
