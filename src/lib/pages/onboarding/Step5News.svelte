<script lang="ts">
  interface Props {
    onNext: () => void;
  }

  let { onNext }: Props = $props();
</script>

<div class="min-h-screen flex items-center justify-center p-8">
  <div class="max-w-2xl w-full text-center">
    <div class="text-6xl mb-6">📰</div>
    <h2 class="text-3xl font-bold mb-4">Real News from Real People</h2>
    <p class="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
      No censorship. No propaganda. Just authentic stories from your community.
    </p>

    <!-- News example -->
    <div class="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-neutral-300 dark:bg-neutral-700 rounded-full flex items-center justify-center text-sm font-medium">
          CM
        </div>
        <div class="flex-1">
          <div class="font-semibold">Carlos Mendoza</div>
          <div class="text-xs text-neutral-500">Independent Journalist · 2 hours ago</div>
        </div>
      </div>
      <h3 class="font-semibold mb-2">Community Organizes Alternative Supply Chain</h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
        Residents in Petare have successfully established a direct farmer-to-community distribution network,
        bypassing traditional middlemen and reducing food costs by 40%...
      </p>
      <div class="flex items-center gap-4 text-sm text-neutral-500">
        <span class="flex items-center gap-1">
          ⚡ 23.5k sats
        </span>
        <span class="flex items-center gap-1">
          💬 156 comments
        </span>
        <span class="flex items-center gap-1">
          🔁 89 reposts
        </span>
      </div>
    </div>

    <button
      onclick={onNext}
      class="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
    >
      Continue →
    </button>
  </div>
</div>
