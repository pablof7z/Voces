import type { Conversation } from '@/stores/messagesStore';
import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useNDKCurrentUser, useProfile } from '@nostr-dev-kit/ndk-hooks';

export function ConversationListItem({ conversation }: { conversation: Conversation }) {
  const currentUser = useNDKCurrentUser();
  const otherParticipants = conversation.participants.filter(p => p.pubkey !== currentUser?.pubkey);
  const otherParticipant = otherParticipants[0];
  const profile = useProfile(otherParticipant?.pubkey);
  const participantNames = otherParticipants.map(p => profile?.name || p.pubkey.substring(0, 8)).join(', ');

  return (
    <Link to={`/messages/${conversation.id}`} className="block hover:bg-gray-50 dark:hover:bg-neutral-900/50">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <UserAvatar pubkey={otherParticipant?.pubkey} size="lg" />
        <div className="flex-1 ml-4 min-w-0">
          <div className="flex justify-between">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{participantNames}</p>
            {conversation.lastMessage && (
              <time className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                {new Date(conversation.lastMessage.event.created_at! * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {conversation.lastMessage?.text || '...'}
          </p>
        </div>
      </div>
    </Link>
  );
}