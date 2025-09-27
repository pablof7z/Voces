import { useState, useEffect } from 'react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKArticle } from '@nostr-dev-kit/ndk';
import { fetchArticleByNaddr } from '../utils/fetchArticle';

export function useArticle(naddr: string | undefined) {
  const { ndk } = useNDK();
  const [article, setArticle] = useState<NDKArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!naddr || !ndk) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadArticle = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedArticle = await fetchArticleByNaddr(ndk, naddr);
        if (!isCancelled) {
          setArticle(fetchedArticle);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load article';
          setError(errorMessage);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadArticle();

    return () => {
      isCancelled = true;
    };
  }, [naddr, ndk]);

  return { article, isLoading, error };
}