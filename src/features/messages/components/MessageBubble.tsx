import type { DecryptedMessage } from '@/features/messages/utils/nip17';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { cn } from '@/lib/utils';

export function MessageBubble({ message }: { message: DecryptedMessage }) {
  const currentUser = useNDKCurrentUser();
  const isMe = message.sender.pubkey === currentUser?.pubkey;

  return (
    <div className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-xs md:max-w-md px-3 py-2 rounded-2xl", isMe ? "bg-purple-600 text-white rounded-br-lg" : "bg-gray-200 dark:bg-neutral-800 rounded-bl-lg")}>
        <p className="text-base break-words">{message.text}</p>
      </div>
    </div>
  );
}