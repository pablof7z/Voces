import { useState } from 'react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { sendDirectMessage } from '@/features/messages/utils/nip17';
import type { Conversation } from '@/stores/messagesStore';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ComposeDM({ conversation }: { conversation: Conversation }) {
  const { t } = useTranslation();
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || !ndk?.signer || !currentUser) return;
    setIsSending(true);
    try {
      const recipients = conversation.participants.filter(p => p.pubkey !== currentUser.pubkey);
      await sendDirectMessage(ndk, ndk.signer, recipients, content);
      setContent('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('messages.messagePlaceholder')}
        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-neutral-800 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button
        onClick={handleSend}
        disabled={!content.trim() || isSending}
        className="p-3 bg-purple-600 text-white rounded-full disabled:opacity-50"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}