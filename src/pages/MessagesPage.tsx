import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { useMessages, useConversations } from '@/features/messages/hooks/useMessages';
import { ConversationListItem } from '@/features/messages/components/ConversationListItem';

export function MessagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useNDKCurrentUser();
  const conversations = useConversations();

  useMessages();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('messages.title')}
          </h1>
          <button
            onClick={() => navigate('/messages/new')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('messages.noConversations')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('messages.startConversation')}
            </p>
            <button
              onClick={() => navigate('/messages/new')}
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
            >
              {t('messages.newMessage')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.pubkey}
                conversation={conversation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}