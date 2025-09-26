import { useEvent, useProfile } from '@nostr-dev-kit/ndk-hooks';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

interface EmbeddedNoteProps {
  eventId: string;
}

export function EmbeddedNote({ eventId }: EmbeddedNoteProps) {
  const event = useEvent(eventId);
  const loading = !event;
  const error = false;
  const profile = useProfile(event?.author?.pubkey);

  if (loading) {
    return (
      <div className="my-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 animate-pulse">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !event) {
    return null;
  }

  const npub = event.author?.npub || (event.pubkey ? nip19.npubEncode(event.pubkey) : '');
  const displayName = profile?.name || profile?.displayName || 'Anonymous';
  const handle = profile?.nip05 ? `@${profile.nip05.split('@')[0]}` : `@${npub.slice(5, 12)}`;

  return (
    <div className="my-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900/70 transition-colors cursor-pointer"
         onClick={(e) => {
           e.stopPropagation();
           // Navigate to the note detail page when implemented
         }}>
      <div className="flex items-start gap-3">
        <Link to={`/p/${npub}`} onClick={(e) => e.stopPropagation()}>
          <UserAvatar
            pubkey={event.pubkey}
            size="sm"
            className="w-9 h-9"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <Link
              to={`/p/${npub}`}
              className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {displayName}
            </Link>
            <span className="text-neutral-500 dark:text-neutral-500">
              {handle}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <time className="text-neutral-500 dark:text-neutral-500 text-xs">
              {formatDistanceToNow(new Date(event.created_at! * 1000), { addSuffix: true })}
            </time>
          </div>

          <div className="mt-1">
            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
              {event.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}