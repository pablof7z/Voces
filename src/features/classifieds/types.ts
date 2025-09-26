import { NDKEvent } from '@nostr-dev-kit/ndk';

// NIP-99 Event Kinds
export const CLASSIFIED_LISTING_KIND = 30402;
export const CLASSIFIED_DRAFT_KIND = 30403;

export type ListingStatus = 'active' | 'sold' | 'expired' | 'draft';
export type PriceFrequency = 'once' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface ListingPrice {
  amount: string;
  currency: string;
  frequency?: PriceFrequency;
}

export interface ClassifiedListing {
  id: string;
  title: string;
  summary?: string;
  content: string; // Markdown content
  author: string; // pubkey
  publishedAt?: number;
  location?: string;
  price?: ListingPrice;
  status?: ListingStatus;
  categories?: string[];
  images?: string[];
  event?: NDKEvent;
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

export function parseListingFromEvent(event: NDKEvent): ClassifiedListing {
  const title = event.tagValue('title') || 'Untitled Listing';
  const summary = event.tagValue('summary');
  const location = event.tagValue('location');
  const status = event.tagValue('status') as ListingStatus || 'active';
  const publishedAt = event.tagValue('published_at');

  // Parse price tag [price, amount, currency, frequency?]
  const priceTag = event.tags.find(tag => tag[0] === 'price');
  let price: ListingPrice | undefined;
  if (priceTag && priceTag.length >= 3) {
    price = {
      amount: priceTag[1],
      currency: priceTag[2],
      frequency: priceTag[3] as PriceFrequency | undefined
    };
  }

  // Parse categories from 't' tags
  const categories = event.tags
    .filter(tag => tag[0] === 't')
    .map(tag => tag[1]);

  // Parse images - handle multiple tag formats used in the wild
  let images: string[] = [];

  // 1. Standard 'image' tags (most common)
  const imageTags = event.tags
    .filter(tag => tag[0] === 'image')
    .map(tag => tag[1]);

  if (imageTags.length > 0) {
    images = imageTags;
  } else {
    // 2. Check for 'r' tags (resource URLs) that look like images
    const rTags = event.tags
      .filter(tag => tag[0] === 'r' && tag[1] &&
        (tag[1].match(/\.(jpg|jpeg|png|gif|webp|svg)/i) ||
         tag[1].includes('image') ||
         tag[1].includes('img')))
      .map(tag => tag[1]);

    if (rTags.length > 0) {
      images = rTags;
    } else {
      // 3. Check for custom image tags (featuredImageUrl, screenshotsUrls, etc.)
      const featuredImage = event.tagValue('featuredImageUrl');
      if (featuredImage) {
        images.push(featuredImage);
      }

      const screenshotsTag = event.tags.find(tag => tag[0] === 'screenshotsUrls');
      if (screenshotsTag) {
        images.push(...screenshotsTag.slice(1));
      }

      // 4. Other fallbacks
      const imgUrl = event.tagValue('imgUrl');
      if (imgUrl) images.push(imgUrl);
    }
  }

  return {
    id: event.id,
    title,
    summary,
    content: event.content,
    author: event.pubkey,
    publishedAt: publishedAt ? parseInt(publishedAt) : event.created_at,
    location,
    price,
    status,
    categories,
    images,
    event
  };
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