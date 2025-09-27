import { useState, useEffect, useCallback } from 'react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKArticle, NDKEvent } from '@nostr-dev-kit/ndk';
import { fetchArticleComments } from '../utils/fetchComments';

export function useArticleComments(article: NDKArticle | null) {
  const { ndk } = useNDK();
  const [comments, setComments] = useState<NDKEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!article || !ndk) return;

    let isCancelled = false;

    const loadComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedComments = await fetchArticleComments(ndk, article);
        if (!isCancelled) {
          setComments(fetchedComments);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
          setError(errorMessage);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      isCancelled = true;
    };
  }, [article, ndk]);

  const addComment = useCallback((comment: NDKEvent) => {
    setComments(prev => [...prev, comment]);
  }, []);

  return { comments, isLoading, error, addComment };
}