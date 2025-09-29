import { useState, useEffect, useRef, useCallback } from 'react';
import { Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFollowPacks, useSubscribedFollowPacks } from '@/features/followPacks/hooks/useFollowPacks';
import { mockFollowPacks } from '@/features/followPacks/mockData';
import { PackCard } from '@/features/followPacks/components/PackCard';

const INITIAL_LOAD = 9; // 3x3 grid
const BATCH_SIZE = 6;  // 2 rows at a time

export function FollowPacksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { packs } = useFollowPacks();
  const subscribedPacks = useSubscribedFollowPacks();

  // Use mock data if no packs from relays
  const displayPacks = packs.length > 0 ? packs : mockFollowPacks as any[];

  // Filter packs based on search
  const filteredPacks = displayPacks.filter(pack => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return pack.title.toLowerCase().includes(search) ||
           (pack.description && pack.description.toLowerCase().includes(search));
  });

  // Apply lazy loading to filtered packs
  const visiblePacks = filteredPacks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPacks.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate async loading for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredPacks.length));
      setIsLoadingMore(false);
    }, 100);
  }, [isLoadingMore, hasMore, filteredPacks.length]);

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
        rootMargin: '200px', // Start loading earlier for smoother experience
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

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
  }, [searchQuery]);

  // Reset visible count when packs change significantly
  useEffect(() => {
    if (filteredPacks.length < visibleCount) {
      setVisibleCount(Math.min(INITIAL_LOAD, filteredPacks.length));
    }
  }, [filteredPacks.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Package className="w-8 h-8 text-orange-500" />
          Follow Packs
        </h1>
        <p className="text-neutral-400">
          Discover curated lists of accounts to follow
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search follow packs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>
      </div>

      {/* Your Subscribed Packs - no lazy loading for subscribed */}
      {subscribedPacks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Packs</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {subscribedPacks.slice(0, 6).map(pack => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </div>
      )}

      {/* All Packs Grid with lazy loading */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          {subscribedPacks.length > 0 ? 'Discover More' : 'Popular Packs'}
        </h2>
        {filteredPacks.length > 0 ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visiblePacks.map(pack => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>

            {/* Load more trigger */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="py-12 text-center"
              >
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="text-sm text-neutral-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-neutral-900"
                  >
                    Load more packs ({filteredPacks.length - visibleCount} remaining)
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">
              No follow packs found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}