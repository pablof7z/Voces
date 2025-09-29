import { Link } from 'react-router-dom';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/stores/messagesStore';
import { cn } from '@/lib/utils';

interface ConversationListItemProps {
  conversation: Conversation;
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const profile = useProfile(conversation.pubkey);

  const displayName = profile?.name || profile?.displayName || conversation.pubkey.slice(0, 8);
  const lastMessagePreview = conversation.lastMessage?.content.slice(0, 50) || 'No messages yet';
  const timeAgo = conversation.lastMessageAt
    ? formatDistanceToNow(conversation.lastMessageAt * 1000, { addSuffix: true })
    : '';

  return (
    <Link
      to={`/messages/${conversation.pubkey}`}
      className="block hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
    >
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-shrink-0">
          {profile?.picture ? (
            <img
              src={profile.picture}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {conversation.unreadCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                'font-semibold truncate',
                conversation.unreadCount > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              {displayName}
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0 ml-2">
              {timeAgo}
            </span>
          </div>
          <p
            className={cn(
              'text-sm truncate',
              conversation.unreadCount > 0
                ? 'text-neutral-900 dark:text-white font-medium'
                : 'text-neutral-600 dark:text-neutral-400'
            )}
          >
            {lastMessagePreview}
          </p>
        </div>
      </div>
    </Link>
  );
}