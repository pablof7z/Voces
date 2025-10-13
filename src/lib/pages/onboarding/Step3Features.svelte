<script lang="ts">
  interface Props {
    onNext: () => void;
  }

  let { onNext }: Props = $props();
</script>

<div class="min-h-screen flex items-center justify-center p-8 py-16">
  <div class="max-w-5xl w-full">
    <!-- Header -->
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold mb-3">What You Can Do Here</h2>
      <p class="text-lg text-muted-foreground dark:text-muted-foreground">
        Your community, your marketplace, your news — all in one place
      </p>
    </div>

    <!-- Three Features Side by Side -->
    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <!-- Marketplace -->
      <div class="bg-neutral-50 dark:bg-card rounded-xl p-6 border border">
        <div class="text-5xl mb-4 text-center">🛍️</div>
        <h3 class="text-xl font-bold mb-2 text-center">Local Marketplace</h3>
        <p class="text-sm text-muted-foreground dark:text-muted-foreground mb-4 text-center">
          Buy and sell with neighbors. No middlemen, no fees.
        </p>
        <div class="bg-white dark:bg-background rounded-lg p-4 text-left border border">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-neutral-300 dark:bg-muted rounded-full flex items-center justify-center text-xs font-medium">
              MR
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm truncate">María's Bakery</div>
              <div class="text-xs text-muted-foreground">2km away</div>
            </div>
          </div>
          <div class="text-sm font-medium mb-1">Fresh Bread & Pastries</div>
          <div class="text-xs text-muted-foreground dark:text-muted-foreground mb-2">
            Daily baked goods, accepting sats
          </div>
          <div class="text-sm font-semibold">2,500 sats / dozen</div>
        </div>
      </div>

      <!-- P2P Trading -->
      <div class="bg-neutral-50 dark:bg-card rounded-xl p-6 border border">
        <div class="text-5xl mb-4 text-center">🤝</div>
        <h3 class="text-xl font-bold mb-2 text-center">P2P Trading</h3>
        <p class="text-sm text-muted-foreground dark:text-muted-foreground mb-4 text-center">
          Trade directly with verified members. Escrow protected.
        </p>
        <div class="bg-white dark:bg-background rounded-lg p-4 border border">
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
              <div class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400 font-semibold">BUY</span>
                <span class="font-medium">100 USD</span>
              </div>
              <div class="text-right">
                <div class="font-semibold">485k sats</div>
              </div>
            </div>
            <div class="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
              <div class="flex items-center gap-2">
                <span class="text-red-600 dark:text-red-400 font-semibold">SELL</span>
                <span class="font-medium">50 USD</span>
              </div>
              <div class="text-right">
                <div class="font-semibold">240k sats</div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-3">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Escrow protected</span>
          </div>
        </div>
      </div>

      <!-- News -->
      <div class="bg-neutral-50 dark:bg-card rounded-xl p-6 border border">
        <div class="text-5xl mb-4 text-center">📰</div>
        <h3 class="text-xl font-bold mb-2 text-center">Real News</h3>
        <p class="text-sm text-muted-foreground dark:text-muted-foreground mb-4 text-center">
          Authentic stories from your community. No censorship.
        </p>
        <div class="bg-white dark:bg-background rounded-lg p-4 text-left border border">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-neutral-300 dark:bg-muted rounded-full flex items-center justify-center text-xs font-medium">
              CM
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm truncate">Carlos Mendoza</div>
              <div class="text-xs text-muted-foreground">2 hours ago</div>
            </div>
          </div>
          <div class="text-sm font-medium mb-1">Alternative Supply Chain</div>
          <div class="text-xs text-muted-foreground dark:text-muted-foreground mb-2">
            Direct farmer-to-community network reduces costs by 40%...
          </div>
          <div class="flex items-center gap-3 text-xs text-muted-foreground">
            <span>⚡ 23.5k</span>
            <span>💬 156</span>
            <span>🔁 89</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Continue Button -->
    <div class="text-center">
      <button
        onclick={onNext}
        class="bg-background dark:bg-white text-foreground dark:text-black px-8 py-3 rounded-lg font-medium hover:bg-muted dark:hover:bg-neutral-200 transition-colors"
      >
        Continue →
      </button>
    </div>
  </div>
</div>
