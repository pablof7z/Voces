<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { getProfileUrl } from '$lib/utils/navigation';

	interface InviterStats {
		pubkey: string;
		totalInvites: number;
		successfulInvites: number;
		rank: number;
	}

	interface Props {
		stats: InviterStats[];
	}

	const { stats }: Props = $props();

	let expanded = $state(false);

	function getRankEmoji(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return '';
	}

	const top3 = $derived(stats.slice(0, 3));
	const remaining = $derived(stats.slice(3, 10));
	const maxSuccess = $derived(Math.max(...stats.map(s => s.successfulInvites), 1));
</script>

<div>
	<h2 class="text-xl font-bold text-foreground mb-6">🏆 Top Inviters</h2>

	{#if stats.length === 0}
		<p class="text-muted-foreground text-center py-8">No invites yet in this Agora</p>
	{:else}
		<!-- Top 3 Podium - Horizontal Portrait Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
			{#each top3 as stat (stat.pubkey)}
				{@const profile = ndk.$fetchProfile(() => stat.pubkey)}
				<a
					href={getProfileUrl(stat.pubkey)}
					class="relative bg-gradient-to-b from-primary/5 to-transparent border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
				>
					<!-- Rank Badge -->
					<div class="absolute -top-3 left-1/2 -translate-x-1/2">
						<div class="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center text-2xl group-hover:border-primary transition-colors">
							{getRankEmoji(stat.rank)}
						</div>
					</div>

					<!-- Avatar -->
					<div class="flex justify-center mt-6 mb-4">
						<Avatar {ndk} pubkey={stat.pubkey} class="w-24 h-24 rounded-full ring-4 ring-primary/20" />
					</div>

					<!-- Name -->
					<div class="text-center mb-4">
						<h3 class="font-bold text-lg text-foreground truncate mb-1">
							{profile?.displayName || profile?.name || 'Anonymous'}
						</h3>
						{#if profile?.nip05}
							<p class="text-xs text-muted-foreground truncate">
								{profile.nip05}
							</p>
						{/if}
					</div>

					<!-- Stats -->
					<div class="bg-muted/50 rounded-lg p-3">
						<div class="text-center">
							<div class="text-3xl font-bold text-primary mb-1">{stat.successfulInvites}</div>
							<div class="text-xs text-muted-foreground">{stat.successfulInvites === 1 ? 'person joined' : 'people joined'}</div>
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="mt-3">
						<div class="h-1.5 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
								style="width: {Math.min(100, (stat.successfulInvites / maxSuccess) * 100)}%"
							></div>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Expand/Collapse Button -->
		{#if stats.length > 3}
			<button
				onclick={() => expanded = !expanded}
				class="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
			>
				<span>{expanded ? 'Show Less' : `View Top ${stats.length} Inviters`}</span>
				<svg
					class="w-4 h-4 transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		{/if}

		<!-- Expanded Rankings (4-10) -->
		{#if expanded && remaining.length > 0}
			<div class="mt-4 space-y-2 border-t border-border pt-4">
				{#each remaining as stat (stat.pubkey)}
					{@const profile = ndk.$fetchProfile(() => stat.pubkey)}
					<a
						href={getProfileUrl(stat.pubkey)}
						class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
					>
						<div class="flex items-center gap-3 flex-1">
							<span class="text-lg font-semibold text-muted-foreground w-8">{stat.rank}.</span>

							<Avatar {ndk} pubkey={stat.pubkey} class="w-10 h-10 rounded-full" />

							<div class="flex-1 min-w-0">
								<div class="font-medium text-foreground truncate">
									{profile?.displayName || profile?.name || 'Anonymous'}
								</div>
								<div class="text-sm text-muted-foreground">
									{stat.successfulInvites} {stat.successfulInvites === 1 ? 'person joined' : 'people joined'}
								</div>
							</div>
						</div>

						<!-- Progress Bar -->
						<div class="hidden md:block w-32">
							<div class="h-2 bg-muted rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
									style="width: {Math.min(100, (stat.successfulInvites / maxSuccess) * 100)}%"
								></div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	{/if}
</div>
