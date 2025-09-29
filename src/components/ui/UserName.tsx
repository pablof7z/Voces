import { useProfile } from '@nostr-dev-kit/ndk-hooks';

interface UserNameProps {
  pubkey: string;
  className?: string;
  showNpub?: boolean;
}

export function UserName({ pubkey, className = '', showNpub = true }: UserNameProps) {
  const profile = useProfile(pubkey);

  const displayName = profile?.displayName || profile?.name;
  const npubShort = pubkey ? `${pubkey.slice(0, 8)}...` : '';

  if (!displayName && showNpub) {
    return <span className={className}>{npubShort}</span>;
  }

  return <span className={className}>{displayName || 'Anonymous'}</span>;
}