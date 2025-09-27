import { create } from 'zustand';
import { NDKUser } from '@nostr-dev-kit/ndk';
import type { DecryptedMessage } from '@/features/messages/utils/nip17';

export interface Conversation {
  id: string;
  participants: NDKUser[];
  messages: DecryptedMessage[];
  lastMessage: DecryptedMessage | null;
  unreadCount: number;
}

interface MessagesState {
  conversations: Map<string, Conversation>;
  addMessage: (message: DecryptedMessage) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  conversations: new Map(),
  addMessage: (message) => set((state) => {
    const newConversations = new Map(state.conversations);
    const { conversationId } = message;
    const existingConvo = newConversations.get(conversationId);

    if (existingConvo) {
      if (existingConvo.messages.some(m => m.event.id === message.event.id)) {
        return { conversations: newConversations };
      }
      const updatedMessages = [...existingConvo.messages, message]
        .sort((a, b) => (a.event.created_at || 0) - (b.event.created_at || 0));
      
      existingConvo.messages = updatedMessages;
      existingConvo.lastMessage = updatedMessages[updatedMessages.length - 1];
    } else {
      newConversations.set(conversationId, {
        id: conversationId,
        participants: [message.sender, ...message.recipients],
        messages: [message],
        lastMessage: message,
        unreadCount: 1,
      });
    }
    return { conversations: newConversations };
  }),
}));