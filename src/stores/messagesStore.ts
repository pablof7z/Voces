import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

export interface Message {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  event: NDKEvent;
}

export interface Conversation {
  pubkey: string;
  lastMessage?: Message;
  lastMessageAt: number;
  unreadCount: number;
}

interface MessagesState {
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;

  addMessage: (conversationPubkey: string, message: Message) => void;
  setConversations: (conversations: Map<string, Conversation>) => void;
  markConversationAsRead: (conversationPubkey: string) => void;
  clearConversation: (conversationPubkey: string) => void;
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      conversations: new Map(),
      messages: new Map(),

      addMessage: (conversationPubkey: string, message: Message) => {
        set((state) => {
          const messages = new Map(state.messages);
          const conversationMessages = messages.get(conversationPubkey) || [];

          if (conversationMessages.some(m => m.id === message.id)) {
            return state;
          }

          const updatedMessages = [...conversationMessages, message].sort(
            (a, b) => a.created_at - b.created_at
          );
          messages.set(conversationPubkey, updatedMessages);

          const conversations = new Map(state.conversations);
          const conversation = conversations.get(conversationPubkey) || {
            pubkey: conversationPubkey,
            lastMessageAt: 0,
            unreadCount: 0,
          };

          conversations.set(conversationPubkey, {
            ...conversation,
            lastMessage: message,
            lastMessageAt: message.created_at,
            unreadCount: conversation.unreadCount + 1,
          });

          return { messages, conversations };
        });
      },

      setConversations: (conversations: Map<string, Conversation>) => {
        set({ conversations });
      },

      markConversationAsRead: (conversationPubkey: string) => {
        set((state) => {
          const conversations = new Map(state.conversations);
          const conversation = conversations.get(conversationPubkey);
          if (conversation) {
            conversations.set(conversationPubkey, {
              ...conversation,
              unreadCount: 0,
            });
          }
          return { conversations };
        });
      },

      clearConversation: (conversationPubkey: string) => {
        set((state) => {
          const messages = new Map(state.messages);
          const conversations = new Map(state.conversations);
          messages.delete(conversationPubkey);
          conversations.delete(conversationPubkey);
          return { messages, conversations };
        });
      },
    }),
    {
      name: 'voces-messages-storage',
      partialize: (state) => ({
        conversations: Array.from(state.conversations.entries()),
        messages: Array.from(state.messages.entries()),
      }),
      merge: (persistedState: { conversations?: [string, Conversation][]; messages?: [string, Message[]][] }, currentState) => {
        const conversationsArray = persistedState?.conversations || [];
        const messagesArray = persistedState?.messages || [];

        return {
          ...currentState,
          conversations: new Map(conversationsArray),
          messages: new Map(messagesArray),
        };
      },
    }
  )
);