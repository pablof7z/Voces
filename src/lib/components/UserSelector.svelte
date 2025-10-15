<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import { Button } from '$lib/components/ui/button';
  import { clickOutside } from '$lib/utils/clickOutside';
  import { portal } from '$lib/utils/portal.svelte';

  interface Props {
    selectedPubkeys?: string[];
    onSelect?: (pubkeys: string[]) => void;
    multiple?: boolean;
    buttonClass?: string;
    buttonLabel?: string;
    disabled?: boolean;
    iconOnly?: boolean;
    open?: boolean;
  }

  let {
    selectedPubkeys = $bindable([]),
    onSelect,
    multiple = true,
    buttonClass = '',
    buttonLabel,
    disabled = false,
    iconOnly = true,
    open = $bindable(false)
  }: Props = $props();
  let searchQuery = $state('');
  let buttonElement: any = $state(null);
  let dropdownPosition = $state({ top: 0, left: 0, width: 0 });

  const currentUser = ndk.$currentUser;

  // Fetch current user's follows
  const contactListSubscription = ndk.$subscribe(
    () => currentUser?.pubkey ? ({
      filters: [{ kinds: [3], authors: [currentUser.pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  const userFollows = $derived.by(() => {
    const contactList = contactListSubscription.events[0];
    if (!contactList) return new Set<string>();
    return new Set(contactList.tags.filter(tag => tag[0] === 'p').map(tag => tag[1]));
  });

  const filteredFollows = $derived.by(() => {
    if (!searchQuery) return Array.from(userFollows).slice(0, 50);
    const search = searchQuery.toLowerCase();
    return Array.from(userFollows).filter(pubkey => {
      const profile = ndk.$fetchProfile(() => pubkey) as { name?: string; displayName?: string; nip05?: string } | undefined;
      return (
        pubkey.toLowerCase().includes(search) ||
        profile?.name?.toLowerCase().includes(search) ||
        profile?.displayName?.toLowerCase().includes(search) ||
        profile?.nip05?.toLowerCase().includes(search)
      );
    }).slice(0, 50);
  });

  function handleClick() {
    if (!open && buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      dropdownPosition = {
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 380)
      };
    }
    open = !open;
  }

  // When used as a modal (button hidden), center the dropdown
  const isModalMode = $derived(buttonClass.includes('hidden'));

  $effect(() => {
    if (open && isModalMode) {
      // Center the dropdown on screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = 380;
      const dropdownHeight = 400;

      dropdownPosition = {
        top: (viewportHeight - dropdownHeight) / 2,
        left: (viewportWidth - dropdownWidth) / 2,
        width: dropdownWidth
      };
    }
  });

  function toggleUser(pubkey: string) {
    if (multiple) {
      if (selectedPubkeys.includes(pubkey)) {
        selectedPubkeys = selectedPubkeys.filter(p => p !== pubkey);
      } else {
        selectedPubkeys = [...selectedPubkeys, pubkey];
      }
    } else {
      selectedPubkeys = [pubkey];
      open = false;
    }
    onSelect?.(selectedPubkeys);
  }

  function removeUser(pubkey: string) {
    selectedPubkeys = selectedPubkeys.filter(p => p !== pubkey);
    onSelect?.(selectedPubkeys);
  }

  async function addByIdentifier() {
    if (!searchQuery.trim()) return;

    try {
      const input = searchQuery.trim();
      const user = await ndk.fetchUser(input);

      if (user?.pubkey) {
        if (multiple) {
          if (!selectedPubkeys.includes(user.pubkey)) {
            selectedPubkeys = [...selectedPubkeys, user.pubkey];
            onSelect?.(selectedPubkeys);
            toast.success('User added');
          }
        } else {
          selectedPubkeys = [user.pubkey];
          onSelect?.(selectedPubkeys);
          open = false;
        }
        searchQuery = '';
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to fetch user');
    }
  }

  function handleClickOutside() {
    open = false;
  }

  // Check if input looks like an identifier (npub, hex, or NIP-05)
  const isIdentifierInput = $derived.by(() => {
    const query = searchQuery.trim();
    return query.length > 0 && (
      query.startsWith('npub1') ||
      query.startsWith('nprofile1') ||
      query.includes('@') ||
      (query.length === 64 && /^[0-9a-f]+$/i.test(query))
    );
  });
</script>

<div class="relative">
  <Button
    bind:this={buttonElement}
    type="button"
    variant="ghost"
    size={iconOnly ? 'icon' : 'default'}
    class="{iconOnly ? 'h-8 w-8' : 'w-full justify-start'} {buttonClass}"
    {disabled}
    onclick={handleClick}
    title={buttonLabel || 'Tag people'}
  >
    {#if !iconOnly && buttonLabel}
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>{buttonLabel}</span>
      {#if selectedPubkeys.length > 0}
        <span class="ml-auto text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
          {selectedPubkeys.length}
        </span>
      {/if}
    {:else}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      {#if selectedPubkeys.length > 0}
        <span class="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
          {selectedPubkeys.length}
        </span>
      {/if}
    {/if}
  </Button>

  {#if open}
    {#if isModalMode}
      <div
        use:portal
        role="presentation"
        onclick={handleClickOutside}
        onkeydown={(e) => e.key === 'Escape' && handleClickOutside()}
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      >
        <div
          role="dialog"
          tabindex="-1"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => e.stopPropagation()}
          style="width: 380px;"
          class="bg-card border border-border rounded-lg shadow-xl overflow-hidden"
        >
          <div class="flex flex-col max-h-[400px]">
        <!-- Header -->
        <div class="p-3 border-b border-border">
          <h3 class="font-semibold text-sm mb-2">Tag people</h3>
          <div class="relative">
            <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search or paste npub/identifier..."
              class="w-full pl-8 pr-16 py-2 bg-muted border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onkeydown={(e) => {
                if (e.key === 'Enter' && isIdentifierInput) {
                  addByIdentifier();
                }
              }}
            />
            {#if isIdentifierInput}
              <button
                type="button"
                onclick={addByIdentifier}
                class="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-xs font-medium transition-colors"
              >
                Add
              </button>
            {/if}
          </div>
          {#if !searchQuery}
            <p class="text-xs text-muted-foreground mt-1.5">
              Search follows or paste npub/hex/NIP-05
            </p>
          {/if}
        </div>

        <!-- Selected users -->
        {#if selectedPubkeys.length > 0}
          <div class="px-3 py-2 border-b border-border bg-muted/30">
            <div class="text-xs font-medium text-muted-foreground mb-2">
              Selected ({selectedPubkeys.length})
            </div>
            <div class="flex flex-wrap gap-1.5">
              {#each selectedPubkeys as pubkey (pubkey)}
                {@const profile = ndk.$fetchProfile(() => pubkey) as { name?: string; displayName?: string; nip05?: string } | undefined}
                <button
                  type="button"
                  onclick={() => removeUser(pubkey)}
                  class="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 hover:bg-primary/30 text-foreground rounded-full text-xs transition-colors"
                >
                  <Avatar {ndk} {pubkey} size={14} class="flex-shrink-0" />
                  <span class="max-w-[100px] truncate">
                    {profile?.displayName || profile?.name || `${pubkey.slice(0, 8)}...`}
                  </span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Follows list -->
        <div class="overflow-y-auto flex-1">
          {#if filteredFollows.length === 0}
            <div class="text-center py-8 px-3 text-muted-foreground text-sm">
              {searchQuery ? 'No matches found' : 'You don\'t follow anyone yet'}
            </div>
          {:else}
            <div class="p-2 space-y-1">
              {#each filteredFollows as pubkey (pubkey)}
                {@const profile = ndk.$fetchProfile(() => pubkey) as { name?: string; displayName?: string; nip05?: string } | undefined}
                {@const isSelected = selectedPubkeys.includes(pubkey)}
                <button
                  type="button"
                  onclick={() => toggleUser(pubkey)}
                  class={`w-full flex items-center gap-2 p-2 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-primary/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Avatar {ndk} {pubkey} size={32} class="flex-shrink-0" />
                  <div class="flex-1 min-w-0 text-left">
                    <div class="text-sm font-medium text-foreground truncate">
                      {profile?.displayName || profile?.name || `${pubkey.slice(0, 8)}...`}
                    </div>
                    {#if profile?.nip05}
                      <div class="text-xs text-muted-foreground truncate">
                        {profile.nip05}
                      </div>
                    {/if}
                  </div>
                  {#if multiple}
                    <div class={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-border'
                    }`}>
                      {#if isSelected}
                        <svg class="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      {/if}
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
        </div>
      </div>
    {:else}
      <div
        use:portal
        use:clickOutside={handleClickOutside}
        style="position: fixed; top: {dropdownPosition.top}px; left: {dropdownPosition.left}px; width: 380px;"
        class="bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden"
      >
        <div class="flex flex-col max-h-[400px]">
        <!-- Header -->
        <div class="p-3 border-b border-border">
          <h3 class="font-semibold text-sm mb-2">Tag people</h3>
          <div class="relative">
            <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search or paste npub/identifier..."
              class="w-full pl-8 pr-16 py-2 bg-muted border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onkeydown={(e) => {
                if (e.key === 'Enter' && isIdentifierInput) {
                  addByIdentifier();
                }
              }}
            />
            {#if isIdentifierInput}
              <button
                type="button"
                onclick={addByIdentifier}
                class="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-xs font-medium transition-colors"
              >
                Add
              </button>
            {/if}
          </div>
          {#if !searchQuery}
            <p class="text-xs text-muted-foreground mt-1.5">
              Search follows or paste npub/hex/NIP-05
            </p>
          {/if}
        </div>

        <!-- Selected users -->
        {#if selectedPubkeys.length > 0}
          <div class="px-3 py-2 border-b border-border bg-muted/30">
            <div class="text-xs font-medium text-muted-foreground mb-2">
              Selected ({selectedPubkeys.length})
            </div>
            <div class="flex flex-wrap gap-1.5">
              {#each selectedPubkeys as pubkey (pubkey)}
                {@const profile = ndk.$fetchProfile(() => pubkey) as { name?: string; displayName?: string; nip05?: string } | undefined}
                <button
                  type="button"
                  onclick={() => removeUser(pubkey)}
                  class="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 hover:bg-primary/30 text-foreground rounded-full text-xs transition-colors"
                >
                  <Avatar {ndk} {pubkey} size={14} class="flex-shrink-0" />
                  <span class="max-w-[100px] truncate">
                    {profile?.displayName || profile?.name || `${pubkey.slice(0, 8)}...`}
                  </span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Follows list -->
        <div class="overflow-y-auto flex-1">
          {#if filteredFollows.length === 0}
            <div class="text-center py-8 px-3 text-muted-foreground text-sm">
              {searchQuery ? 'No matches found' : 'You don\'t follow anyone yet'}
            </div>
          {:else}
            <div class="p-2 space-y-1">
              {#each filteredFollows as pubkey (pubkey)}
                {@const profile = ndk.$fetchProfile(() => pubkey) as { name?: string; displayName?: string; nip05?: string } | undefined}
                {@const isSelected = selectedPubkeys.includes(pubkey)}
                <button
                  type="button"
                  onclick={() => toggleUser(pubkey)}
                  class={`w-full flex items-center gap-2 p-2 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-primary/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Avatar {ndk} {pubkey} size={32} class="flex-shrink-0" />
                  <div class="flex-1 min-w-0 text-left">
                    <div class="text-sm font-medium text-foreground truncate">
                      {profile?.displayName || profile?.name || `${pubkey.slice(0, 8)}...`}
                    </div>
                    {#if profile?.nip05}
                      <div class="text-xs text-muted-foreground truncate">
                        {profile.nip05}
                      </div>
                    {/if}
                  </div>
                  {#if multiple}
                    <div class={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-border'
                    }`}>
                      {#if isSelected}
                        <svg class="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      {/if}
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      </div>
    {/if}
  {/if}
</div>
