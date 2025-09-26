import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { NDKFollowPack } from '@nostr-dev-kit/ndk-hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFollowPacks, useSubscribedFollowPacks } from '@/features/followPacks/hooks/useFollowPacks';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import { ProfileAvatar } from '@/features/followPacks/components/ProfileAvatar';
import { mockFollowPacks } from '@/features/followPacks/mockData';

export function FollowPacksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { packs } = useFollowPacks();
  const subscribedPacks = useSubscribedFollowPacks();

  // Use mock data if no packs from relays
  const displayPacks = packs.length > 0 ? packs : mockFollowPacks as any[];

  // Filter packs based on search
  const filteredPacks = displayPacks.filter(pack => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return pack.title.toLowerCase().includes(search) ||
           (pack.description && pack.description.toLowerCase().includes(search));
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

      {/* Search */}
      <div className="mb-6">
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

function PackCard({ pack }: { pack: NDKFollowPack }) {
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
      to={`/packs/${pack.encode()}`}
      className="block bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors group"
    >
      {/* Image */}
      {pack.image && (
        <div className="h-32 w-full">
          <img
            src={pack.image}
            alt={pack.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content padding wrapper */}
      <div className="p-5">
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
      </div>
    </Link>
  );
}