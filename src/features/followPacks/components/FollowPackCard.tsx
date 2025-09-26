import { useState } from 'react';
import { Heart, UserPlus, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNDKCurrentUser, NDKFollowPack } from '@nostr-dev-kit/ndk-hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import { ProfileAvatar } from './ProfileAvatar';

interface FollowPackCardProps {
  pack: NDKFollowPack;
  onSubscribe?: () => void;
  variant?: 'default' | 'compact';
}

export function FollowPackCard({ pack, onSubscribe, variant = 'default' }: FollowPackCardProps) {
  const navigate = useNavigate();
  const currentUser = useNDKCurrentUser();
  const { isSubscribed, subscribeToPack, unsubscribeFromPack, toggleFavorite, isFavorite } = useFollowPacksStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get preview pubkeys (first 5 users)
  const previewPubkeys = pack.pubkeys.slice(0, 5);

  const subscribed = isSubscribed(pack.id);
  const favorited = isFavorite(pack.id);

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    if (subscribed) {
      unsubscribeFromPack(pack.id);
    } else {
      subscribeToPack(pack.id);
      onSubscribe?.();
    }
  };

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
        className="p-4 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {pack.title}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pack.pubkeys.length} members
            </p>
          </div>
          <Button
            onClick={handleSubscribe}
            size="sm"
            variant={subscribed ? 'outline' : 'primary'}
            className="ml-4"
          >
            {subscribed ? 'Following' : 'Follow'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-6">
        {pack.image && (
          <div className="mb-4 -mt-6 -mx-6">
            <img
              src={pack.image}
              alt={pack.title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {pack.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {pack.pubkeys.length} members
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className={cn(
                "p-2 rounded-lg transition-colors",
                favorited
                  ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              )}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("w-4 h-4", favorited && "fill-current")} />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {pack.description}
        </p>

        {/* User avatars preview */}
        <div className="flex items-center mb-4">
          <div className="flex -space-x-2">
            {previewPubkeys.map((pubkey, index) => (
              <ProfileAvatar
                key={pubkey}
                pubkey={pubkey}
                size="sm"
                style={{ zIndex: 5 - index }}
              />
            ))}
            {pack.pubkeys.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-950 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                +{pack.pubkeys.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubscribe}
            variant={subscribed ? 'outline' : 'primary'}
            className="flex-1"
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

        {/* Expandable member list */}
        {pack.pubkeys.length > 5 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-3 inline-block"
          >
            {isExpanded ? 'Show less' : `View all ${pack.pubkeys.length} members`}
          </button>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pack.pubkeys.map((pubkey) => (
                <ProfileAvatar
                  key={pubkey}
                  pubkey={pubkey}
                  size="md"
                  showName={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}