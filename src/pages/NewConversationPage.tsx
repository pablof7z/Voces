import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { getConversationId } from '@/features/messages/utils/nip17';
import { ArrowLeft } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useTranslation } from 'react-i18next';

export function NewConversationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useNDKCurrentUser();
  const [recipientNpub, setRecipientNpub] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    try {
      if (!currentUser) throw new Error(t('messages.mustBeLoggedIn'));
      const { type, data: pubkey } = nip19.decode(recipientNpub);
      if (type !== 'npub') throw new Error(t('messages.invalidNpub'));
      const conversationId = getConversationId([currentUser.pubkey, pubkey as string]);
      navigate(`/messages/${conversationId}`);
    } catch (e: any) {
      setError(e.message || t('messages.invalidNpub'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{t('messages.newMessage')}</h1>
      </header>
      <main className="p-4 space-y-4">
        <input
          id="recipient"
          value={recipientNpub}
          onChange={(e) => setRecipientNpub(e.target.value)}
          placeholder={t('messages.enterRecipient')}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-purple-500"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!recipientNpub.trim()}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {t('messages.next')}
          </button>
        </div>
      </main>
    </div>
  );
}