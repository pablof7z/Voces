import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ListingGrid } from '@/features/classifieds/components/ListingGrid';
import { CategorySection } from '@/features/classifieds/components/CategorySection';
import { FilterButton } from '@/features/classifieds/components/FilterButton';
import { useListings } from '@/features/classifieds/hooks/useListings';
import { NDKClassified } from '@nostr-dev-kit/ndk';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'services', label: 'Services' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'free', label: 'Free' },
  { value: 'wanted', label: 'Wanted' }
];

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState('');

  const { listings } = useListings({
    category: selectedCategory || undefined
  });

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory) {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

  // Filter and group listings
  const { filteredListings, listingsByCategory } = useMemo(() => {
    // First filter by search query
    const filtered = listings.filter(listing => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.summary?.toLowerCase().includes(query) ||
        listing.content.toLowerCase().includes(query) ||
        listing.location?.toLowerCase().includes(query)
      );
    });

    // Group by category for the category sections view
    const byCategory = filtered.reduce<Record<string, NDKClassified[]>>((acc, listing) => {
      const categories = listing.tags.filter(t => t[0] === 't').map(t => t[1]);
      if (categories.length > 0) {
        categories.forEach(category => {
          const key = category.toLowerCase();
          if (!acc[key]) acc[key] = [];
          acc[key].push(listing);
        });
      } else {
        if (!acc['uncategorized']) acc['uncategorized'] = [];
        acc['uncategorized'].push(listing);
      }
      return acc;
    }, {});

    return { filteredListings: filtered, listingsByCategory: byCategory };
  }, [listings, searchQuery]);

  // Determine view mode
  const isFilteredView = selectedCategory || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4">
            Marketplace
          </h1>

          {/* Search and Filter Bar */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/80 dark:bg-black/80 backdrop-blur border-gray-200 dark:border-gray-700 rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <FilterButton
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Content */}
        {isFilteredView ? (
          // Filtered view - show grid
          <div>
            {selectedCategory && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredListings.length} listings found
                </p>
              </div>
            )}
            <ListingGrid listings={filteredListings} />
          </div>
        ) : (
          // Category sections view
          <div>
            {Object.keys(listingsByCategory).length === 0 ? (
              <ListingGrid listings={[]} />
            ) : (
              <>
                {/* Featured/Recent listings */}
                {listings.length > 0 && (
                  <CategorySection
                    category="Recent Listings"
                    listings={listings.slice(0, 10)}
                    showViewAll={false}
                  />
                )}

                {/* Category sections */}
                {CATEGORIES.filter(c => c.value && listingsByCategory[c.value]?.length > 0).map(category => (
                  <CategorySection
                    key={category.value}
                    category={category.value}
                    listings={listingsByCategory[category.value]}
                  />
                ))}

                {/* Uncategorized section */}
                {listingsByCategory['uncategorized']?.length > 0 && (
                  <CategorySection
                    category="Other"
                    listings={listingsByCategory['uncategorized']}
                    showViewAll={false}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}