import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  pubkey?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

export function UserAvatar({ pubkey, size = 'md', className }: UserAvatarProps) {
  const profile = useProfile(pubkey);

  // Try multiple image sources
  const imageUrl = profile?.picture || profile?.image || profile?.banner;
  const displayName = profile?.displayName || profile?.name || 'Anonymous';

  // Generate initials from name
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  if (imageUrl) {
    return (
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
          // Hide broken images
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  // Consistent color based on pubkey for fallback
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];

  const colorIndex = pubkey ?
    parseInt(pubkey.slice(0, 8), 16) % colors.length :
    0;

  const bgColor = colors[colorIndex];

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold',
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}