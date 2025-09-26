import { useSubscribe, NDKKind } from '@nostr-dev-kit/ndk-hooks';
import { NoteCard } from './NoteCard';
import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_LOAD = 20;
const BATCH_SIZE = 10;

export function NoteFeed() {
  const { events } = useSubscribe([{
    kinds: [NDKKind.Text],
  }], { subId: 'note-feed' });

  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const sortedEvents = events
    .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
    .slice(0, visibleCount);

  const hasMore = visibleCount < events.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate async loading for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, events.length));
      setIsLoadingMore(false);
    }, 100);
  }, [isLoadingMore, hasMore, events.length]);

  // Set up intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  // Reset visible count when events change significantly
  useEffect(() => {
    if (events.length < visibleCount) {
      setVisibleCount(Math.min(INITIAL_LOAD, events.length));
    }
  }, [events.length, visibleCount]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-500 dark:text-gray-400">
          No notes yet. Be the first to share something!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {/* Show count for debugging - remove in production */}
      <div className="text-xs text-gray-500 dark:text-gray-400 px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
        Showing {sortedEvents.length} of {events.length} notes
      </div>

      {sortedEvents.map((event) => (
        <NoteCard key={event.id} event={event} />
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-8 text-center"
        >
          {isLoadingMore ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full bg-accent-500 animate-pulse" />
              <div className="w-4 h-4 rounded-full bg-accent-500 animate-pulse animation-delay-200" />
              <div className="w-4 h-4 rounded-full bg-accent-500 animate-pulse animation-delay-400" />
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Load more notes
            </button>
          )}
        </div>
      )}
    </div>
  );
}