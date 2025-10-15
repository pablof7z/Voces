<script lang="ts">
  import { goto } from '$app/navigation';
  import { homePageFilter } from '$lib/stores/homePageFilter.svelte';
  import { createMediaPostModal } from '$lib/stores/createMediaPostModal.svelte';

  interface Props {
    onclick?: () => void;
    isHomePage?: boolean;
  }

  const { onclick, isHomePage = false }: Props = $props();

  const filter = $derived(isHomePage ? homePageFilter.selected : null);

  function handleClick() {
    if (onclick) {
      onclick();
    } else if (filter === 'images') {
      createMediaPostModal.open();
    } else {
      goto('/compose');
    }
  }

  const icon = $derived(
    filter === 'images'
      ? 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
      : 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
  );

  const label = $derived(
    filter === 'images' ? 'Create media post' : 'Compose'
  );
</script>

<button
  onclick={handleClick}
  class="block lg:hidden fixed bottom-24 right-4 w-14 h-14 bg-primary hover:bg-accent-dark text-foreground rounded-full shadow-lg hover:shadow-xl transition-all z-[500] flex items-center justify-center active:scale-95"
  aria-label={label}
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icon} />
  </svg>
</button>
