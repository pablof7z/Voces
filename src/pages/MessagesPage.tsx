import { useMessagesStore } from '@/stores/messagesStore';
import { ConversationListItem } from '@/features/messages/components/ConversationListItem';
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function MessagesPage() {
  const { t } = useTranslation();
  const conversations = Array.from(useMessagesStore((state) => state.conversations.values()))
    .sort((a, b) => (b.lastMessage?.event.created_at || 0) - (a.lastMessage?.event.created_at || 0));

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-semibold">{t('messages.title')}</h1>
        <Link to="/messages/new" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900">
          <Edit className="w-5 h-5" />
        </Link>
      </header>
      <main>
        {conversations.length > 0 ? (
          conversations.map(convo => <ConversationListItem key={convo.id} conversation={convo} />)
        ) : (
          <p className="p-8 text-center text-gray-500">{t('messages.noMessages')}</p>
        )}
      </main>
    </div>
  );
}