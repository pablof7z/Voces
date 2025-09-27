Executing plan command with query: Add support for NIP-17 Direct Messages with NIP-44 encryption and gift wraps using @nostr-dev-kit/ndk ^2.14.35. Include creating utilities for encryption/decryption, sending and receiving encrypted DMs, a UI component for viewing DM threads, and a compose UI for new DMsUsing file provider: gemini
Using file model: gemini-2.5-flash
Using thinking provider: gemini
Using thinking model: gemini-2.5-pro
Finding relevant files...
Running repomix to get file listing...
Found 138 files, approx 206516 tokens.
Fetching and extracting text from 3 document(s)...
Fetching from: https://github.com/nostr-protocol/nips/blob/master/17.md...
Successfully extracted content from: https://github.com/nostr-protocol/nips/blob/master/17.md
Fetching from: https://github.com/nostr-protocol/nips/blob/master/44.md...
Successfully extracted content from: https://github.com/nostr-protocol/nips/blob/master/44.md
Fetching from: https://github.com/nostr-protocol/nips/blob/master/59.md...
Successfully extracted content from: https://github.com/nostr-protocol/nips/blob/master/59.md
Successfully added content from 3 document(s) to the context.
Asking gemini to identify relevant files using model: gemini-2.5-flash with max tokens: 64000...
Found 23 relevant files:
local-research/nip17-current-state.md
local-research/nip17-implementation-plan.md
local-research/nip17-spec-details.md
package.json
src/main.tsx
src/App.tsx
src/config/auth.ts
src/features/auth/LoginModal.tsx
src/features/auth/useAutoLogin.ts
src/features/auth/utils/logout.ts
src/stores/settingsStore.ts
src/components/navigation/RelaySelector.tsx
src/components/navigation/NavItems.tsx
src/components/navigation/BottomNav.tsx
src/components/navigation/UserMenu.tsx
src/features/feed/ComposeNote.tsx
src/pages/ComposePage.tsx
src/features/feed/NoteCard.tsx
src/components/thread/ThreadNoteCard.tsx
src/pages/NoteDetailPage.tsx
src/lib/utils.ts
src/i18n/locales/en.json
src/i18n/locales/es.json

Extracting content from relevant files...
Generating plan using gemini with max tokens: 64000...

--- Implementation Plan ---
Here is a detailed, step-by-step implementation plan to add support for NIP-17 Direct Messages.

### Introduction

This plan outlines the implementation of NIP-17 for private direct messages, utilizing NIP-44 for encryption and NIP-59 for gift wrapping. We will leverage the `@nostr-dev-kit/ndk` library, which provides the necessary tools for encryption, decryption, and wrapping of Nostr events. The implementation is broken down into phases to facilitate development, testing, and integration.

The core flow for sending a message is as follows:
1.  Create an unsigned `kind: 14` (ChatMessage) event, known as a "rumor."
2.  For each recipient (including the sender for their own records), create a `kind: 13` "seal" event. The seal's content is the NIP-44 encrypted JSON of the rumor. The seal is signed by the sender.
3.  For each recipient, create a `kind: 1059` "gift wrap" event. The gift wrap's content is the NIP-44 encrypted JSON of the seal, encrypted with a one-time key. The gift wrap is signed by this ephemeral key and tagged with the recipient's public key (`p` tag).
4.  Publish each `kind: 1059` event to the appropriate relays.

NDK's `NDKEvent.wrap()` and `NDKEvent.unwrap()` methods abstract away much of this complexity.

---

### Phase 1: Core Logic & Utilities

This phase focuses on creating the foundational logic for sending and receiving NIP-17 messages. We will create utility functions that encapsulate the NIP-17/44/59 flow.

**Relevant Files:**
*   `src/features/messages/utils/nip17.ts` (new file)

**Steps:**

1.  **Create a new directory for messaging features:** `src/features/messages/utils/`.

2.  **Implement `nip17.ts` utilities:**
    This file will contain the core functions for sending and decrypting messages.

    ```typescript
    // src/features/messages/utils/nip17.ts
    import { NDK, NDKEvent, NDKKind, NDKUser, NDKSigner } from "@nostr-dev-kit/ndk";

    export interface DecryptedMessage {
      event: NDKEvent;
      text: string;
      sender: NDKUser;
      recipients: NDKUser[];
      conversationId: string;
    }

    /**
     * Creates a unique, sorted ID for a conversation based on participant pubkeys.
     */
    export const getConversationId = (pubkeys: string[]): string => {
      return [...new Set(pubkeys)].sort().join(',');
    };

    /**
     * Sends a NIP-17 direct message to a list of recipients.
     */
    export const sendDirectMessage = async (
      ndk: NDK,
      senderSigner: NDKSigner,
      recipients: NDKUser[],
      content: string,
      replyToEvent?: NDKEvent
    ): Promise<void> => {
      if (!senderSigner.user) throw new Error("Signer does not have a user");
      const sender = await senderSigner.user;

      // 1. Create the rumor (unsigned kind:14 event)
      const rumor = new NDKEvent(ndk, {
        kind: NDKKind.ChatMessage,
        content,
        pubkey: sender.pubkey,
        tags: recipients.map((r) => ['p', r.pubkey]),
      });

      if (replyToEvent) {
        rumor.tags.push(['e', replyToEvent.id, '', 'reply']);
        const rootTag = replyToEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
        rumor.tags.push(['e', rootTag ? rootTag[1] : replyToEvent.id, '', 'root']);
      }

      // 2. Wrap and publish for each recipient + sender
      const allRecipients = [...new Set([...recipients, sender])];

      const publishPromises = allRecipients.map(async (recipient) => {
        // NDK's wrap() handles creating the seal (kind 13) and gift wrap (kind 1059)
        const giftWrap = await rumor.wrap(recipient, senderSigner);
        if (giftWrap) {
            await giftWrap.publish();
        }
      });

      await Promise.all(publishPromises);
    };

    /**
     * Decrypts a NIP-17 gift wrap event by unwrapping it in place.
     */
    export const decryptReceivedEvent = async (
      ndk: NDK,
      event: NDKEvent,
    ): Promise<DecryptedMessage | null> => {
        if (event.kind !== NDKKind.GiftWrap || !ndk.signer) return null;

        try {
            await event.unwrap(ndk.signer);
            
            // After `unwrap`, the event is mutated to become the inner rumor.
            if (event.kind !== NDKKind.ChatMessage) return null;

            const sender = ndk.getUser({ pubkey: event.pubkey });
            const recipientPubkeys = event.getMatchingTags('p').map(t => t[1]);
            const recipients = recipientPubkeys.map(pk => ndk.getUser({ pubkey: pk }));
            const allParticipants = [sender.pubkey, ...recipientPubkeys];

            return {
                event,
                text: event.content,
                sender,
                recipients,
                conversationId: getConversationId(allParticipants),
            };
        } catch (e) {
            console.error(`Failed to decrypt NIP-17 message (event id: ${event.id})`, e);
            return null;
        }
    };
    ```

---

### Phase 2: Data Fetching and State Management

In this phase, we'll set up a Zustand store to manage conversations and create a hook to subscribe to incoming DMs.

**Relevant Files:**
*   `src/stores/messagesStore.ts` (new file)
*   `src/features/messages/hooks/useMessageSubscription.ts` (new file)
*   `src/App.tsx` (or another high-level component)

**Steps:**

1.  **Create the `messagesStore`:**
    This store will hold all conversations, indexed by a unique `conversationId`.

    ```typescript
    // src/stores/messagesStore.ts
    import { create } from 'zustand';
    import { NDKUser } from '@nostr-dev-kit/ndk';
    import { DecryptedMessage } from '@/features/messages/utils/nip17';

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
            return { conversations: newConversations }; // Already have this message
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
    ```

2.  **Create the `useMessageSubscription` hook:**
    This hook will subscribe to `kind: 1059` events for the current user and populate the store.

    ```typescript
    // src/features/messages/hooks/useMessageSubscription.ts
    import { useEffect, useRef } from 'react';
    import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
    import { NDKEvent, NDKFilter, NDKKind, NDKSubscription } from '@nostr-dev-kit/ndk';
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
            const decrypted = await decryptReceivedEvent(ndk, event.clone());
            if (decrypted) {
                addMessage(decrypted);
            }
        };

        const filter: NDKFilter = {
          kinds: [NDKKind.GiftWrap],
          '#p': [currentUser.pubkey],
          since: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
        };

        if (subscriptionRef.current) subscriptionRef.current.stop();
        
        const sub = ndk.subscribe(filter, { closeOnEose: false, groupable: false });
        subscriptionRef.current = sub;
        sub.on('event', processEvent);

        return () => sub.stop();
      }, [ndk, currentUser?.pubkey, addMessage]);
    };
    ```

3.  **Activate the subscription:**
    Call the hook in a component that is always mounted when a user is logged in, like `App.tsx`.

    ```typescript
    // src/App.tsx
    // ... imports
    import { useMessageSubscription } from './features/messages/hooks/useMessageSubscription';

    function AppRoutes() {
      const currentUser = useNDKCurrentUser();
      useAutoLogin();
      
      // Subscribe to DMs if user is logged in
      if (currentUser) {
        useMessageSubscription();
      }

      return ( /* ... routes ... */ );
    }
    ```

---

### Phase 3: UI - Conversation List

This phase involves creating the main messages page to display a list of all conversations.

**Relevant Files:**
*   `src/i18n/locales/en.json` & `es.json`
*   `src/components/navigation/NavItems.tsx` & `BottomNav.tsx`
*   `src/App.tsx`
*   `src/pages/MessagesPage.tsx` (new file)
*   `src/features/messages/components/ConversationListItem.tsx` (new file)

**Steps:**

1.  **Add Translations:** Update `en.json` and `es.json` with a "Messages" navigation item.
    ```json
    // src/i18n/locales/en.json
    "navigation": {
      "messages": "Messages",
      // ...
    }
    ```

2.  **Add Navigation Links:** Add a "Messages" link to the side navigation and bottom navigation bars. Use the `MessageSquare` icon from `lucide-react`.
    ```typescript
    // src/components/navigation/NavItems.tsx
    import { ..., MessageSquare } from 'lucide-react';
    //...
    const NAV_ITEMS_CONFIG = [
      { path: '/', icon: Home, labelKey: 'feed' },
      { path: '/messages', icon: MessageSquare, labelKey: 'messages' },
      //...
    ];
    ```

3.  **Add Routes:** Add routes for the messages list and individual conversations in `App.tsx`.
    ```typescript
    // src/App.tsx
    import { MessagesPage } from './pages/MessagesPage';
    import { ConversationPage } from './pages/ConversationPage';
    // ...
    <Route path="messages" element={currentUser ? <MessagesPage /> : <Navigate to="/" />} />
    <Route path="messages/:conversationId" element={currentUser ? <ConversationPage /> : <Navigate to="/" />} />
    <Route path="messages/new" element={currentUser ? <NewConversationPage /> : <Navigate to="/" />} />
    ```

4.  **Create `MessagesPage`:** This page will list all conversations, sorted by the most recent message.
    ```typescript
    // src/pages/MessagesPage.tsx
    import { useMessagesStore } from '@/stores/messagesStore';
    import { ConversationListItem } from '@/features/messages/components/ConversationListItem';
    import { Link } from 'react-router-dom';
    import { Edit } from 'lucide-react';

    export function MessagesPage() {
      const conversations = Array.from(useMessagesStore((state) => state.conversations.values()))
        .sort((a, b) => (b.lastMessage?.event.created_at || 0) - (a.lastMessage?.event.created_at || 0));

      return (
        <div className="max-w-2xl mx-auto">
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-semibold">Messages</h1>
            <Link to="/messages/new" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900">
                <Edit className="w-5 h-5" />
            </Link>
          </header>
          <main>
            {conversations.length > 0 ? (
              conversations.map(convo => <ConversationListItem key={convo.id} conversation={convo} />)
            ) : (
              <p className="p-8 text-center text-gray-500">No messages yet.</p>
            )}
          </main>
        </div>
      );
    }
    ```

5.  **Create `ConversationListItem` Component:** This component renders a single conversation in the list.
    ```typescript
    // src/features/messages/components/ConversationListItem.tsx
    import { Conversation } from '@/stores/messagesStore';
    import { Link } from 'react-router-dom';
    import { UserAvatar } from '@/components/ui/UserAvatar';
    import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
    
    export function ConversationListItem({ conversation }: { conversation: Conversation }) {
      const currentUser = useNDKCurrentUser();
      const otherParticipants = conversation.participants.filter(p => p.pubkey !== currentUser?.pubkey);
      const participantNames = otherParticipants.map(p => p.profile?.name || p.pubkey.substring(0, 8)).join(', ');

      return (
        <Link to={`/messages/${conversation.id}`} className="block hover:bg-gray-50 dark:hover:bg-neutral-900/50">
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <UserAvatar pubkey={otherParticipants[0]?.pubkey} size="lg" />
            <div className="flex-1 ml-4 min-w-0">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{participantNames}</p>
                {conversation.lastMessage && (
                  <time className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {new Date(conversation.lastMessage.event.created_at! * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {conversation.lastMessage?.text || '...'}
              </p>
            </div>
          </div>
        </Link>
      );
    }
    ```

---

### Phase 4: UI - Conversation Thread View

This phase implements the view for a single conversation, including message bubbles and a compose input for replies.

**Relevant Files:**
*   `src/pages/ConversationPage.tsx` (new file)
*   `src/features/messages/components/MessageBubble.tsx` (new file)
*   `src/features/messages/components/ComposeDM.tsx` (new file)

**Steps:**

1.  **Create `ConversationPage`:** This page displays messages and handles replies. It should also create a temporary conversation object if one doesn't exist in the store yet (for starting new conversations from profiles).
    ```typescript
    // src/pages/ConversationPage.tsx
    import { useParams, useNavigate } from 'react-router-dom';
    import { useMessagesStore } from '@/stores/messagesStore';
    import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
    import { ArrowLeft } from 'lucide-react';
    import { MessageBubble } from '@/features/messages/components/MessageBubble';
    import { ComposeDM } from '@/features/messages/components/ComposeDM';
    import { Conversation } from '@/stores/messagesStore';

    export function ConversationPage() {
      const { conversationId } = useParams<{ conversationId: string }>();
      const navigate = useNavigate();
      const { ndk } = useNDK();
      const currentUser = useNDKCurrentUser();
      let conversation = useMessagesStore((state) => state.conversations.get(conversationId!));

      if (!conversation && conversationId && currentUser && ndk) {
        const pubkeys = conversationId.split(',');
        const participants = pubkeys.map(pk => ndk.getUser({ pubkey: pk }));
        conversation = { id: conversationId, participants, messages: [], lastMessage: null, unreadCount: 0 };
      }

      if (!conversation) return <div>Loading...</div>;

      const otherParticipants = conversation.participants.filter(p => p.pubkey !== currentUser?.pubkey);
      const headerTitle = otherParticipants.map(p => p.profile?.name || p.pubkey.substring(0,8)).join(', ');

      return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto">
          <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <button onClick={() => navigate('/messages')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold truncate">{headerTitle}</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.messages.map(message => <MessageBubble key={message.event.id} message={message} />)}
          </main>
          <footer className="p-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <ComposeDM conversation={conversation} />
          </footer>
        </div>
      );
    }
    ```

2.  **Create `MessageBubble` Component:** This renders a single message, styled differently for sent vs. received.
    ```typescript
    // src/features/messages/components/MessageBubble.tsx
    import { DecryptedMessage } from '@/features/messages/utils/nip17';
    import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
    import { cn } from '@/lib/utils';
    
    export function MessageBubble({ message }: { message: DecryptedMessage }) {
      const currentUser = useNDKCurrentUser();
      const isMe = message.sender.pubkey === currentUser?.pubkey;

      return (
        <div className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
          <div className={cn("max-w-xs md:max-w-md px-3 py-2 rounded-2xl", isMe ? "bg-purple-600 text-white rounded-br-lg" : "bg-gray-200 dark:bg-neutral-800 rounded-bl-lg")}>
            <p className="text-base break-words">{message.text}</p>
          </div>
        </div>
      );
    }
    ```

3.  **Create `ComposeDM` Component:** An input for sending messages within a conversation.
    ```typescript
    // src/features/messages/components/ComposeDM.tsx
    import { useState } from 'react';
    import { useNDK } from '@nostr-dev-kit/ndk-hooks';
    import { sendDirectMessage } from '@/features/messages/utils/nip17';
    import { Conversation } from '@/stores/messagesStore';
    import { Send } from 'lucide-react';

    export function ComposeDM({ conversation }: { conversation: Conversation }) {
      const { ndk } = useNDK();
      const [content, setContent] = useState('');
      const [isSending, setIsSending] = useState(false);

      const handleSend = async () => {
        if (!content.trim() || !ndk?.signer) return;
        setIsSending(true);
        try {
          const recipients = conversation.participants.filter(p => p.pubkey !== ndk.signer?.user?.pubkey);
          await sendDirectMessage(ndk, ndk.signer, recipients, content);
          setContent('');
        } finally {
          setIsSending(false);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message..." className="flex-1 px-3 py-2 bg-gray-100 dark:bg-neutral-800 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
          <button onClick={handleSend} disabled={!content.trim() || isSending} className="p-3 bg-purple-600 text-white rounded-full disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
      );
    }
    ```

---

### Phase 5: UI - Compose New Message & Integration

This final phase adds a page for starting new conversations and integrates messaging into user profiles.

**Relevant Files:**
*   `src/pages/NewConversationPage.tsx` (new file)
*   `src/pages/ProfilePage.tsx`

**Steps:**

1.  **Create `NewConversationPage`:** A simple form to start a conversation by entering a user's `npub`.
    ```typescript
    // src/pages/NewConversationPage.tsx
    import { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useNDK } from '@nostr-dev-kit/ndk-hooks';
    import { getConversationId } from '@/features/messages/utils/nip17';
    import { ArrowLeft } from 'lucide-react';
    import { nip19 } from 'nostr-tools';

    export function NewConversationPage() {
      const navigate = useNavigate();
      const { ndk } = useNDK();
      const [recipientNpub, setRecipientNpub] = useState('');
      const [error, setError] = useState('');

      const handleNext = () => {
        setError('');
        try {
          if (!ndk?.signer?.user) throw new Error('You must be logged in.');
          const { type, data: pubkey } = nip19.decode(recipientNpub);
          if (type !== 'npub') throw new Error('Invalid npub');
          const conversationId = getConversationId([ndk.signer.user.pubkey, pubkey as string]);
          navigate(`/messages/${conversationId}`);
        } catch (e: any) {
          setError(e.message || 'Invalid npub.');
        }
      };

      return (
        <div className="max-w-2xl mx-auto">
          <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-lg font-semibold">New Message</h1>
          </header>
          <main className="p-4 space-y-4">
            <input id="recipient" value={recipientNpub} onChange={(e) => setRecipientNpub(e.target.value)} placeholder="Enter user npub..." className="mt-1 block w-full px-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-purple-500"/>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button onClick={handleNext} disabled={!recipientNpub.trim()} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-50">Next</button>
            </div>
          </main>
        </div>
      );
    }
    ```

2.  **Add "Message" Button to `ProfilePage`:** Allow users to start a conversation directly from a profile.
    *   Locate the action buttons (Follow/Unfollow, etc.) in `src/pages/ProfilePage.tsx`.
    *   Add a new "Message" button.
    *   The `onClick` handler will calculate the `conversationId` and navigate to the conversation page.

    ```typescript
    // src/pages/ProfilePage.tsx (example snippet)
    import { MessageSquare } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import { getConversationId } from '@/features/messages/utils/nip17';
    // ... inside the component
    const navigate = useNavigate();
    const currentUser = useNDKCurrentUser();
    const { profile } = useProfile(identifier); // Assuming 'profile' contains the viewed user's data
    
    const handleMessageClick = () => {
        if (!currentUser || !profile) return;
        const conversationId = getConversationId([currentUser.pubkey, profile.pubkey]);
        navigate(`/messages/${conversationId}`);
    };

    // In the JSX where action buttons are rendered:
    {currentUser && currentUser.pubkey !== profile?.pubkey && (
        <button onClick={handleMessageClick} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900">
            <MessageSquare className="w-4 h-4" />
            Message
        </button>
    )}
    ```
--- End Plan ---
