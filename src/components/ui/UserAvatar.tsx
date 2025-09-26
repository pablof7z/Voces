import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { Avatar } from './Avatar';

interface UserAvatarProps {
  pubkey?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ pubkey, size = 'md', className }: UserAvatarProps) {
  const profile = useProfile(pubkey);

  if (!pubkey) {
    return <Avatar size={size} className={className} />;
  }

  return (
    <Avatar
      src={profile?.picture}
      alt={profile?.name || 'User'}
      name={profile?.name}
      size={size}
      className={className}
    />
  );
}