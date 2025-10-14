<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { formatTimeAgo } from '$lib/utils/formatTime';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';

	interface Props {
		event: NDKEvent;
		invitedBy: string | null;
	}

	const { event, invitedBy }: Props = $props();

	const profile = $derived(ndk.$fetchProfile(() => event.pubkey));
	const inviterProfile = $derived(invitedBy ? ndk.$fetchProfile(() => invitedBy) : null);
	const replyCount = $derived(event.tags.filter(t => t[0] === 'e').length || 0);
</script>

<div class="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
	<!-- Author Header -->
	<div class="flex items-center gap-3 mb-3">
		<Avatar {ndk} pubkey={event.pubkey} class="w-12 h-12 rounded-full" />
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<span class="text-lg">👋</span>
				<span class="font-semibold text-foreground">
					{profile?.displayName || profile?.name || 'Anonymous'}
				</span>
			</div>
			<div class="text-sm text-muted-foreground">
				{formatTimeAgo(event.created_at || 0)}
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="mb-3 text-foreground whitespace-pre-wrap line-clamp-4">
		{event.content}
	</div>

	<!-- Footer -->
	<div class="flex items-center justify-between text-sm">
		{#if invitedBy && inviterProfile}
			<div class="text-muted-foreground">
				Invited by <span class="font-medium text-primary">@{inviterProfile.name || 'anonymous'}</span>
			</div>
		{:else}
			<div></div>
		{/if}

		<div class="flex items-center gap-4 text-muted-foreground">
			<span class="flex items-center gap-1">
				💬 {replyCount}
			</span>
		</div>
	</div>
</div>
