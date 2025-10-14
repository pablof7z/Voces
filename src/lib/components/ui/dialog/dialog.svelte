<script lang="ts">
  import { portal } from '$lib/utils/portal.svelte';
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    onOpenChange,
    children
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: Snippet;
  } = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeDialog();
    }
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      closeDialog();
    }
  }

  function closeDialog() {
    open = false;
    onOpenChange?.(false);
  }

  // Lock body scroll when dialog is open
  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  });
</script>

<svelte:window onkeydown={handleEscape} />

{#if open}
  <!-- Backdrop -->
  <div
    use:portal
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
    onclick={handleBackdropClick}
    aria-hidden="true"
  ></div>

  <!-- Dialog content wrapper -->
  <div
    use:portal
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    onclick={handleBackdropClick}
  >
    {@render children()}
  </div>
{/if}
