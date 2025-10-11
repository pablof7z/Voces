<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { ndk } from '$lib/ndk.svelte';
	import { decryptInvitePayload } from '$lib/utils/inviteEncryption';
	import { Avatar } from '@nostr-dev-kit/svelte';

	const code = $derived($page.params.code);

	const inviterProfile = $derived.by(() => {
		if (!inviteData?.inviter) return null;
		return ndk.$fetchProfile(() => inviteData.inviter);
	});

	let inviteData = $state<{
		welcomeMessage?: string;
		recipientName?: string;
		cashuToken?: string;
		inviter?: string;
		inviteEventId?: string;
		inviteRelay?: string;
	} | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		async function loadInvite() {
			try {
				if (!code) {
					throw new Error('Invalid invite code');
				}

				// Parse code: first 12 chars = d-tag, rest (if any) = encryption key
				const dTag = code.slice(0, 12);
				const encryptionKey = code.length > 12 ? code.slice(12) : null;

				console.log('Loading invite:', { dTag, hasKey: !!encryptionKey });

				// Fetch the invite event (kind 513 with d-tag) from all relays
				const filter = {
					kinds: [513],
					'#d': [dTag]
				};

				const events = await ndk.fetchEvents(filter, {
					relayUrls: [
						"wss://ve.agorawlc.com",
						"wss://ni.agorawlc.com",
					],
				});

				if (events.size === 0) {
					throw new Error('Invite not found');
				}

				const inviteEvent = Array.from(events)[0];
				console.log('Found invite event:', inviteEvent.id);

				// Get the relay where the event was found
				const relayUrl = inviteEvent.relay?.url || Array.from(inviteEvent.onRelays)[0]?.url;
				console.log('Invite found on relay:', relayUrl);

				// Decrypt or parse content
				let payload;
				if (encryptionKey) {
					const decrypted = await decryptInvitePayload(inviteEvent.content, encryptionKey);
					payload = JSON.parse(decrypted);
				} else {
					payload = JSON.parse(inviteEvent.content);
				}

				// Add invite event metadata to payload
				inviteData = {
					...payload,
					inviteEventId: inviteEvent.id,
					inviteRelay: relayUrl
				};
				console.log('Invite data loaded:', inviteData);
			} catch (err) {
				console.error('Failed to load invite:', err);
				error = err instanceof Error ? err.message : 'Failed to load invite';
			} finally {
				isLoading = false;
			}
		}

		loadInvite();
	});

	function handleStartJourney() {
		// Only pass serializable data
		const serializableInviteData = {
			welcomeMessage: inviteData?.welcomeMessage,
			recipientName: inviteData?.recipientName,
			cashuToken: inviteData?.cashuToken,
			inviter: inviteData?.inviter,
			inviteEventId: inviteData?.inviteEventId,
			inviteRelay: inviteData?.inviteRelay
		};
		goto('/onboarding', {
			state: {
				inviteCode: code,
				inviteData: serializableInviteData
			}
		});
	}

	function handleSignIn() {
		goto('/');
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
	<div class="w-full max-w-xl">
		{#if isLoading}
			<!-- Loading State -->
			<div class="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden p-8">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
					<p class="text-neutral-600 dark:text-neutral-400">Loading invite...</p>
				</div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden p-8">
				<div class="text-center">
					<div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
						<svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</div>
					<h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">Invite Not Found</h2>
					<p class="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
					<button
						onclick={() => goto('/')}
						class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
					>
						Go Home
					</button>
				</div>
			</div>
		{:else}
			<!-- Main Card -->
			<div class="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden">
			<!-- Hero Banner -->
			<div class="h-32 bg-gradient-to-br from-orange-600 via-red-500 to-red-600" />

			<!-- Content Container -->
			<div class="px-8 pb-8 pt-12">
				<!-- Inviter Profile -->
				{#if inviteData?.inviter}
					<div class="flex flex-col items-center mb-8 -mt-20">
						<div class="relative mb-4">
							<div class="w-24 h-24 rounded-full ring-4 ring-white dark:ring-neutral-900 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
								<Avatar {ndk} pubkey={inviteData.inviter} class="w-full h-full" />
							</div>
						</div>
						<div class="text-center">
							<h2 class="text-xl font-bold text-neutral-900 dark:text-white">
								{inviterProfile?.displayName || inviterProfile?.name || 'Someone'}
							</h2>
							<p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">invited you to join Agora</p>
						</div>
					</div>
				{/if}

				<!-- Welcome Message -->
				{#if inviteData?.welcomeMessage}
					<div class="mb-8 p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
						<p class="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
							{inviteData.welcomeMessage}
						</p>
					</div>
				{/if}

				<!-- Title Section -->
				<div class="text-center mb-8">
					<h1 class="text-3xl font-bold mb-3 text-neutral-900 dark:text-white">
						Your Voice Matters
					</h1>
					<p class="text-neutral-600 dark:text-neutral-400">
						Join a global community where every story counts
					</p>
				</div>

				<!-- Feature Points -->
				<div class="space-y-5 mb-10">
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
							<svg class="w-6 h-6 text-orange-600 dark:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="flex-1">
							<h3 class="font-semibold text-lg mb-1 text-neutral-900 dark:text-white">
								Own Your Voice
							</h3>
							<p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
								No censorship. No gatekeepers. Your content, your control, forever.
							</p>
						</div>
					</div>

					<div class="flex items-start gap-4">
						<div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
							<svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<div class="flex-1">
							<h3 class="font-semibold text-lg mb-1 text-neutral-900 dark:text-white">
								Earn From Your Stories
							</h3>
							<p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
								Get paid instantly in Bitcoin for valuable content. No banks, no fees.
							</p>
						</div>
					</div>

					<div class="flex items-start gap-4">
						<div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
							<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<div class="flex-1">
							<h3 class="font-semibold text-lg mb-1 text-neutral-900 dark:text-white">
								Connect With Your Community
							</h3>
							<p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
								Trade, share, and build with people who understand your journey.
							</p>
						</div>
					</div>
				</div>

				<!-- CTA Buttons -->
				<div class="space-y-4">
					<button
						onclick={handleStartJourney}
						class="w-full py-6 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl rounded-xl flex items-center justify-center gap-2"
					>
						Start Your Journey
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</button>

					<button
						onclick={handleSignIn}
						class="w-full text-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors py-2"
					>
						Already have a Nostr account?{' '}
						<span class="font-semibold underline">Sign in here</span>
					</button>
				</div>

				<!-- Trust Signals -->
				<div class="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
					<p class="text-xs text-center text-neutral-500">
						Built on Nostr protocol • No personal data required • Leave anytime with your content
					</p>
				</div>
			</div>
		</div>
		{/if}
	</div>
</div>
