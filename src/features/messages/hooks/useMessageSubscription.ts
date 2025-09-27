import { useEffect, useRef } from 'react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKEvent, NDKFilter, NDKSubscription } from '@nostr-dev-kit/ndk';
import { useMessagesStore } from '@/stores/messagesStore';
import { decryptReceivedEvent } from '@/features/messages/utils/nip17';

export const useMessageSubscription = () => {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const addMessage = useMessagesStore((state) => state.addMessage);
  const subscriptionRef = useRef<NDKSubscription | null>(null);

  useEffect(() => {
    if (!ndk || !currentUser?.pubkey || !ndk.signer) return;

    const processEvent = async (event: NDKEvent) => {
      const decrypted = await decryptReceivedEvent(ndk, event);
      if (decrypted) {
        addMessage(decrypted);
      }
    };

    const filter: NDKFilter = {
      kinds: [NDKKind.GiftWrap],
      '#p': [currentUser.pubkey],
      since: Math.floor(Date.now() / 1000) - 86400 * 7,
    };

    if (subscriptionRef.current) subscriptionRef.current.stop();
    
    const sub = ndk.subscribe(filter, { closeOnEose: false, groupable: false });
    subscriptionRef.current = sub;
    sub.on('event', processEvent);

    return () => sub.stop();
  }, [ndk, currentUser?.pubkey, addMessage]);
};