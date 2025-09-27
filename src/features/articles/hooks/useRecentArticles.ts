import { useState, useEffect } from 'react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';

const DEFAULT_ARTICLE_LIMIT = 10;

interface UseRecentArticlesOptions {
  limit?: number;
}

export function useRecentArticles({ limit = DEFAULT_ARTICLE_LIMIT }: UseRecentArticlesOptions = {}) {
  const { ndk } = useNDK();
  const [articles, setArticles] = useState<NDKArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ndk) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchRecentArticles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const events = await ndk.fetchEvents({
          kinds: [NDKKind.Article],
          limit,
        });

        if (!isCancelled) {
          const articlesArray = Array.from(events)
            .map(event => NDKArticle.from(event))
            .sort((a, b) => {
              const aTime = a.published_at || a.created_at || 0;
              const bTime = b.published_at || b.created_at || 0;
              return bTime - aTime;
            });

          setArticles(articlesArray);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load articles';
          setError(errorMessage);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchRecentArticles();

    return () => {
      isCancelled = true;
    };
  }, [ndk, limit]);

  return { articles, isLoading, error };
}