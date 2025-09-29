import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NDKClassified } from '@nostr-dev-kit/ndk';
import { ListingCard } from './ListingCard';

interface CategorySectionProps {
  category: string;
  listings: NDKClassified[];
  showViewAll?: boolean;
}

export function CategorySection({ category, listings, showViewAll = true }: CategorySectionProps) {
  if (listings.length === 0) return null;

  const displayName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {displayName}
        </h2>
        {showViewAll && listings.length > 4 && (
          <Link
            to={`/marketplace?category=${category}`}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-300"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {listings.slice(0, 10).map((listing) => (
            <div
              key={listing.id}
              className="flex-none w-72 sm:w-80"
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}