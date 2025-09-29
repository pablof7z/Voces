import { Bell, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationCard } from '@/features/notifications/NotificationCard';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const INITIAL_LOAD = 20;
const BATCH_SIZE = 10;

export function NotificationsPage() {
  const { groups, markGroupAsRead, markAllAsRead } = useNotificationStore();
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Sort groups by latest timestamp
  const sortedGroups = useMemo(() => {
    return Array.from(groups.values()).sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  }, [groups]);

  // Get visible groups based on visibleCount
  const visibleGroups = useMemo(() => {
    return sortedGroups.slice(0, visibleCount);
  }, [sortedGroups, visibleCount]);

  const hasMore = visibleCount < sortedGroups.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate async loading for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, sortedGroups.length));
      setIsLoadingMore(false);
    }, 100);
  }, [isLoadingMore, hasMore, sortedGroups.length]);

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

  // Reset visible count when groups change significantly
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
  }, [groups.size]);

  // Mark all as read when leaving the page
  useEffect(() => {
    return () => {
      // Optional: Mark all as read when leaving
      // markAllAsRead();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 sm:px-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
          {sortedGroups.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-black rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No notifications yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
            When someone mentions you or interacts with your notes, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        /* Notification list */
        <>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {visibleGroups.map(group => (
              <NotificationCard
                key={group.id}
                group={group}
                onRead={() => markGroupAsRead(group.id)}
              />
            ))}
          </div>

          {/* Load more trigger */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-8"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading more notifications...</span>
                </div>
              ) : (
                <button
                  onClick={loadMore}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Load more
                </button>
              )}
            </div>
          )}

          {/* End of list indicator */}
          {!hasMore && sortedGroups.length > 0 && (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-600">
              You&apos;ve seen all notifications
            </div>
          )}
        </>
      )}
    </div>
  );
}