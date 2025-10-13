<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<button
  onclick={() => goto('/compose')}
  class="block lg:hidden fixed bottom-24 right-4 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-foreground rounded-full shadow-lg hover:shadow-xl transition-all z-[500] flex items-center justify-center active:scale-95"
  aria-label="Compose"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
</button>
