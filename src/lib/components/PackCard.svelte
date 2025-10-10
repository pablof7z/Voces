<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { goto } from '$app/navigation';
  import { Avatar } from '@nostr-dev-kit/svelte';

  interface Pack {
    id: string;
    title: string;
    description?: string;
    image?: string;
    pubkeys: string[];
    encode: () => string;
    kind: number;
    pubkey: string;
    created_at: number;
  }

  interface Props {
    pack: Pack;
    variant?: 'default' | 'compact';
  }

  const { pack, variant = 'default' }: Props = $props();

  function handlePackClick() {
    goto(`/packs/${pack.encode()}`);
  }

</script>

<div
  role="button"
  tabindex="0"
  onclick={handlePackClick}
  onkeydown={(e) => e.key === 'Enter' && handlePackClick()}
  class="block bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors group cursor-pointer"
>
  {#if pack.image}
    <div class="h-32 w-full">
      <img
        src={pack.image}
        alt={pack.title}
        class="w-full h-full object-cover"
      />
    </div>
  {/if}

  <div class="p-5">
    <div class="mb-4">
      <h3 class="font-semibold text-white group-hover:text-orange-500 transition-colors">
        {pack.title}
      </h3>
      <p class="text-sm text-neutral-500 mt-1">
        {pack.pubkeys.length} members
      </p>
    </div>

    {#if pack.description}
      <p class="text-sm text-neutral-400 mb-4 line-clamp-2">
        {pack.description}
      </p>
    {/if}

    <div class="flex -space-x-2">
      {#each pack.pubkeys.slice(0, 4) as pubkey, index (pubkey)}
        <button
          type="button"
          onclick={(e) => { e.stopPropagation(); window.location.href = `/p/${pubkey}`; }}
          class="relative cursor-pointer"
          style="z-index: {4 - index}"
        >
          <Avatar {ndk} {pubkey} class="w-8 h-8 rounded-full ring-2 ring-neutral-900 hover:opacity-80 transition-opacity" />
        </button>
      {/each}
      {#if pack.pubkeys.length > 4}
        <div class="w-8 h-8 rounded-full bg-neutral-800 ring-2 ring-neutral-900 flex items-center justify-center">
          <span class="text-xs text-neutral-400">
            +{pack.pubkeys.length - 4}
          </span>
        </div>
      {/if}
    </div>
  </div>
</div>
