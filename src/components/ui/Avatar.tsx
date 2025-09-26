import { cn } from '@/lib/utils';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';

interface AvatarProps {
  pubkey?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ pubkey, size = 'md', className, fallback }: AvatarProps) {
  const profile = useProfile(pubkey);
  const imageUrl = profile?.image || profile?.picture;
  const displayName = profile?.displayName || profile?.name || fallback || '?';
  const initials = displayName.slice(0, 2).toUpperCase();

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
      />
    );
  }

  // Minimal, monochrome fallback
  return (
    <div
      className={cn(
        'rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-medium',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}