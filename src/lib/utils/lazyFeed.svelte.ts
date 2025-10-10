import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte, SubscribeConfig } from '@nostr-dev-kit/svelte';

interface LazyFeedOptions {
  /**
   * Initial number of items to display
   */
  initialLimit?: number;
  /**
   * Number of items to load per page
   */
  pageSize?: number;
}

/**
 * Creates a lazy-loading feed that only renders a subset of events
 * and allows loading more as the user scrolls
 */
export function createLazyFeed(
  ndk: NDKSvelte,
  configGetter: () => SubscribeConfig | undefined,
  options: LazyFeedOptions = {}
) {
  const {
    initialLimit = 20,
    pageSize = 20,
  } = options;

  // Store subscription reference with reactive config
  let subscription = ndk.$subscribe(configGetter);

  // Track how many events to display
  let displayLimit = $state(initialLimit);

  // Store frozen snapshot of events to display
  let frozenEvents = $state<NDKEvent[]>([]);

  // Track if we've done initial load
  let initialLoadDone = $state(false);

  // Accumulate new events that haven't been shown yet
  let pendingEvents = $state<NDKEvent[]>([]);

  // Map to track event IDs we've seen
  const seenEventIds = new Set<string>();

  // Track new events arriving after initial load
  $effect(() => {
    const allEvents = subscription.events;

    if (!initialLoadDone && subscription.eosed) {
      // Initial load complete - show all events immediately
      frozenEvents = [...allEvents];
      initialLoadDone = true;
      // Track IDs of initial events
      allEvents.forEach(e => seenEventIds.add(e.id));
    } else if (!initialLoadDone) {
      // Before EOSE: show events as they arrive
      frozenEvents = [...allEvents];
      allEvents.forEach(e => seenEventIds.add(e.id));
    } else if (initialLoadDone) {
      // After initial load, new events go to pending (only truly new ones by ID)
      const newEvents = allEvents.filter(e => !seenEventIds.has(e.id));
      if (newEvents.length > 0) {
        pendingEvents = [...newEvents, ...pendingEvents];
        newEvents.forEach(e => seenEventIds.add(e.id));
      }
    }
  });

  // Derived state for visible events from frozen snapshot
  const visibleEvents = $derived(frozenEvents.slice(0, displayLimit));

  // Check if there are more events to load from frozen snapshot
  const hasMore = $derived(displayLimit < frozenEvents.length);

  // Check if subscription is still loading
  const isLoading = $derived(!subscription.eosed);

  // Function to load more events from frozen snapshot
  function loadMore() {
    if (hasMore) {
      displayLimit = Math.min(displayLimit + pageSize, frozenEvents.length);
    }
  }

  // Function to load pending new events
  function loadPendingEvents() {
    if (pendingEvents.length > 0) {
      const pendingCount = pendingEvents.length;
      // Merge pending events into frozen events at the beginning
      frozenEvents = [...pendingEvents, ...frozenEvents];
      pendingEvents = [];
      // Increase display limit to show the new events without hiding old ones
      displayLimit = displayLimit + pendingCount;
    }
  }

  // Reset state when config changes
  // (subscription automatically recreates itself via reactive config)
  let isFirstRun = true;
  $effect(() => {
    // Track config changes
    configGetter();

    // Skip first run (initial setup)
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }

    // Clear state when dependencies change
    displayLimit = initialLimit;
    frozenEvents = [];
    initialLoadDone = false;
    pendingEvents = [];
    seenEventIds.clear();
  });

  return {
    get events() {
      return visibleEvents;
    },
    get allEvents() {
      return frozenEvents;
    },
    get pendingEvents() {
      return pendingEvents;
    },
    get hasMore() {
      return hasMore;
    },
    get isLoading() {
      return isLoading;
    },
    get eosed() {
      return subscription.eosed;
    },
    get count() {
      return subscription.count;
    },
    get totalCount() {
      return frozenEvents.length;
    },
    get visibleCount() {
      return visibleEvents.length;
    },
    get pendingCount() {
      return pendingEvents.length;
    },
    loadMore,
    loadPendingEvents,
  };
}
