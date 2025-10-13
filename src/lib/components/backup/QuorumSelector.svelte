<script lang="ts">
  import { SHARD_CONSTANTS } from '$lib/backup/utils/shamir';

  interface Props {
    threshold: number;
    totalShards: number;
    onThresholdChange: (threshold: number) => void;
    onTotalShardsChange: (totalShards: number) => void;
    maxShards: number;
  }

  let { threshold, totalShards, onThresholdChange, onTotalShardsChange, maxShards }: Props = $props();

  let effectiveMaxShards = $derived(Math.min(maxShards, SHARD_CONSTANTS.MAX_TOTAL_SHARDS));
  let effectiveMaxThreshold = $derived(Math.min(SHARD_CONSTANTS.MAX_THRESHOLD, totalShards));

  let thresholdOptions = $derived(Array.from(
    { length: effectiveMaxThreshold - SHARD_CONSTANTS.MIN_THRESHOLD + 1 },
    (_, i) => i + SHARD_CONSTANTS.MIN_THRESHOLD
  ));

  let shardsOptions = $derived(Array.from(
    { length: effectiveMaxShards - SHARD_CONSTANTS.MIN_TOTAL_SHARDS + 1 },
    (_, i) => i + SHARD_CONSTANTS.MIN_TOTAL_SHARDS
  ));

  function handleTotalShardsChange(newTotal: number) {
    onTotalShardsChange(newTotal);
    if (threshold > newTotal) {
      onThresholdChange(Math.min(threshold, newTotal));
    }
  }
</script>

<div class="space-y-6">
  <!-- Total Shards -->
  <div>
    <label class="block text-sm font-medium text-neutral-900 dark:text-foreground mb-2">
      Total Key Pieces
    </label>
    <p class="text-xs text-muted-foreground dark:text-muted-foreground mb-3">
      How many pieces should your key be split into?
    </p>
    <select
      value={totalShards}
      onchange={(e) => handleTotalShardsChange(parseInt(e.currentTarget.value))}
      class="w-full px-3 py-2 bg-white dark:bg-card border border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {#each shardsOptions as num}
        <option value={num}>{num} pieces</option>
      {/each}
    </select>
  </div>

  <!-- Threshold -->
  <div>
    <label class="block text-sm font-medium text-neutral-900 dark:text-foreground mb-2">
      Required for Recovery
    </label>
    <p class="text-xs text-muted-foreground dark:text-muted-foreground mb-3">
      How many pieces are needed to recover your key?
    </p>
    <select
      value={threshold}
      onchange={(e) => onThresholdChange(parseInt(e.currentTarget.value))}
      class="w-full px-3 py-2 bg-white dark:bg-card border border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {#each thresholdOptions as num}
        <option value={num}>{num} pieces</option>
      {/each}
    </select>
  </div>

  <!-- Explanation -->
  <div class="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
    <div class="flex gap-3">
      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="flex-1 text-sm text-blue-900 dark:text-blue-200">
        <p class="font-medium mb-1">
          What This Means
        </p>
        <p class="text-xs text-blue-700 dark:text-blue-300">
          Your key will be split into {totalShards} pieces. You'll need any {threshold} of them to recover your key.
          Individual pieces are useless without the required number.
        </p>
      </div>
    </div>
  </div>
</div>
