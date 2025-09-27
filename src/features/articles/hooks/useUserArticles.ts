import { useState, useEffect } from 'react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';

export function useUserArticles(pubkey: string | undefined, limit = 10) {
  const { ndk } = useNDK();
  const [articles, setArticles] = useState<NDKArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pubkey || !ndk) {
      setArticles([]);
      return;
    }

    let isCancelled = false;

    const loadArticles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const events = await ndk.fetchEvents({
          kinds: [NDKKind.Article],
          authors: [pubkey],
          limit,
        });

        if (!isCancelled) {
          const articlesArray = Array.from(events).map(event => NDKArticle.from(event));
          articlesArray.sort((a, b) => (b.published_at || b.created_at || 0) - (a.published_at || a.created_at || 0));
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

    loadArticles();

    return () => {
      isCancelled = true;
    };
  }, [pubkey, ndk, limit]);

  return { articles, isLoading, error };
}