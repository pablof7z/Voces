import { useState } from 'react';
import { Package, Plus, Search, Sparkles } from 'lucide-react';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FollowPackCard } from '@/features/followPacks/components/FollowPackCard';
import { useFollowPacks, useFollowPacksByCategory, useSubscribedFollowPacks } from '@/features/followPacks/hooks/useFollowPacks';
import { FOLLOW_PACK_CATEGORIES } from '@/features/followPacks/types';

export function FollowPacksSettings() {
  const currentUser = useNDKCurrentUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const subscribedPacks = useSubscribedFollowPacks();
  const categoryPacks = useFollowPacksByCategory(selectedCategory === 'all' ? undefined : selectedCategory);
  const { packs: userPacks } = useFollowPacks(currentUser?.pubkey);

  // Filter packs based on search query
  const filteredPacks = categoryPacks.filter(pack => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pack.title.toLowerCase().includes(query) ||
      pack.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Follow Packs
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Discover and manage curated lists of accounts to follow
        </p>
      </div>

      {/* Subscribed Packs */}
      {subscribedPacks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Your Subscribed Packs
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {subscribedPacks.map(pack => (
              <FollowPackCard key={pack.id} pack={pack} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Your Created Packs */}
      {userPacks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Your Created Packs
            </h3>
            <Button
              onClick={() => setShowCreateForm(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Pack
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {userPacks.map(pack => (
              <FollowPackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </div>
      )}

      {/* Discover Packs */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Discover Follow Packs
        </h3>

        {/* Search and Filter */}
        <div className="space-y-3 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search follow packs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {FOLLOW_PACK_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pack Grid */}
        {filteredPacks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPacks.map(pack => (
              <FollowPackCard key={pack.id} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No follow packs found matching your search'
                : 'No follow packs available in this category'}
            </p>
          </div>
        )}
      </div>

      {/* Create Pack Form (placeholder for now) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create Follow Pack</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Follow pack creation will be available soon!
            </p>
            <Button
              onClick={() => setShowCreateForm(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}