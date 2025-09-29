import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '@/stores/messagesStore';
import { cn } from '@/lib/utils';
import { ContentRenderer } from '@/components/content/ContentRenderer';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const currentUser = useNDKCurrentUser();
  const isOwnMessage = currentUser?.pubkey === message.pubkey;
  const timeAgo = formatDistanceToNow(message.created_at * 1000, { addSuffix: true });

  return (
    <div
      className={cn(
        'flex mb-4',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwnMessage
            ? 'bg-orange-600 text-white rounded-br-sm'
            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-bl-sm'
        )}
      >
        <ContentRenderer
          content={message.content.trim()}
          emojiTags={message.event.tags}
          className="text-sm"
        />
        <div
          className={cn(
            'text-xs mt-1',
            isOwnMessage ? 'text-orange-100' : 'text-neutral-500 dark:text-neutral-400'
          )}
        >
          {timeAgo}
        </div>
      </div>
    </div>
  );
}