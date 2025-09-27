import { NDKClassified } from '@nostr-dev-kit/ndk';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: NDKClassified[];
}

export function ListingGrid({ listings }: ListingGridProps) {

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-500 dark:text-gray-400">
          No listings found. Be the first to post something!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}