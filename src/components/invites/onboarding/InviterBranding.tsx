import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

interface InviterBrandingProps {
  inviter: NDKUserProfile;
}

export function InviterBranding({ inviter }: InviterBrandingProps) {
  const imageUrl = inviter.picture || inviter.image;
  const displayName = inviter.name || inviter.displayName || 'Anonymous';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center text-center mb-8">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={displayName}
          className="w-24 h-24 mb-4 border-4 border-white shadow-lg rounded-full object-cover bg-neutral-100 dark:bg-neutral-900"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-24 mb-4 border-4 border-white shadow-lg rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-medium text-2xl">
          {initials}
        </div>
      )}
      <h1 className="text-3xl font-bold">Welcome to Voces</h1>
      <p className="text-lg text-neutral-600 mt-2">
        <span className="font-semibold">{displayName}</span> has invited you to join.
      </p>
    </div>
  );
}