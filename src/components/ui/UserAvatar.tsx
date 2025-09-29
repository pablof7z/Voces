import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { cn } from '@/lib/utils';
import { useWoTScore } from '@/hooks/useWoT';
import { CheckCircle2 } from 'lucide-react';

interface UserAvatarProps {
  pubkey?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTrustIndicator?: boolean;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

const badgeSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

export function UserAvatar({ pubkey, size = 'md', className, showTrustIndicator = true }: UserAvatarProps) {
  const profile = useProfile(pubkey);
  const trustScore = useWoTScore(pubkey || '');

  // Try multiple image sources
  const imageUrl = profile?.picture || profile?.image || profile?.banner;
  const displayName = profile?.displayName || profile?.name || 'Anonymous';

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];

  const showBadge = showTrustIndicator && trustScore > 0;

  const avatarContent = imageUrl ? (
    <img
      src={imageUrl}
      alt={displayName}
      className={cn(
        'rounded-full object-cover bg-neutral-100 dark:bg-neutral-900',
        sizeClasses[size],
        className
      )}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  ) : (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold',
        colors[pubkey ? parseInt(pubkey.slice(0, 8), 16) % colors.length : 0],
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );

  if (!showBadge) {
    return avatarContent;
  }

  return (
    <div className="relative inline-block">
      {avatarContent}
      <div
        className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center',
          trustScore === 1.0
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 text-white',
          badgeSizeClasses[size]
        )}
      >
        <CheckCircle2 className="w-full h-full p-0.5" />
      </div>
    </div>
  );
}