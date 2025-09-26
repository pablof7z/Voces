import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import { CLASSIFIED_LISTING_KIND, parseListingFromEvent } from '../types';
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
      kinds: [CLASSIFIED_LISTING_KIND],
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
      .map(parseListingFromEvent)
      .filter(listing => listing.status === 'active')
      .sort((a, b) => {
        const timeA = a.publishedAt || 0;
        const timeB = b.publishedAt || 0;
        return timeB - timeA; // Most recent first
      });
  }, [events]);

  return {
    listings,
    events
  };
}