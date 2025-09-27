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
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
        )}
      >
        <ContentRenderer
          content={message.content}
          emojiTags={message.event.tags}
          className="text-sm"
        />
        <div
          className={cn(
            'text-xs mt-1',
            isOwnMessage ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {timeAgo}
        </div>
      </div>
    </div>
  );
}