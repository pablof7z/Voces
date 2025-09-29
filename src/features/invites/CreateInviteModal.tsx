import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseButton } from '@/components/invites/CloseButton';
import { ModalHeader } from '@/components/invites/ModalHeader';
import { User, Zap, Copy, Check } from 'lucide-react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';

interface CreateInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_WELCOME_MESSAGE = `Welcome to Voces! 🎉

I'm inviting you to join Voces, a new kind of social network where you own your identity and content. No algorithms, no ads, just authentic connections.

Looking forward to connecting with you on the open social web!`;

export function CreateInviteModal({ isOpen, onClose }: CreateInviteModalProps) {
  const { ndk } = useNDK();
  const user = useNDKCurrentUser();
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME_MESSAGE);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [cashuAmount, setCashuAmount] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateInvite = async () => {
    if (!ndk || !user) return;

    setIsGenerating(true);

    try {
      // Create invite event
      const inviteEvent = new NDKEvent(ndk);
      inviteEvent.kind = 420;
      inviteEvent.content = JSON.stringify({
        welcomeMessage,
        recipientName: isPersonalized ? recipientName : undefined,
        cashuToken: isPersonalized && cashuAmount ? `cashu:${cashuAmount}` : undefined,
        createdAt: Date.now(),
        inviter: user.pubkey
      });
      inviteEvent.tags = [
        ['p', user.pubkey],
        ['client', 'voces']
      ];

      await inviteEvent.sign();
      await inviteEvent.publish();

      // Generate invite link
      const inviteId = inviteEvent.id;
      const link = `${window.location.origin}/invite/${inviteId}`;
      setInviteLink(link);
    } catch (error) {
      console.error('Failed to generate invite:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    // Reset form
    setWelcomeMessage(DEFAULT_WELCOME_MESSAGE);
    setIsPersonalized(false);
    setRecipientName('');
    setCashuAmount('');
    setInviteLink('');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-lg relative p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={handleClose} />
            <ModalHeader
              title="Create an Invite"
              subtitle="Invite someone to join Voces with a personal message"
            />

            {!inviteLink ? (
              <div className="space-y-6">
                {/* Welcome Message */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl
                             bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                             focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Write a welcome message..."
                  />
                </div>

                {/* Personalization Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="personalize"
                    checked={isPersonalized}
                    onChange={(e) => setIsPersonalized(e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-neutral-300 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="personalize"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Personalize this invite
                  </label>
                </div>

                {/* Personalization Options */}
                {isPersonalized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-l-4 border-orange-500 pl-4"
                  >
                    <div>
                      <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        <User className="w-4 h-4 mr-2" />
                        Recipient's Name
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl
                                 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        <Zap className="w-4 h-4 mr-2" />
                        Include Cashu Token (sats)
                      </label>
                      <input
                        type="number"
                        value={cashuAmount}
                        onChange={(e) => setCashuAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl
                                 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Amount in sats (optional)"
                      />
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Add sats to help them get started on Nostr
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Generate Button */}
                <button
                  onClick={generateInvite}
                  disabled={isGenerating || !welcomeMessage.trim()}
                  className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400
                           text-white font-semibold rounded-xl transition-colors
                           disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Generating Invite...
                    </>
                  ) : (
                    'Generate Invite Link'
                  )}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full
                                flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Invite Created!
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {isPersonalized && recipientName ?
                      `Your personalized invite for ${recipientName} is ready` :
                      'Your invite link is ready to share'}
                  </p>
                </div>

                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-neutral-700 dark:text-neutral-300
                               outline-none truncate"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white
                               rounded-lg transition-colors flex items-center space-x-1 text-sm"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setInviteLink('')}
                    className="flex-1 py-2.5 px-4 border border-neutral-300 dark:border-neutral-700
                             text-neutral-700 dark:text-neutral-300 font-medium rounded-xl
                             hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    Create Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700
                             text-white font-medium rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}