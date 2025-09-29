import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ContentRenderer } from '@/components/content/ContentRenderer';

interface CommentCardProps {
  event: NDKEvent;
}

export function CommentCard({ event }: CommentCardProps) {
  const profile = useProfile(event.pubkey);
  const displayName = profile?.name || profile?.displayName || 'Anonymous';

  return (
    <div className="group">
      <div className="flex gap-3">
        <UserAvatar
          pubkey={event.pubkey}
          size="md"
          className="w-10 h-10 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white">
              {displayName}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {event.created_at && formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true })}
            </span>
          </div>
          <ContentRenderer
            content={event.content}
            emojiTags={event.tags}
            className="text-gray-800 dark:text-gray-200 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}