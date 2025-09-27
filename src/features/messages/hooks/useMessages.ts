import { useEffect, useMemo } from 'react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import type NDK from '@nostr-dev-kit/ndk';
import { NDKKind, NDKEvent, giftUnwrap, giftWrap, NDKRelaySet } from '@nostr-dev-kit/ndk';
import { useMessagesStore } from '@/stores/messagesStore';
import type { Message } from '@/stores/messagesStore';

const EMPTY_MESSAGES: Message[] = [];

export function useMessages() {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const { addMessage } = useMessagesStore();

  useEffect(() => {
    if (!ndk || !currentUser) return;

    const sub = ndk.subscribe([
      {
        kinds: [NDKKind.GiftWrap],
        '#p': [currentUser.pubkey],
      },
    ],
    {
        closeOnEose: false,
        subId: `gift-wraps-${currentUser.pubkey}`
      }
    );

    sub.on('event', async (giftWrapEvent) => {
      console.log(giftWrapEvent)
      try {
        const rumor = await giftUnwrap(giftWrapEvent);
        console.log(rumor)

        if (rumor.kind === 14) {
          const isOutgoing = rumor.pubkey === currentUser.pubkey;
          const conversationPubkey = isOutgoing
            ? rumor.tags.find(tag => tag[0] === 'p')?.[1]
            : rumor.pubkey;

          if (!conversationPubkey) return;

          const message: Message = {
            id: rumor.id || giftWrapEvent.id,
            pubkey: rumor.pubkey,
            content: rumor.content,
            created_at: rumor.created_at || Date.now() / 1000,
            event: rumor,
          };

          addMessage(conversationPubkey, message);
        }
      } catch (error) {
        console.error('Error unwrapping gift wrap:', error);
      }
    });

    return () => {
      sub.stop();
    };
  }, [ndk, currentUser, addMessage]);
}

export function useConversationMessages(conversationPubkey: string | undefined) {
  const messages = useMessagesStore((state) =>
    conversationPubkey ? state.messages.get(conversationPubkey) ?? EMPTY_MESSAGES : EMPTY_MESSAGES
  );
  const markAsRead = useMessagesStore((state) => state.markConversationAsRead);

  useEffect(() => {
    if (conversationPubkey) {
      markAsRead(conversationPubkey);
    }
  }, [conversationPubkey, markAsRead]);

  return messages;
}

export function useConversations() {
  const conversations = useMessagesStore((state) => state.conversations);

  return useMemo(
    () => Array.from(conversations.values()).sort(
      (a, b) => b.lastMessageAt - a.lastMessageAt
    ),
    [conversations]
  );
}

export async function checkDMRelays(ndk: NDK, pubkey: string): Promise<string[] | null> {
  const events = await ndk.fetchEvents({
    kinds: [10050],
    authors: [pubkey],
  });

  const event = Array.from(events)[0];
  if (!event) return null;

  const relays = event.tags
    .filter(tag => tag[0] === 'relay')
    .map(tag => tag[1]);

  return relays.length > 0 ? relays : null;
}

export async function sendMessage(
  ndk: NDK,
  recipientPubkey: string,
  content: string
) {
  if (!ndk.activeUser) {
    throw new Error('No active user');
  }

  const dmRelays = await checkDMRelays(ndk, recipientPubkey);
  if (!dmRelays) {
    throw new Error('Recipient is not reachable for DMs (no kind 10050 relay list)');
  }

  const recipientUser = ndk.getUser({ pubkey: recipientPubkey });
  const senderUser = ndk.activeUser;

  const messageEvent = new NDKEvent(ndk);
  messageEvent.kind = 14;
  messageEvent.content = content;
  messageEvent.tags = [['p', recipientPubkey]];

  await messageEvent.sign();

  const giftWrapToRecipient = await giftWrap(messageEvent, recipientUser);
  const giftWrapToSelf = await giftWrap(messageEvent, senderUser);

  const dmRelaySet = NDKRelaySet.fromRelayUrls(dmRelays, ndk);

  await Promise.all([
    giftWrapToRecipient.publish(dmRelaySet),
    giftWrapToSelf.publish()
  ]);

  return messageEvent;
}