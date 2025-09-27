import { NDKKind } from '@nostr-dev-kit/ndk';

export const CLASSIFIED_LISTING_KIND = NDKKind.ClassifiedListing;
export const CLASSIFIED_DRAFT_KIND = 30403;

export type ListingStatus = 'active' | 'sold' | 'expired' | 'draft';
export type PriceFrequency = 'once' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface ListingPrice {
  amount: string;
  currency: string;
  frequency?: PriceFrequency;
}

export interface ListingFormData {
  title: string;
  summary: string;
  content: string;
  location: string;
  price: {
    amount: string;
    currency: string;
    frequency?: PriceFrequency;
  };
  categories: string[];
  images: string[];
}


export function createListingTags(data: ListingFormData): string[][] {
  const tags: string[][] = [];

  tags.push(['title', data.title]);

  if (data.summary) {
    tags.push(['summary', data.summary]);
  }

  if (data.location) {
    tags.push(['location', data.location]);
  }

  if (data.price && data.price.amount && data.price.currency) {
    const priceTag = ['price', data.price.amount, data.price.currency];
    if (data.price.frequency && data.price.frequency !== 'once') {
      priceTag.push(data.price.frequency);
    }
    tags.push(priceTag);
  }

  tags.push(['published_at', Math.floor(Date.now() / 1000).toString()]);
  tags.push(['status', 'active']);

  data.categories.forEach(category => {
    tags.push(['t', category.toLowerCase()]);
  });

  data.images.forEach(image => {
    tags.push(['image', image]);
  });

  return tags;
}