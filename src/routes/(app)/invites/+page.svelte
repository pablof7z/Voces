<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import NDK, { NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';
	import { formatTimeAgo } from '$lib/utils/formatTime';
	import { AGORA_RELAYS } from '$lib/utils/relayUtils';

	let invites = $state<NDKEvent[]>([]);
	let copiedId = $state<string | null>(null);

	let currentUserPubkey = $derived(ndk.$currentUser?.pubkey);

	$effect(() => {
		if (!currentUserPubkey) {
			invites = [];
			return;
		}

		loadInvites(currentUserPubkey);
	});

	async function loadInvites(pubkey: string) {
		try {
			const filter: NDKFilter = {
				kinds: [513],
				authors: [pubkey]
			};

			const events = await (ndk as NDK).fetchEvents(filter, {
				relayUrls: [...AGORA_RELAYS],
			});
			invites = Array.from(events).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
		} catch (error) {
			console.error('Failed to load invites:', error);
		}
	}

	function getInviteLink(event: NDKEvent): string {
		const dTag = event.tags.find(tag => tag[0] === 'd')?.[1];
		if (!dTag) return '';

		return `${window.location.origin}/i/${dTag}`;
	}

	function getInviteData(event: NDKEvent): { welcomeMessage?: string; recipientName?: string; isPersonalized: boolean } {
		try {
			const content = JSON.parse(event.content);
			return {
				welcomeMessage: content.welcomeMessage,
				recipientName: content.recipientName,
				isPersonalized: !!content.recipientName
			};
		} catch {
			return { isPersonalized: false };
		}
	}

	async function copyToClipboard(link: string, eventId: string) {
		try {
			await navigator.clipboard.writeText(link);
			copiedId = eventId;
			setTimeout(() => (copiedId = null), 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	async function deleteInvite(event: NDKEvent) {
		if (!confirm('Are you sure you want to delete this invite?')) {
			return;
		}

		try {
			await event.delete();

			invites = invites.filter(inv => inv.id !== event.id);
		} catch (error) {
			console.error('Failed to delete invite:', error);
			alert('Failed to delete invite. Check console for details.');
		}
	}
</script>

<div class="min-h-screen bg-neutral-50 dark:bg-black">
	<div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-neutral-900 dark:text-white mb-2">My Invites</h1>
			<p class="text-neutral-600 dark:text-neutral-400">
				View and manage invites you've sent to join Agora
			</p>
		</div>

		{#if invites.length === 0}
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
					No invites yet
				</h3>
				<p class="text-sm text-neutral-600 dark:text-neutral-400">
					Create your first invite to start sharing Agora with others
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each invites as invite (invite.id)}
					{@const inviteData = getInviteData(invite)}
					{@const inviteLink = getInviteLink(invite)}
					<div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
						<div class="flex items-start justify-between mb-4">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-2">
									{#if inviteData.isPersonalized}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400">
											<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
											</svg>
											Personalized
										</span>
									{:else}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-400">
											General Invite
										</span>
									{/if}
								</div>
								{#if inviteData.recipientName}
									<h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
										For {inviteData.recipientName}
									</h3>
								{/if}
								<p class="text-sm text-neutral-500 dark:text-neutral-400">
									Created {formatTimeAgo(invite.created_at || 0)}
								</p>
							</div>
							<button
								onclick={() => deleteInvite(invite)}
								class="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
								title="Delete invite"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>

						{#if inviteData.welcomeMessage}
							<div class="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
								<p class="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap line-clamp-3">
									{inviteData.welcomeMessage}
								</p>
							</div>
						{/if}

						<div class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 flex items-center space-x-2">
							<input
								type="text"
								value={inviteLink}
								readonly
								class="flex-1 bg-transparent text-sm text-neutral-700 dark:text-neutral-300 outline-none truncate"
							/>
							<button
								onclick={() => copyToClipboard(inviteLink, invite.id)}
								class="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-1 text-sm flex-shrink-0"
							>
								{#if copiedId === invite.id}
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									<span>Copied!</span>
								{:else}
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
									<span>Copy</span>
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
