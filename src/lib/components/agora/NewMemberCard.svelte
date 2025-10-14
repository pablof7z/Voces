<script lang="ts">
	import type { NDKUser } from '@nostr-dev-kit/ndk';
	import { ndk } from '$lib/ndk.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import FollowButton from '../FollowButton.svelte';
	import { formatTimeAgo } from '$lib/utils/formatTime';

	interface Props {
		memberPubkey: string;
		inviterPubkey: string | null;
		joinedAt: number;
	}

	let { memberPubkey, inviterPubkey, joinedAt }: Props = $props();

	const memberProfile = ndk.$fetchProfile(() => memberPubkey);
	const inviterProfile = $derived(inviterPubkey ? ndk.$fetchProfile(() => inviterPubkey) : null);
	const memberUser = $derived.by(() => {
		const user = ndk.getUser({ pubkey: memberPubkey });
		if (memberProfile) {
			user.profile = memberProfile;
		}
		return user;
	});
</script>

<div class="flex items-start gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
	<Avatar {ndk} pubkey={memberPubkey} class="w-12 h-12 rounded-full" />

	<div class="flex-1 min-w-0">
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1 min-w-0">
				<a href="/p/{memberUser.npub}" class="block group">
					<h4 class="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
						{memberProfile?.displayName || memberProfile?.name || 'Anon'}
					</h4>
					{#if memberProfile?.nip05}
						<p class="text-sm text-muted-foreground truncate">
							{memberProfile.nip05}
						</p>
					{/if}
				</a>

				<div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
					<span>Joined {formatTimeAgo(joinedAt)}</span>
					{#if inviterPubkey && inviterProfile}
						<span>•</span>
						<span>
							Invited by
							<a href="/p/{ndk.getUser({ pubkey: inviterPubkey }).npub}" class="text-primary hover:underline">
								{inviterProfile.displayName || inviterProfile.name || 'someone'}
							</a>
						</span>
					{/if}
				</div>

				{#if memberProfile?.about}
					<p class="mt-2 text-sm text-foreground/80 line-clamp-2">
						{memberProfile.about}
					</p>
				{/if}
			</div>

			<div class="flex-shrink-0">
				<FollowButton pubkey={memberPubkey} />
			</div>
		</div>
	</div>
</div>