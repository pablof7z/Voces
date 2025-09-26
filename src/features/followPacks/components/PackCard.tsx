import { Link } from 'react-router-dom';
import { Package, Users, Heart } from 'lucide-react';
import { NDKFollowPack, useNDKCurrentUser, useProfileValue } from '@nostr-dev-kit/ndk-hooks';
import { Button } from '@/components/ui/button';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import { ProfileAvatar } from './ProfileAvatar';
import { cn } from '@/lib/utils';

interface PackCardProps {
  pack: NDKFollowPack;
  variant?: 'default' | 'compact';
}

export function PackCard({ pack, variant = 'default' }: PackCardProps) {
  const { isSubscribed, subscribeToPack, unsubscribeFromPack, isFavorite, toggleFavorite } = useFollowPacksStore();
  const currentUser = useNDKCurrentUser();
  const creatorProfile = useProfileValue(pack.pubkey);
  const subscribed = isSubscribed(pack.id);
  const favorited = isFavorite(pack.id);
  const previewPubkeys = pack.pubkeys.slice(0, 5);

  // Check if current user is in the pack or is the creator
  const currentUserInPack = currentUser && pack.pubkeys.includes(currentUser.pubkey);
  const isCreator = currentUser && pack.pubkey === currentUser.pubkey;

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    if (subscribed) {
      unsubscribeFromPack(pack.id);
    } else {
      subscribeToPack(pack.id);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(pack.id);
  };

  if (variant === 'compact') {
    return (
      <Link
        to={`/packs/${pack.encode()}`}
        className="block bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-lg p-4 hover:border-purple-500/50 hover:bg-black/60 transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
              {pack.title}
            </h4>
            <p className="text-sm text-neutral-500">
              {pack.pubkeys.length} members • {
                isCreator
                  ? 'by you'
                  : currentUserInPack
                    ? `with you and @${creatorProfile?.name || creatorProfile?.displayName || pack.pubkey.slice(0, 8)}`
                    : `by @${creatorProfile?.name || creatorProfile?.displayName || pack.pubkey.slice(0, 8)}`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {previewPubkeys.slice(0, 3).map((pubkey: string, index: number) => (
                <ProfileAvatar
                  key={pubkey}
                  pubkey={pubkey}
                  size="xs"
                  className="border border-black/20"
                  style={{ zIndex: 3 - index }}
                />
              ))}
              {pack.pubkeys.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 border border-black/20 flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">
                    +{pack.pubkeys.length - 3}
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={handleSubscribe}
              size="sm"
              variant={subscribed ? 'ghost' : 'default'}
              className={cn(
                "min-w-[80px] h-7 text-xs",
                subscribed
                  ? "border border-purple-500/30 hover:bg-purple-500/10 text-purple-400"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              )}
            >
              {subscribed ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/packs/${pack.encode()}`}
      className="block bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:bg-black/60 transition-all duration-300 group relative"
    >
      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        className={cn(
          "absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all",
          favorited
            ? "bg-red-500/20 text-red-500"
            : "bg-black/50 text-white/50 hover:text-red-500 hover:bg-red-500/20"
        )}
      >
        <Heart className={cn("w-4 h-4", favorited && "fill-current")} />
      </button>

      {/* Image with gradient overlay */}
      {pack.image ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={pack.image}
            alt={pack.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Stats overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{pack.pubkeys.length}</span>
          </div>

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-bold text-2xl text-white mb-1 drop-shadow-lg">
              {pack.title}
            </h3>
          </div>
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-purple-600/10 via-purple-500/5 to-pink-600/10 flex items-center justify-center">
          <Package className="w-14 h-14 text-purple-500/30" />

          {/* Title for packs without image */}
          <div className="absolute bottom-3 left-5 right-5">
            <h3 className="font-bold text-lg text-white truncate">
              {pack.title}
            </h3>
            <p className="text-sm text-neutral-400">
              {pack.pubkeys.length} members • {
                isCreator
                  ? 'by you'
                  : currentUserInPack
                    ? `with you and @${creatorProfile?.name || creatorProfile?.displayName || pack.pubkey.slice(0, 8)}`
                    : `by @${creatorProfile?.name || creatorProfile?.displayName || pack.pubkey.slice(0, 8)}`
              }
            </p>
          </div>
        </div>
      )}

      {/* Content padding wrapper */}
      <div className="p-5 pt-3">
        {/* Description - show for all cards if exists */}
        {pack.description && (
          <p className="text-sm text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
            {pack.description}
          </p>
        )}

        {/* Member Avatars and Follow Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            {previewPubkeys.map((pubkey: string, index: number) => (
              <div
                key={pubkey}
                className="relative hover:z-10 transition-all hover:scale-110"
                style={{ zIndex: 5 - index }}
              >
                <ProfileAvatar
                  pubkey={pubkey}
                  size="sm"
                  className="border-2 border-black/20"
                />
              </div>
            ))}
            {pack.pubkeys.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-black/20 flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  +{pack.pubkeys.length - 5}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubscribe}
            size="sm"
            variant={subscribed ? 'ghost' : 'default'}
            className={cn(
              "min-w-[90px] transition-all",
              subscribed
                ? "border border-purple-500/30 hover:bg-purple-500/10 text-purple-400"
                : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/20"
            )}
          >
            {subscribed ? 'Following' : 'Follow'}
          </Button>
        </div>
      </div>
    </Link>
  );
}