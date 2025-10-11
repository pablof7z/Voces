/**
 * Format a timestamp to a short relative time string
 * @param timestamp - Unix timestamp in seconds
 * @returns Short relative time string (e.g., "just now", "5m", "3h", "2d")
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const date = new Date(timestamp * 1000);
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else if (days < 7) {
    return `${days}d`;
  } else if (weeks < 4) {
    return `${weeks}w`;
  } else if (months < 12) {
    return `${months}mo`;
  } else {
    return `${years}y`;
  }
}

/**
 * Format a Date object to a short relative time string
 * @param date - JavaScript Date object
 * @returns Short relative time string (e.g., "just now", "5m", "3h", "2d")
 */
export function formatDateAgo(date: Date): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return formatTimeAgo(timestamp);
}
