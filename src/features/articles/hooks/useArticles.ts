import { useSubscribe, NDKArticle, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk-hooks';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWoTFilter } from '@/hooks/useWoT';
import { useMemo } from 'react';

interface UseArticlesOptions {
  authors?: string[];
  limit?: number;
}

export function useArticles({ authors, limit }: UseArticlesOptions = {}) {
  const selectedRelay = useSettingsStore((state) => state.selectedRelay);

  // When no authors provided, fetch all articles
  const filters = authors && authors.length > 0
    ? [{ kinds: [30023], authors }]
    : [{ kinds: [30023] }]; // Fetch all articles when not logged in

  const { events } = useSubscribe(
    filters,
    {
      subId: 'articles-feed',
      ...(selectedRelay ? { relays: [selectedRelay] } : {}),
      cacheUsage: selectedRelay ? NDKSubscriptionCacheUsage.ONLY_RELAY : undefined,
    },
    [authors?.length, selectedRelay]
  );

  const filteredEvents = useWoTFilter(events);

  const articles = useMemo(() => {
    const articlesList = filteredEvents
      .map(event => NDKArticle.from(event))
      .filter(article => article.title && article.content)
      .sort((a, b) => (b.published_at ?? b.created_at ?? 0) - (a.published_at ?? a.created_at ?? 0));

    return limit ? articlesList.slice(0, limit) : articlesList;
  }, [filteredEvents, limit]);

  return articles;
}