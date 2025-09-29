import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile, useNDK } from '@nostr-dev-kit/ndk-hooks';
import { nip19 } from 'nostr-tools';
import { checkDMRelays } from '@/features/messages/hooks/useMessages';

export function NewConversationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ndk } = useNDK();
  const [searchInput, setSearchInput] = useState('');
  const [resolvedPubkey, setResolvedPubkey] = useState<string | null>(null);
  const [isCheckingReachability, setIsCheckingReachability] = useState(false);
  const [isReachable, setIsReachable] = useState<boolean | null>(null);

  const profile = useProfile(resolvedPubkey || undefined);

  const handleSearch = () => {
    try {
      let pubkey: string | null = null;

      if (searchInput.startsWith('npub')) {
        const decoded = nip19.decode(searchInput);
        if (decoded.type === 'npub') {
          pubkey = decoded.data;
        }
      } else if (searchInput.match(/^[0-9a-f]{64}$/i)) {
        pubkey = searchInput.toLowerCase();
      }

      setResolvedPubkey(pubkey);
      setIsReachable(null);
    } catch (error) {
      console.error('Error decoding pubkey:', error);
      setResolvedPubkey(null);
      setIsReachable(null);
    }
  };

  useEffect(() => {
    if (!resolvedPubkey || !ndk) return;

    const checkReachability = async () => {
      setIsCheckingReachability(true);
      try {
        const dmRelays = await checkDMRelays(ndk, resolvedPubkey);
        setIsReachable(dmRelays !== null);
      } catch (error) {
        console.error('Error checking DM reachability:', error);
        setIsReachable(false);
      } finally {
        setIsCheckingReachability(false);
      }
    };

    checkReachability();
  }, [resolvedPubkey, ndk]);

  const handleStartConversation = () => {
    if (resolvedPubkey) {
      navigate(`/messages/${resolvedPubkey}`);
    }
  };

  const displayName = profile?.name || profile?.displayName || resolvedPubkey?.slice(0, 8);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate('/messages')}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('messages.newMessage')}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('messages.recipientLabel')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('messages.recipientPlaceholder')}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('messages.recipientHint')}
            </p>
          </div>

          {resolvedPubkey && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-black">
              <div className="flex items-center gap-3 mb-4">
                {profile?.picture ? (
                  <img
                    src={profile.picture}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </h3>
                  {profile?.nip05 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.nip05}
                    </p>
                  )}
                </div>
              </div>

              {isCheckingReachability && (
                <div className="mb-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('messages.checkingReachability')}
                  </p>
                </div>
              )}

              {!isCheckingReachability && isReachable === false && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {t('messages.notReachable')}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {t('messages.notReachableHint')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleStartConversation}
                disabled={isCheckingReachability || isReachable === false}
                className="w-full px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
              >
                {t('messages.startConversation')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}