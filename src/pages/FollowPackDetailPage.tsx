import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Heart, UserPlus, UserMinus, Calendar } from 'lucide-react';
import { useNDKCurrentUser, useSubscribe, NDKKind, useProfileValue, useEvent, NDKFollowPack } from '@nostr-dev-kit/ndk-hooks';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/features/feed/NoteCard';
import { ProfileAvatar } from '@/features/followPacks/components/ProfileAvatar';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import { cn } from '@/lib/utils';

export function FollowPackDetailPage() {
  const { packId } = useParams<{ packId: string }>();
  const currentUser = useNDKCurrentUser();
  const [activeTab, setActiveTab] = useState<'feed' | 'members'>('feed');
  const { isSubscribed, subscribeToPack, unsubscribeFromPack, isFavorite, toggleFavorite } = useFollowPacksStore();

  // Get the event directly using the bech32 encoded ID
  const event = useEvent(packId || false, { subId: 'pack'});

  // Convert to NDKFollowPack
  const pack = useMemo(() => {
    if (!event) return null;
    return NDKFollowPack.from(event);
  }, [event]);

  // Extract pubkeys from the pack
  const pubkeys = useMemo(() => {
    if (!event) return [];
    return event.tags
      .filter(t => t[0] === 'p')
      .map(t => t[1]);
  }, [event]);

  // Get pack creator profile
  const creatorProfile = useProfileValue(pack?.pubkey);

  const subscribed = pack ? isSubscribed(pack.id) : false;
  const favorited = pack ? isFavorite(pack.id) : false;

  // Subscribe to notes from all pack members
  const { events: feedEvents } = useSubscribe(
    pubkeys.length > 0 && activeTab === 'feed' ? [{
      kinds: [NDKKind.Text],
      authors: pubkeys,
    }] : false
  );

  const handleSubscribe = () => {
    if (!pack || !currentUser) return;
    if (subscribed) {
      unsubscribeFromPack(pack.id);
    } else {
      subscribeToPack(pack.id);
    }
  };

  const handleFavorite = () => {
    if (!pack || !currentUser) return;
    toggleFavorite(pack.id);
  };

  if (!pack) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-neutral-400">Follow pack not found</p>
          <Link to="/packs" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            Browse all packs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/packs"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Follow Packs
      </Link>

      {/* Pack Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-6">
        {/* Pack Image */}
        {pack.image && (
          <div className="h-48 w-full">
            <img
              src={pack.image}
              alt={pack.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {pack.title}
              </h1>
              <p className="text-neutral-400">
                {pack.description || 'A curated list of accounts to follow'}
              </p>
            </div>
          <button
            onClick={handleFavorite}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              favorited
                ? "bg-red-500/10 text-red-500"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", favorited && "fill-current")} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2 text-neutral-400">
            <Users className="w-4 h-4" />
            <span>{pubkeys.length} members</span>
          </div>
          {pack.lastUpdated && (
            <div className="flex items-center gap-2 text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>Updated {new Date(pack.lastUpdated * 1000).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Creator */}
        {creatorProfile && (
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-800">
            <ProfileAvatar pubkey={pack.pubkey} size="md" />
            <div>
              <p className="text-sm text-neutral-500">Created by</p>
              <Link
                to={`/p/${pack.pubkey}`}
                className="font-medium text-white hover:text-purple-400 transition-colors"
              >
                {creatorProfile.name || 'Anonymous'}
              </Link>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleSubscribe}
          variant={subscribed ? 'outline' : 'primary'}
          className="w-full"
          disabled={!currentUser}
        >
          {subscribed ? (
            <>
              <UserMinus className="w-4 h-4 mr-2" />
              Unfollow Pack
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow Pack
            </>
          )}
        </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={cn(
              "pb-3 px-1 font-medium transition-colors relative",
              activeTab === 'feed'
                ? "text-white"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            Feed
            {activeTab === 'feed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "pb-3 px-1 font-medium transition-colors relative",
              activeTab === 'members'
                ? "text-white"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            Members ({pubkeys.length})
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'feed' ? (
        <div>
          {feedEvents.length > 0 ? (
            <div className="space-y-4">
              {feedEvents.map(event => (
                <NoteCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-400">
                No recent notes from pack members
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pubkeys.map(pubkey => (
            <MemberCard key={pubkey} pubkey={pubkey} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ pubkey }: { pubkey: string }) {
  const profile = useProfileValue(pubkey);

  return (
    <Link
      to={`/p/${pubkey}`}
      className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
    >
      <ProfileAvatar pubkey={pubkey} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {profile?.name || 'Anonymous'}
        </p>
        {profile?.nip05 && (
          <p className="text-sm text-neutral-500 truncate">
            {profile.nip05}
          </p>
        )}
        {profile?.about && (
          <p className="text-sm text-neutral-400 line-clamp-1 mt-1">
            {profile.about}
          </p>
        )}
      </div>
    </Link>
  );
}