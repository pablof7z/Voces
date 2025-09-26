import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFollowPacks, useSubscribedFollowPacks } from '@/features/followPacks/hooks/useFollowPacks';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import { ProfileAvatar } from '@/features/followPacks/components/ProfileAvatar';
import { cn } from '@/lib/utils';

export function FollowPacksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { packs } = useFollowPacks();
  const subscribedPacks = useSubscribedFollowPacks();

  // Filter packs based on search and category
  const filteredPacks = packs.filter(pack => {
    const matchesSearch = !searchQuery ||
      pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || (() => {
      const searchText = `${pack.title} ${pack.description}`.toLowerCase();
      switch (selectedCategory) {
        case 'tech':
          return /tech|dev|code|program|software/i.test(searchText);
        case 'bitcoin':
          return /bitcoin|btc|sats|lightning/i.test(searchText);
        case 'nostr':
          return /nostr|relay|nip/i.test(searchText);
        default:
          return true;
      }
    })();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Package className="w-8 h-8 text-purple-500" />
          Follow Packs
        </h1>
        <p className="text-neutral-400">
          Discover curated lists of accounts to follow
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search follow packs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('tech')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === 'tech'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            💻 Tech
          </button>
          <button
            onClick={() => setSelectedCategory('bitcoin')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === 'bitcoin'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            ₿ Bitcoin
          </button>
          <button
            onClick={() => setSelectedCategory('nostr')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === 'nostr'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            🟣 Nostr
          </button>
        </div>
      </div>

      {/* Your Subscribed Packs */}
      {subscribedPacks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Packs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscribedPacks.map(pack => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </div>
      )}

      {/* All Packs Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          {subscribedPacks.length > 0 ? 'Discover More' : 'Popular Packs'}
        </h2>
        {filteredPacks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPacks.map(pack => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">
              No follow packs found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface Pack {
  id: string;
  title: string;
  description: string;
  pubkeys: string[];
}

function PackCard({ pack }: { pack: Pack }) {
  const { isSubscribed, subscribeToPack, unsubscribeFromPack } = useFollowPacksStore();
  const subscribed = isSubscribed(pack.id);
  const previewPubkeys = pack.pubkeys.slice(0, 4);

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    if (subscribed) {
      unsubscribeFromPack(pack.id);
    } else {
      subscribeToPack(pack.id);
    }
  };

  return (
    <Link
      to={`/packs/${pack.id}`}
      className="block bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors group"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
          {pack.title}
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          {pack.pubkeys.length} members
        </p>
      </div>

      {/* Description */}
      {pack.description && (
        <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
          {pack.description}
        </p>
      )}

      {/* Member Avatars */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {previewPubkeys.map((pubkey: string, index: number) => (
            <div
              key={pubkey}
              className="relative"
              style={{ zIndex: 4 - index }}
            >
              <ProfileAvatar
                pubkey={pubkey}
                size="sm"
                className="ring-2 ring-neutral-900"
              />
            </div>
          ))}
          {pack.pubkeys.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-neutral-800 ring-2 ring-neutral-900 flex items-center justify-center">
              <span className="text-xs text-neutral-400">
                +{pack.pubkeys.length - 4}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubscribe}
          size="sm"
          variant={subscribed ? 'outline' : 'primary'}
          className="ml-2"
        >
          {subscribed ? 'Following' : 'Follow'}
        </Button>
      </div>
    </Link>
  );
}