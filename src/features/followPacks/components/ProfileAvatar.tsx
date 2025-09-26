import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  pubkey: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ProfileAvatar({
  pubkey,
  size = 'sm',
  showName = false,
  className,
  style
}: ProfileAvatarProps) {
  const profile = useProfile(pubkey);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={cn("flex items-center gap-3", className)} style={style}>
      <div className={cn(
        "rounded-full border-2 border-white dark:border-gray-950 overflow-hidden",
        sizeClasses[size]
      )}>
        {profile?.picture ? (
          <img
            src={profile.picture}
            alt={profile?.name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={cn(
            "w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold",
            sizeClasses[size]
          )}>
            {(profile?.name || 'A')[0].toUpperCase()}
          </div>
        )}
      </div>
      {showName && (
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {profile?.name || 'Anonymous'}
          </p>
          {profile?.nip05 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{profile.nip05}
            </p>
          )}
        </div>
      )}
    </div>
  );
}