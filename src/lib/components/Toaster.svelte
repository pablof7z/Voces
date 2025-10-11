<script lang="ts">
  import { toast } from '$lib/stores/toast.svelte';

  function getTypeStyles(type: 'success' | 'error' | 'info') {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-500';
    }
  }

  function getIcon(type: 'success' | 'error' | 'info') {
    switch (type) {
      case 'success':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />`;
      case 'error':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;
      case 'info':
      default:
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;
    }
  }
</script>

<div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
  {#each toast.messages as message (message.id)}
    <div
      class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-white animate-in slide-in-from-top duration-300 {getTypeStyles(message.type)}"
    >
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {@html getIcon(message.type)}
      </svg>
      <span class="text-sm font-medium">{message.message}</span>
      <button
        onclick={() => toast.dismiss(message.id)}
        class="ml-2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>
