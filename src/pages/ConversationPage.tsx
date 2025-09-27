import { useParams, useNavigate } from 'react-router-dom';
import { useMessagesStore } from '@/stores/messagesStore';
import { useNDK, useNDKCurrentUser, useProfile } from '@nostr-dev-kit/ndk-hooks';
import { ArrowLeft } from 'lucide-react';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import { ComposeDM } from '@/features/messages/components/ComposeDM';

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  let conversation = useMessagesStore((state) => state.conversations.get(conversationId!));

  if (!conversation && conversationId && currentUser && ndk) {
    const pubkeys = conversationId.split(',');
    const participants = pubkeys.map(pk => ndk.getUser({ pubkey: pk }));
    conversation = { id: conversationId, participants, messages: [], lastMessage: null, unreadCount: 0 };
  }

  if (!conversation) return <div>Loading...</div>;

  const otherParticipants = conversation.participants.filter(p => p.pubkey !== currentUser?.pubkey);
  const otherParticipant = otherParticipants[0];
  const profile = useProfile(otherParticipant?.pubkey);
  const headerTitle = otherParticipants.map(p => profile?.name || p.pubkey.substring(0, 8)).join(', ');

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate('/messages')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold truncate">{headerTitle}</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map(message => <MessageBubble key={message.event.id} message={message} />)}
      </main>
      <footer className="p-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <ComposeDM conversation={conversation} />
      </footer>
    </div>
  );
}