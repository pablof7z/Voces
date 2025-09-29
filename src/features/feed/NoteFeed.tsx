import { useSubscribe, NDKKind, NDKEvent, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk-hooks';
import { NoteCard } from './NoteCard';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWoTFilter } from '@/hooks/useWoT';
import { MediaTypeFilter, type MediaType } from './MediaTypeFilter';
import { MediaGrid } from '@/components/media/MediaGrid';
import { ArticlesFeed } from '@/features/articles/components/ArticlesFeed';

const INITIAL_LOAD = 20;
const BATCH_SIZE = 10;

interface NoteFeedProps {
  events?: NDKEvent[];
  authors?: string[];
  showMediaFilter?: boolean;
}

export function NoteFeed({ events: externalEvents, authors, showMediaFilter = false }: NoteFeedProps = {}) {
  const selectedRelay = useSettingsStore((state) => state.selectedRelay);
  const [mediaType, setMediaType] = useState<MediaType>('conversations');

  // Fetch different kinds based on media type
  const kinds = mediaType === 'articles'
    ? [] // Articles are handled separately
    : mediaType === 'images' || mediaType === 'videos'
    ? [NDKKind.Text, NDKKind.Image, NDKKind.Video, NDKKind.ShortVideo]
    : [NDKKind.Text];

  const { events: subscribedEvents } = useSubscribe(
    externalEvents || mediaType === 'articles' ? false : [{
      kinds,
      ...(authors && authors.length > 0 ? { authors } : {}),
    }],
    {
      subId: 'note-feed',
      groupable: false,
      ...(selectedRelay ? { relays: [selectedRelay] } : {}),
      cacheUsage: selectedRelay ? NDKSubscriptionCacheUsage.ONLY_RELAY : undefined,
    },
    [authors?.length, selectedRelay, mediaType]
  );

  const rawEvents = externalEvents || subscribedEvents;
  const unfilteredEvents = useWoTFilter(rawEvents);

  // Helper to check if content has media URLs
  const hasMediaUrl = (content: string, type: 'image' | 'video'): boolean => {
    let regex: RegExp;
    switch (type) {
      case 'image':
        regex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif))/gi;
        break;
      case 'video':
        regex = /(https?:\/\/[^\s]+\.(mp4|webm|mov|avi|mkv))/gi;
        break;
    }
    return regex.test(content);
  };

  // Filter events based on media type
  const events = (() => {
    return unfilteredEvents;
    switch (mediaType) {
      case 'conversations':
        // Only text notes without 'e' tags (not replies)
        return unfilteredEvents.filter(event =>
          event.kind === NDKKind.Text &&
          !event.tags.some(tag => tag[0] === 'e')
        );

      case 'images':
        // Kind 20 or kind 1 with image URLs
        return unfilteredEvents.filter(event =>
          event.kind === NDKKind.Image ||
          (event.kind === NDKKind.Text && hasMediaUrl(event.content, 'image'))
        );

      case 'videos':
        // Kind 21, 22 or kind 1 with video URLs
        return unfilteredEvents.filter(event =>
          event.kind === NDKKind.Video ||
          event.kind === NDKKind.ShortVideo ||
          (event.kind === NDKKind.Text && hasMediaUrl(event.content, 'video'))
        );

      case 'articles':
        // Articles are handled by ArticlesFeed component
        return [];

      default:
        return unfilteredEvents;
    }
  })();

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

  // Reset visible count when events change significantly or relay changes
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
  }, [selectedRelay]);

  useEffect(() => {
    if (events.length < visibleCount) {
      setVisibleCount(Math.min(INITIAL_LOAD, events.length));
    }
  }, [events.length, visibleCount]);

  if (events.length === 0 && mediaType !== 'articles') {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-neutral-500 dark:text-neutral-400">
            No notes yet. Be the first to share something! {unfilteredEvents.length}
        </p>
      </div>
    );
  }

  return (
    <div>
      {showMediaFilter && (
        <MediaTypeFilter
          selected={mediaType}
          onSelect={setMediaType}
        />
      )}

      {mediaType === 'articles' ? (
        <ArticlesFeed authors={authors} />
      ) : mediaType === 'images' || mediaType === 'videos' ? (
        <MediaGrid events={events} />
      ) : (
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">

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
                  className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  Load more notes
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}