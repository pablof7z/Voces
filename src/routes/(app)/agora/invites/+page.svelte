<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { createInviteModal } from '$lib/stores/createInviteModal.svelte';
	import { isAgoraRelay } from '$lib/utils/relayUtils';
	import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
	import TopInvitersPodium from '$lib/components/agora/TopInvitersPodium.svelte';
	import IntroductionCard from '$lib/components/agora/IntroductionCard.svelte';
	import NewMemberCard from '$lib/components/agora/NewMemberCard.svelte';
	import CreateInviteModal from '$lib/components/invite/CreateInviteModal.svelte';

	const selectedRelay = $derived(settings.selectedRelay);
	const isAgora = $derived(selectedRelay ? isAgoraRelay(selectedRelay) : false);

	// Subscribe to kind 514 (redemption events) - these have all the info we need
	const redemptionsSubscription = $derived.by(() => {
		if (!selectedRelay || !isAgora) return null;
		return ndk.$subscribe(() => ({
			filters: [{ kinds: [514] }],
			relayUrls: [selectedRelay],
			subId: 'invite-redemptions',
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
			closeOnEose: true
		}));
	});

	// Subscribe to introduction posts
	const introductionsSubscription = $derived.by(() => {
		if (!selectedRelay || !isAgora) return null;
		return ndk.$subscribe(() => ({
			filters: [{ kinds: [1], '#t': ['introduction'], limit: 20 }],
			relayUrls: [selectedRelay],
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
			closeOnEose: true
		}));
	});

	// Calculate inviter stats from redemptions
	const inviterStats = $derived.by(() => {
		if (!redemptionsSubscription) return [];

		const redemptions = redemptionsSubscription.events;

		// Count successful invites by inviter (from p tags)
		const inviteCountByInviter = new Map<string, number>();
		for (const redemption of redemptions) {
			const inviterTag = redemption.tags.find(tag => tag[0] === 'p');
			if (inviterTag?.[1]) {
				const inviterPubkey = inviterTag[1];
				inviteCountByInviter.set(inviterPubkey, (inviteCountByInviter.get(inviterPubkey) || 0) + 1);
			}
		}

		// Build stats array
		const stats = Array.from(inviteCountByInviter.entries()).map(([pubkey, count]) => ({
			pubkey,
			totalInvites: count,
			successfulInvites: count,
			rank: 0
		}));

		// Sort by count
		stats.sort((a, b) => b.successfulInvites - a.successfulInvites);
		stats.forEach((stat, index) => { stat.rank = index + 1; });

		return stats.slice(0, 10);
	});

	// Map introductions with inviter info
	const introductions = $derived.by(() => {
		if (!introductionsSubscription || !redemptionsSubscription) return [];

		const intros = introductionsSubscription.events;
		const redemptions = redemptionsSubscription.events;

		// Map new member -> inviter (from p tag in redemption)
		const memberToInviter = new Map<string, string>();
		for (const redemption of redemptions) {
			const inviterTag = redemption.tags.find(tag => tag[0] === 'p');
			if (inviterTag && inviterTag[1]) {
				memberToInviter.set(redemption.pubkey, inviterTag[1]);
			}
		}

		return intros
			.map(event => ({
				event,
				invitedBy: memberToInviter.get(event.pubkey) || null
			}))
			.sort((a, b) => (b.event.created_at || 0) - (a.event.created_at || 0))
			.slice(0, 10);
	});

	// Extract new members from redemption events
	const newMembers = $derived.by(() => {
		if (!redemptionsSubscription) return [];

		const redemptions = redemptionsSubscription.events;

		return redemptions
			.map(redemption => {
				const inviterTag = redemption.tags.find(tag => tag[0] === 'p');
				return {
					memberPubkey: redemption.pubkey,
					inviterPubkey: inviterTag?.[1] || null,
					joinedAt: redemption.created_at || 0
				};
			})
			.sort((a, b) => b.joinedAt - a.joinedAt)
			.slice(0, 20);
	});
</script>

{#if !isAgora}
	<div class="min-h-screen flex items-center justify-center p-4">
		<div class="text-center">
			<svg class="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<h2 class="text-xl font-semibold text-foreground mb-2">Select an Agora</h2>
			<p class="text-muted-foreground">This page shows community invites for a specific Agora</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-background">
		<!-- Header -->
		<div class="border-b border-border bg-card sticky top-0 z-10">
			<div class="px-4 py-4">
				<h1 class="text-2xl font-bold text-foreground">🏆 Agora Invites</h1>
				<p class="text-sm text-muted-foreground mt-1">Community growth and new members</p>
			</div>
		</div>

		<div class="max-w-4xl mx-auto p-4 space-y-6">
			<!-- Top Inviters Podium -->
			<TopInvitersPodium stats={inviterStats} />

			<!-- New Members Section -->
			<div class="bg-card rounded-xl border border-border p-6">
				<h2 class="text-xl font-bold text-foreground mb-4">👋 New Members</h2>

				{#if newMembers.length === 0}
					<p class="text-muted-foreground text-center py-8">No new members yet</p>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each newMembers.slice(0, 6) as member}
							<NewMemberCard
								memberPubkey={member.memberPubkey}
								inviterPubkey={member.inviterPubkey}
								joinedAt={member.joinedAt}
							/>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Introductions Feed -->
			<div class="bg-card rounded-xl border border-border p-6">
				<h2 class="text-xl font-bold text-foreground mb-4">💬 Introductions</h2>

				{#if introductions.length === 0}
					<p class="text-muted-foreground text-center py-8">No introductions yet</p>
				{:else}
					<div class="space-y-4">
						{#each introductions as intro (intro.event.id)}
							<IntroductionCard event={intro.event} invitedBy={intro.invitedBy} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<CreateInviteModal
		bind:isOpen={createInviteModal.show}
		onClose={() => createInviteModal.close()}
	/>
{/if}
