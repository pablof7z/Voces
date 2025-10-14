<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';

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

	function getRankEmoji(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return '';
	}

	const maxSuccess = $derived(Math.max(...stats.map(s => s.successfulInvites), 1));
</script>

<div class="bg-card rounded-xl border border-border p-6">
	<h2 class="text-xl font-bold text-foreground mb-4">Top Inviters</h2>

	{#if stats.length === 0}
		<p class="text-muted-foreground text-center py-8">No invites yet in this Agora</p>
	{:else}
		<div class="space-y-3">
			{#each stats as stat (stat.pubkey)}
				{@const profile = ndk.$fetchProfile(() => stat.pubkey)}
				<div class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
					<div class="flex items-center gap-3 flex-1">
						<span class="text-2xl w-8 text-center">{getRankEmoji(stat.rank)}</span>
						<span class="text-lg font-semibold text-muted-foreground w-8">{stat.rank}.</span>

						<Avatar {ndk} pubkey={stat.pubkey} class="w-10 h-10 rounded-full" />

						<div class="flex-1 min-w-0">
							<div class="font-medium text-foreground truncate">
								{profile?.displayName || profile?.name || 'Anonymous'}
							</div>
							<div class="text-sm text-muted-foreground">
								{stat.totalInvites} {stat.totalInvites === 1 ? 'invite' : 'invites'} · {stat.successfulInvites} joined
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
				</div>
			{/each}
		</div>
	{/if}
</div>
