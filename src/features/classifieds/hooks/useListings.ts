import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import { NDKClassified, NDKKind } from '@nostr-dev-kit/ndk';
import { CLASSIFIED_LISTING_KIND } from '../types';
import { useMemo } from 'react';

interface UseListingsOptions {
  category?: string;
  author?: string;
  limit?: number;
}

export function useListings(options: UseListingsOptions = {}) {
  const { category, author, limit = 50 } = options;

  // Build filter based on options
  const filters = useMemo(() => {
    const filter: any = {
      kinds: [NDKKind.Classified],
      limit
    };

    if (author) {
      filter.authors = [author];
    }

    if (category) {
      filter['#t'] = [category.toLowerCase()];
    }

    return [filter];
  }, [category, author, limit]);

  const { events } = useSubscribe(filters, {
    subId: `listings${author ? `-by-${author.slice(0, 8)}` : ''}${category ? `-${category}` : ''}`
  });

  const listings = useMemo(() => {
    return events
      .map(event => NDKClassified.from(event))
      .filter(listing => {
        const status = listing.tagValue('status') || 'active';
        return status === 'active';
      })
      .sort((a, b) => {
        const timeA = a.created_at || 0;
        const timeB = b.created_at || 0;
        return timeB - timeA;
      });
  }, [events]);

  return {
    listings,
    events
  };
}