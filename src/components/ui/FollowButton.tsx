import { useState } from 'react';
import { useNDK, useFollows, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser } from '@nostr-dev-kit/ndk';
import { Button } from './button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  pubkey: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function FollowButton({ 
  pubkey, 
  variant = 'default',
  size = 'default',
  showIcon = true,
  className 
}: FollowButtonProps) {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const follows = useFollows();
  const [isLoading, setIsLoading] = useState(false);

  const isFollowing = follows.has(pubkey);
  const isOwnProfile = currentUser?.pubkey === pubkey;

  // Don't show follow button on own profile
  if (isOwnProfile || !currentUser || !ndk) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (!ndk || !currentUser) return;

    setIsLoading(true);
    try {
      const targetUser = ndk.getUser({ pubkey });

      if (isFollowing) {
        // Unfollow
        await currentUser.unfollow(targetUser);
      } else {
        // Follow
        await currentUser.follow(targetUser);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          {showIcon && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )
          )}
          {isFollowing ? 'Unfollow' : 'Follow'}
        </>
      )}
    </Button>
  );
}