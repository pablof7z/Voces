import { useState } from 'react';
import { Send } from 'lucide-react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { sendMessage } from '../hooks/useMessages';
import { useMessagesStore } from '@/stores/messagesStore';
import { cn } from '@/lib/utils';

interface ComposeDMProps {
  recipientPubkey: string;
}

export function ComposeDM({ recipientPubkey }: ComposeDMProps) {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const { addMessage } = useMessagesStore();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !ndk || !currentUser || isSending) return;

    setIsSending(true);
    try {
      const messageEvent = await sendMessage(ndk, recipientPubkey, message.trim());

      addMessage(recipientPubkey, {
        id: messageEvent.id,
        pubkey: currentUser.pubkey,
        content: messageEvent.content,
        created_at: messageEvent.created_at || Date.now() / 1000,
        event: messageEvent,
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSending}
          className={cn(
            'flex-1 resize-none rounded-2xl px-4 py-3 text-sm',
            'bg-gray-100 dark:bg-black text-gray-900 dark:text-white',
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-purple-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[44px] max-h-[120px]'
          )}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full',
            'bg-purple-600 text-white',
            'hover:bg-purple-700 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex-shrink-0'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}