<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import FollowButton from './FollowButton.svelte';
	import { formatTimeAgo } from '$lib/utils/formatTime';

	interface Props {
		pubkey: string;
		showFollow?: boolean;
		showAbout?: boolean;
		joinedAt?: number;
		inviterPubkey?: string | null;
		clickable?: boolean;
		class?: string;
	}

	let {
		pubkey,
		showFollow = true,
		showAbout = true,
		joinedAt,
		inviterPubkey,
		clickable = true,
		class: className = ''
	}: Props = $props();

	const profile = ndk.$fetchProfile(() => pubkey);
	const inviterProfile = $derived(inviterPubkey ? ndk.$fetchProfile(() => inviterPubkey) : null);
	const user = $derived.by(() => {
		const u = ndk.getUser({ pubkey });
		if (profile) {
			u.profile = profile;
		}
		return u;
	});
</script>

<div class="flex items-start gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors {className}">
	<Avatar {ndk} {pubkey} class="w-12 h-12 rounded-full" />

	<div class="flex-1 min-w-0">
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1 min-w-0">
				{#if clickable}
					<a href="/p/{user.npub}" class="block group">
						<h4 class="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
							{profile?.displayName || profile?.name || 'Anon'}
						</h4>
						{#if profile?.nip05}
							<p class="text-sm text-muted-foreground truncate">
								{profile.nip05}
							</p>
						{/if}
					</a>
				{:else}
					<h4 class="font-semibold text-foreground truncate">
						{profile?.displayName || profile?.name || 'Anon'}
					</h4>
					{#if profile?.nip05}
						<p class="text-sm text-muted-foreground truncate">
							{profile.nip05}
						</p>
					{/if}
				{/if}

				{#if joinedAt || inviterPubkey}
					<div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
						{#if joinedAt}
							<span>Joined {formatTimeAgo(joinedAt)}</span>
						{/if}
						{#if inviterPubkey && inviterProfile}
							{#if joinedAt}
								<span>•</span>
							{/if}
							<span>
								Invited by
								<a href="/p/{ndk.getUser({ pubkey: inviterPubkey }).npub}" class="text-primary hover:underline">
									{inviterProfile.displayName || inviterProfile.name || 'someone'}
								</a>
							</span>
						{/if}
					</div>
				{/if}

				{#if showAbout && profile?.about}
					<p class="mt-2 text-sm text-foreground/80 line-clamp-2">
						{profile.about}
					</p>
				{/if}
			</div>

			{#if showFollow}
				<div class="flex-shrink-0">
					<FollowButton {pubkey} iconOnly={true} />
				</div>
			{/if}
		</div>
	</div>
</div>
