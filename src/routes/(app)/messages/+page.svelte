<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';

  const currentUser = ndk.$currentUser;
</script>

<div class="relative h-screen">
  <!-- Messages Shell (Behind Coming Soon) -->
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-background border-b border-border/50 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-foreground">Messages</h1>
        <button class="p-2 rounded-lg hover:bg-neutral-800/50 transition-colors text-neutral-400 hover:text-primary-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <div class="divide-y divide-neutral-800/50">
        {#each Array(8) as _, i}
          <div class="flex items-center gap-3 px-4 py-4 hover:bg-neutral-900/50 cursor-pointer transition-colors">
            <!-- Avatar placeholder -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-br bg-primary/20 flex-shrink-0"></div>

            <div class="flex-1 min-w-0">
              <!-- Name placeholder -->
              <div class="flex items-center justify-between mb-1">
                <div class="h-4 w-32 bg-neutral-800 rounded"></div>
                <div class="h-3 w-16 bg-neutral-800/70 rounded"></div>
              </div>

              <!-- Message preview placeholder -->
              <div class="h-3 w-3/4 bg-neutral-800/50 rounded"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Coming Soon Overlay -->
  <div class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="text-center px-6 py-12 max-w-md">
      <!-- Icon -->
      <div class="mb-6 flex justify-center">
        <div class="relative">
          <svg class="w-24 h-24 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>

          <!-- Animated pulse effect -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-24 h-24 rounded-full bg-primary-500/20 animate-ping"></div>
          </div>
        </div>
      </div>

      <!-- Text -->
      <h2 class="text-3xl font-bold text-foreground mb-3">Coming Soon</h2>
      <p class="text-neutral-400 text-lg mb-6">
        Direct messaging is currently under development. Check back soon!
      </p>

      <!-- Progress indicator -->
      <div class="w-full bg-neutral-800 rounded-full h-2 mb-3">
        <div class="bg-gradient-to-r bg-primary h-2 rounded-full" style="width: 85%"></div>
      </div>
      <p class="text-sm text-neutral-500">85% complete</p>
    </div>
  </div>
</div>

<style>
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .animate-ping {
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
</style>
