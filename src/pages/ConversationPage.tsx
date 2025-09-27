import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNDKCurrentUser, useProfile } from '@nostr-dev-kit/ndk-hooks';
import { useConversationMessages } from '@/features/messages/hooks/useMessages';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import { ComposeDM } from '@/features/messages/components/ComposeDM';

export function ConversationPage() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const navigate = useNavigate();
  const currentUser = useNDKCurrentUser();
  const profile = useProfile(pubkey);
  const messages = useConversationMessages(pubkey);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUser || !pubkey) {
    return null;
  }

  const displayName = profile?.name || profile?.displayName || pubkey.slice(0, 8);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate('/messages')}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>

          <div className="flex items-center gap-3 flex-1">
            {profile?.picture ? (
              <img
                src={profile.picture}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h2>
              {profile?.nip05 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.nip05}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ComposeDM recipientPubkey={pubkey} />
    </div>
  );
}