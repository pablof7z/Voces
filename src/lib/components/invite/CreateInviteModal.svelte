<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { NDKEvent, NDKRelaySet, type NDKRelay } from '@nostr-dev-kit/ndk';
	import { settings } from '$lib/stores/settings.svelte';
	import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
	import { clickOutside } from '$lib/utils/clickOutside';
	import { portal } from '$lib/utils/portal.svelte';
	import { isAgoraRelay } from '$lib/utils/relayUtils';
	import {
		generateDTag,
		generateEncryptionKey,
		generateInviteCode,
		encryptInvitePayload
	} from '$lib/utils/inviteEncryption';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen = $bindable(), onClose }: Props = $props();

	const DEFAULT_WELCOME_MESSAGE = `Welcome to Agora! 🎉

I'm inviting you to join Agora, a new kind of social network where you own your identity and content. No algorithms, no ads, just authentic connections.

Looking forward to connecting with you on the open social web!`;

	let welcomeMessage = $state(DEFAULT_WELCOME_MESSAGE);
	let isPersonalized = $state(false);
	let recipientName = $state('');
	let cashuAmount = $state('');
	let maxUses = $state(10);
	let inviteLink = $state('');
	let isGenerating = $state(false);
	let isCopied = $state(false);
	let selectedRelayUrls = $state<string[]>([]);
	let isRelayDropdownOpen = $state(false);

	// Get enabled Agora write relays
	const agoraRelays = $derived(settings.relays.filter(r => r.enabled && r.write && isAgoraRelay(r.url)));

	// Initialize with selected relay if one is set and it's an Agora relay
	$effect(() => {
		if (isOpen && settings.selectedRelay && selectedRelayUrls.length === 0 && isAgoraRelay(settings.selectedRelay)) {
			// Only preselect if the selected relay is also an Agora write relay
			const isAgoraWriteRelay = agoraRelays.some(r => r.url === settings.selectedRelay);
			if (isAgoraWriteRelay) {
				selectedRelayUrls = [settings.selectedRelay];
			}
		}
	});

	function toggleRelay(url: string) {
		if (selectedRelayUrls.includes(url)) {
			selectedRelayUrls = selectedRelayUrls.filter(r => r !== url);
		} else {
			selectedRelayUrls = [...selectedRelayUrls, url];
		}
	}

	const selectedRelayInfo = $derived.by(() => {
		if (selectedRelayUrls.length === 0) return null;
		if (selectedRelayUrls.length === 1) {
			return {
				url: selectedRelayUrls[0],
				info: useRelayInfoCached(selectedRelayUrls[0])
			};
		}
		return null;
	});

	const selectedRelayName = $derived.by(() => {
		if (selectedRelayUrls.length === 0) return 'Select Agora...';
		if (selectedRelayUrls.length === 1) {
			const relayInfo = useRelayInfoCached(selectedRelayUrls[0]);
			return relayInfo.info?.name || selectedRelayUrls[0].replace('wss://', '').replace('ws://', '');
		}
		return `${selectedRelayUrls.length} Agoras selected`;
	});

	async function generateInvite() {
		if (!ndk.$currentUser) {
			console.error("No user logged in");
			return;
		}

		if (selectedRelayUrls.length === 0) {
			alert('Please select at least one Agora to publish the invite to.');
			return;
		}

		isGenerating = true;

		try {
			// Generate d-tag and encryption key
			const dTag = generateDTag();
			const encryptionKey = isPersonalized ? generateEncryptionKey() : '';

			// Generate invite codes (one for each max use)
			const inviteCodes: string[] = [];
			for (let i = 0; i < maxUses; i++) {
				inviteCodes.push(generateInviteCode());
			}

			// Create payload
			const payload = {
				welcomeMessage,
				recipientName: isPersonalized ? recipientName : undefined,
				cashuToken: isPersonalized && cashuAmount ? `cashu:${cashuAmount}` : undefined,
				createdAt: Date.now(),
				inviter: ndk.$currentUser.pubkey,
			};

			// Encrypt payload if personalized, otherwise just JSON
			const content = isPersonalized
				? await encryptInvitePayload(JSON.stringify(payload), encryptionKey)
				: JSON.stringify(payload);

			// Create invite event (kind 513 - Agora Invite)
			const inviteEvent = new NDKEvent(ndk);
			inviteEvent.kind = 513;
			inviteEvent.content = content;
			inviteEvent.tags = [
				['d', dTag],
				...inviteCodes.map(code => ['code', code])
			];
			inviteEvent.isProtected = true;

			await inviteEvent.sign();

			// Mark as protected before publishing
			inviteEvent.isProtected = true;

			console.log('Publishing invite event to selected Agoras...', inviteEvent.id, selectedRelayUrls);

			// Publish to specific Agora relays only
			const relays = new Set<NDKRelay>();
			for (const url of selectedRelayUrls) {
				const relay = ndk.pool.getRelay(url, true);
				if (relay) {
					relays.add(relay);
				}
			}

			const relaySet = new NDKRelaySet(relays, ndk);
			await inviteEvent.publish(relaySet);

			// Generate invite link: /i/{dTag}{encryptionKey}
			// dTag = 12 chars, encryptionKey = 24 chars (optional)
			const code = isPersonalized ? `${dTag}${encryptionKey}` : dTag;
			const link = `${window.location.origin}/i/${code}`;
			inviteLink = link;
			console.log('Invite created:', link);
		} catch (error) {
			console.error('Failed to generate invite:', error);
			alert('Failed to generate invite. Check console for details.');
		} finally {
			isGenerating = false;
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(inviteLink);
			isCopied = true;
			setTimeout(() => (isCopied = false), 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	function handleClose() {
		// Reset form
		welcomeMessage = DEFAULT_WELCOME_MESSAGE;
		isPersonalized = false;
		recipientName = '';
		cashuAmount = '';
		maxUses = 10;
		inviteLink = '';
		selectedRelayUrls = [];
		isRelayDropdownOpen = false;
		onClose();
	}

	function handleRelayDropdownClickOutside() {
		isRelayDropdownOpen = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}
</script>

<Dialog.Root open={isOpen} onOpenChange={(newOpen) => {
    isOpen = newOpen;
    if (!newOpen) handleClose();
  }}>
	<Dialog.Content class="max-w-lg max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Create an Invite</Dialog.Title>
			<Dialog.Description>
				Invite someone to join Agora with a personal message
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6">

			{#if !inviteLink}
					<!-- Welcome Message -->
					<div>
						<Label for="welcome-message">Welcome Message</Label>
						<Textarea
							id="welcome-message"
							bind:value={welcomeMessage}
							rows={6}
							placeholder="Write a welcome message..."
							class="mt-2 resize-none"
						/>
					</div>

					<!-- Agora Selection -->
					<div class="relative">
						<label class="block text-sm font-medium text-muted-foreground mb-2">
							Invite to Agora
						</label>
						<button
							type="button"
							onclick={() => isRelayDropdownOpen = !isRelayDropdownOpen}
							class="w-full px-4 py-2.5 text-left rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-colors flex items-center gap-3 group"
						>
							{#if selectedRelayUrls.length === 0}
								<img src="/logo-icon.svg" alt="Agora" class="w-6 h-6 flex-shrink-0" />
								<span class="text-sm text-muted-foreground flex-1">Select Agora...</span>
							{:else if selectedRelayUrls.length === 1 && selectedRelayInfo}
								{#if selectedRelayInfo.info.info?.icon}
									<img src={selectedRelayInfo.info.info.icon} alt="" class="w-6 h-6 rounded flex-shrink-0" />
								{:else}
									<div class="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
										<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
										</svg>
									</div>
								{/if}
								<span class="text-sm text-muted-foreground flex-1">{selectedRelayName}</span>
							{:else}
								<img src="/logo-icon.svg" alt="Agora" class="w-6 h-6 flex-shrink-0" />
								<span class="text-sm text-muted-foreground flex-1">{selectedRelayUrls.length} Agoras selected</span>
							{/if}
							<svg class="w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 {isRelayDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{#if isRelayDropdownOpen}
							<div
								use:clickOutside={handleRelayDropdownClickOutside}
								class="absolute z-[60] mt-1 w-full bg-popover border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto"
							>
								{#if agoraRelays.length === 0}
									<p class="text-sm text-muted-foreground text-center py-4">No Agora relays configured</p>
								{:else}
									{#each agoraRelays as relay (relay.url)}
										{@const relayInfo = useRelayInfoCached(relay.url)}
										<button
											type="button"
											onclick={() => {
												toggleRelay(relay.url);
											}}
											class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted cursor-pointer transition-colors text-left"
										>
											<input
												type="checkbox"
												checked={selectedRelayUrls.includes(relay.url)}
												class="w-4 h-4 text-primary border rounded focus:ring-orange-500 pointer-events-none"
											/>
											{#if relayInfo.info?.icon}
												<img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded flex-shrink-0" />
											{:else}
												<div class="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
													<svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
													</svg>
												</div>
											{/if}
											<div class="flex-1 min-w-0">
												<div class="flex items-center gap-1.5">
													<div class="text-sm font-medium text-foreground truncate">
														{relayInfo.info?.name || relay.url.replace('wss://', '').replace('ws://', '')}
													</div>
													<span class="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded uppercase tracking-wide">
														Agora
													</span>
												</div>
												{#if relayInfo.info?.description}
													<div class="text-xs text-muted-foreground truncate">
														{relayInfo.info.description}
													</div>
												{/if}
											</div>
										</button>
									{/each}
								{/if}
							</div>
						{/if}

						{#if selectedRelayUrls.length > 1}
							<p class="mt-1 text-xs text-muted-foreground">
								{selectedRelayUrls.length} Agoras selected
							</p>
						{/if}
					</div>

					<!-- Max Uses -->
					<div>
						<Label for="max-uses">Maximum Uses</Label>
						<Input
							id="max-uses"
							type="number"
							bind:value={maxUses}
							min="1"
							max="500"
							class="mt-2"
						/>
						<p class="mt-1 text-xs text-muted-foreground">
							How many people can use this invite (1-500)
						</p>
					</div>

					<!-- Personalization Toggle -->
					<div class="flex items-center space-x-3">
						<input
							type="checkbox"
							id="personalize"
							bind:checked={isPersonalized}
							class="w-5 h-5 text-primary border rounded focus:ring-orange-500"
						/>
						<label
							for="personalize"
							class="text-sm font-medium text-muted-foreground cursor-pointer"
						>
							Personalize this invite
						</label>
					</div>

					<!-- Personalization Options -->
					{#if isPersonalized}
						<div class="space-y-4 border-l-4 border-primary pl-4">
							<div>
								<Label for="recipient-name" class="flex items-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									Recipient's Name
								</Label>
								<Input
									id="recipient-name"
									type="text"
									bind:value={recipientName}
									placeholder="John Doe"
									class="mt-2"
								/>
							</div>

							<div>
								<Label for="cashu-amount" class="flex items-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
									Include Cashu Token (sats)
								</Label>
								<Input
									id="cashu-amount"
									type="number"
									bind:value={cashuAmount}
									placeholder="Amount in sats (optional)"
									class="mt-2"
								/>
								<p class="mt-1 text-xs text-muted-foreground">
									Add sats to help them get started on Nostr
								</p>
							</div>
						</div>
					{/if}

					<!-- Generate Button -->
					<Button
						onclick={generateInvite}
						disabled={isGenerating || !welcomeMessage.trim() || selectedRelayUrls.length === 0}
						class="w-full"
					>
						{#if isGenerating}
							<div
								class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
							></div>
							Generating Invite...
						{:else}
							Generate Invite Link
						{/if}
					</Button>
			{:else}
				<div class="space-y-6">
					<div class="text-center py-8">
						<div
							class="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
						>
							<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-foreground mb-2">
							Invite Created!
						</h3>
						<p class="text-sm text-muted-foreground">
							{isPersonalized && recipientName
								? `Your personalized invite for ${recipientName} is ready`
								: 'Your invite link is ready to share'}
						</p>
					</div>

					<div class="bg-muted rounded-xl p-4">
						<div class="flex items-center space-x-2">
							<Input
								type="text"
								value={inviteLink}
								readonly
								class="flex-1 bg-transparent"
							/>
							<Button
								onclick={copyToClipboard}
								size="sm"
							>
								{#if isCopied}
									<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									Copied!
								{:else}
									<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
									Copy
								{/if}
							</Button>
						</div>
					</div>

					<Dialog.Footer class="flex gap-3 sm:space-x-0">
						<Button
							variant="outline"
							onclick={() => (inviteLink = '')}
							class="flex-1"
						>
							Create Another
						</Button>
						<Button
							onclick={handleClose}
							class="flex-1"
						>
							Done
						</Button>
					</Dialog.Footer>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
