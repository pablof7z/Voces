import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNDKCurrentUser, NDKFollowPack, useProfileValue } from '@nostr-dev-kit/ndk-hooks';
import { cn } from '@/lib/utils';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import { ProfileAvatar } from './ProfileAvatar';

interface FollowPackCardProps {
  pack: NDKFollowPack;
  variant?: 'default' | 'compact';
}

export function FollowPackCard({ pack, variant = 'default' }: FollowPackCardProps) {
  const navigate = useNavigate();
  const currentUser = useNDKCurrentUser();
  const { toggleFavorite, isFavorite } = useFollowPacksStore();
  const creatorProfile = useProfileValue(pack.pubkey);

  // Get preview pubkeys (first 5 users)
  const previewPubkeys = pack.pubkeys?.slice(0, 5) || [];

  // Check if current user is in the pack
  const currentUserInPack = currentUser && pack.pubkeys?.includes(currentUser.pubkey);
  const isCreator = currentUser && pack.pubkey && pack.pubkey === currentUser.pubkey;

  const favorited = isFavorite(pack.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    toggleFavorite(pack.id);
  };

  const handleCardClick = () => {
    navigate(`/packs/${pack.encode()}`);
  };

  if (variant === 'compact') {
    return (
      <div
        className="flex gap-4 p-4 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image on left */}
        {pack.image ? (
          <img
            src={pack.image}
            alt={pack.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📦</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {pack.title}
          </h4>
          {pack.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {pack.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pack.pubkeys?.length || 0} members
            </span>
            {/* Member preview avatars */}
            <div className="flex -space-x-1">
              {previewPubkeys.slice(0, 4).map((pubkey, index) => (
                <ProfileAvatar
                  key={pubkey}
                  pubkey={pubkey}
                  size="xs"
                  style={{ zIndex: 4 - index }}
                />
              ))}
              {(pack.pubkeys?.length || 0) > 4 && (
                <div className="w-5 h-5 rounded-full border border-white dark:border-black bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[9px] font-medium text-gray-600 dark:text-gray-300">
                  +{(pack.pubkeys?.length || 0) - 4}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorite button */}
        {currentUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite(e);
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              favorited
                ? "text-red-600 dark:text-red-400"
                : "hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400"
            )}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("w-4 h-4", favorited && "fill-current")} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
    >
      {/* Fixed height header image */}
      {pack.image && (
        <div className="h-32 bg-gray-100 dark:bg-black">
          <img
            src={pack.image}
            alt={pack.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content area with fixed layout */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title and member count - fixed position */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {pack.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{pack.pubkeys?.length || 0} members</span>
            <span>•</span>
            <span>
              {isCreator
                ? 'by you'
                : currentUserInPack
                  ? `with you and @${creatorProfile?.name || creatorProfile?.displayName || pack.pubkey?.slice(0, 8) || 'unknown'}`
                  : `by @${creatorProfile?.name || creatorProfile?.displayName || pack.pubkey?.slice(0, 8) || 'unknown'}`
              }
            </span>
          </div>
        </div>

        {/* Description - fixed height area */}
        <div className="h-12 mb-4">
          {pack.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {pack.description}
            </p>
          )}
        </div>

        {/* User avatars preview - always at bottom */}
        <div className="mt-auto">
          <div className="flex -space-x-2">
            {previewPubkeys.map((pubkey, index) => (
              <ProfileAvatar
                key={pubkey}
                pubkey={pubkey}
                size="sm"
                style={{ zIndex: 5 - index }}
              />
            ))}
            {(pack.pubkeys?.length || 0) > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-black flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                +{(pack.pubkeys?.length || 0) - 5}
              </div>
            )}
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFavorite(e);
          }}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-lg transition-colors bg-white/90 dark:bg-black/90 backdrop-blur-sm",
            favorited
              ? "text-red-600 dark:text-red-400"
              : "hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-500"
          )}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("w-4 h-4", favorited && "fill-current")} />
        </button>
      </div>
    </div>
  );
}