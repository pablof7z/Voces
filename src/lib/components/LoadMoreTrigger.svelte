<script lang="ts">
  interface Props {
    onIntersect: () => void;
    hasMore: boolean;
    isLoading?: boolean;
  }

  const { onIntersect, hasMore, isLoading = false }: Props = $props();

  let element = $state<HTMLDivElement>();

  $effect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          onIntersect();
        }
      },
      {
        rootMargin: '200px', // Trigger 200px before reaching the element
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  });
</script>

{#if hasMore}
  <div bind:this={element} class="p-4 text-center">
    {#if isLoading}
      <div class="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    {:else}
      <button
        onclick={onIntersect}
        class="px-4 py-2 text-neutral-400 hover:text-neutral-300 transition-colors"
      >
        Load more
      </button>
    {/if}
  </div>
{/if}
