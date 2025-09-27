import NDK, { NDKEvent, NDKKind, NDKUser, giftWrap, giftUnwrap } from "@nostr-dev-kit/ndk";
import type { NDKSigner } from "@nostr-dev-kit/ndk";

export interface DecryptedMessage {
  event: NDKEvent;
  text: string;
  sender: NDKUser;
  recipients: NDKUser[];
  conversationId: string;
}

export const getConversationId = (pubkeys: string[]): string => {
  return [...new Set(pubkeys)].sort().join(',');
};

export const sendDirectMessage = async (
  ndk: NDK,
  senderSigner: NDKSigner,
  recipients: NDKUser[],
  messageContent: string,
  replyToEvent?: NDKEvent
): Promise<void> => {
  if (!senderSigner.user) throw new Error("Signer does not have a user");
  
  const senderUser = await senderSigner.user();

  const directMessageRumor = new NDKEvent(ndk, {
    kind: NDKKind.PrivateDirectMessage,
    content: messageContent,
    pubkey: senderUser.pubkey,
    tags: recipients.map((recipient) => ['p', recipient.pubkey]),
  });

  if (replyToEvent) {
    directMessageRumor.tags.push(['e', replyToEvent.id, '', 'reply']);
    const rootTag = replyToEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
    directMessageRumor.tags.push(['e', rootTag ? rootTag[1] : replyToEvent.id, '', 'root']);
  }

  const allRecipients = [...new Set([...recipients, senderUser])];

  const publishPromises = allRecipients.map(async (recipient) => {
    const giftWrappedEvent = await giftWrap(directMessageRumor, recipient, senderSigner);
    if (giftWrappedEvent) {
      await giftWrappedEvent.publish();
    }
  });

  await Promise.all(publishPromises);
};

export const decryptReceivedEvent = async (
  ndk: NDK,
  giftWrappedEvent: NDKEvent,
): Promise<DecryptedMessage | null> => {
  if (giftWrappedEvent.kind !== NDKKind.GiftWrap || !ndk.signer) return null;

  try {
    const unwrappedRumorEvent = await giftUnwrap(giftWrappedEvent, undefined, ndk.signer);
    
    if (unwrappedRumorEvent.kind !== NDKKind.PrivateDirectMessage) return null;

    const messageSender = ndk.getUser({ pubkey: unwrappedRumorEvent.pubkey });
    const recipientPubkeys = unwrappedRumorEvent.getMatchingTags('p').map(tag => tag[1]);
    const messageRecipients = recipientPubkeys.map(pubkey => ndk.getUser({ pubkey }));
    const allParticipantPubkeys = [messageSender.pubkey, ...recipientPubkeys];

    return {
      event: unwrappedRumorEvent,
      text: unwrappedRumorEvent.content,
      sender: messageSender,
      recipients: messageRecipients,
      conversationId: getConversationId(allParticipantPubkeys),
    };
  } catch (error) {
    console.error(`Failed to decrypt NIP-17 message (event id: ${giftWrappedEvent.id})`, error);
    return null;
  }
};