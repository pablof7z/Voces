<script lang="ts">
  import { formatTimeAgo } from '$lib/utils/formatTime';

  interface Props {
    timestamp: number;
    class?: string;
  }

  const { timestamp, class: className = '' }: Props = $props();

  let formattedTime = $state(formatTimeAgo(timestamp));

  // Calculate update interval based on how old the timestamp is
  function getUpdateInterval(ts: number): number {
    const now = Date.now();
    const diff = now - (ts * 1000);
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) {
      return 1000; // Update every second for "just now"
    } else if (seconds < 3600) {
      return 60000; // Update every minute for minutes
    } else if (seconds < 86400) {
      return 3600000; // Update every hour for hours
    } else {
      return 86400000; // Update every day for days and beyond
    }
  }

  function updateTime() {
    formattedTime = formatTimeAgo(timestamp);
  }

  $effect(() => {
    // Set up interval to update the time
    const interval = getUpdateInterval(timestamp);
    const intervalId = setInterval(updateTime, interval);

    return () => {
      clearInterval(intervalId);
    };
  });
</script>

<time datetime={new Date(timestamp * 1000).toISOString()} class={className} title={new Date(timestamp * 1000).toLocaleString()}>
  {formattedTime}
</time>
