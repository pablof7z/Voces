import { NDKMessenger, type NDKConversation, type NDKMessage } from '@nostr-dev-kit/messages';
import { ndk } from '../ndk.svelte';

/**
 * Svelte 5 store for managing DM state using @nostr-dev-kit/messages
 */
class MessagesStore {
  private messenger: NDKMessenger | null = null;
  private _conversations = $state<NDKConversation[]>([]);
  private _totalUnreadCount = $state(0);
  private isStarted = false;

  // Lazy-start messenger when first accessed
  private async ensureStarted() {
    if (!this.isStarted && ndk.activeUser && ndk.signer) {
      this.isStarted = true;

      // Create messenger instance
      this.messenger = new NDKMessenger(ndk);

      // Listen for new messages
      this.messenger.on('message', (message: NDKMessage) => {
        console.log('New message received:', message);
        // Refresh conversations when a message arrives
        this.refreshConversations();
      });

      this.messenger.on('error', (error) => {
        console.error('Messenger error:', error);
      });

      // Start the messenger
      await this.messenger.start();

      // Load initial conversations
      await this.refreshConversations();
    }
  }

  private async refreshConversations() {
    if (!this.messenger) return;

    try {
      this._conversations = await this.messenger.getConversations();

      // Calculate total unread count
      this._totalUnreadCount = this._conversations.reduce(
        (total, conv) => total + conv.getUnreadCount(),
        0
      );
    } catch (error) {
      console.error('Failed to refresh conversations:', error);
    }
  }

  async stop() {
    if (this.messenger) {
      this.messenger.destroy();
      this.messenger = null;
      this.isStarted = false;
      this._conversations = [];
      this._totalUnreadCount = 0;
    }
  }

  async getConversation(participantNpub: string): Promise<NDKConversation | null> {
    await this.ensureStarted();

    if (!this.messenger) return null;

    const user = ndk.getUser({ npub: participantNpub });
    return await this.messenger.getConversation(user);
  }

  async sendMessage(recipientNpub: string, content: string): Promise<NDKMessage | null> {
    await this.ensureStarted();

    if (!this.messenger) return null;

    const recipient = ndk.getUser({ npub: recipientNpub });
    const message = await this.messenger.sendMessage(recipient, content);

    // Refresh conversations after sending
    await this.refreshConversations();

    return message;
  }

  async markConversationAsRead(conversationId: string) {
    const conversation = this._conversations.find(c => c.id === conversationId);
    if (conversation) {
      await conversation.markAsRead();
      // Update unread count
      this._totalUnreadCount = this._conversations.reduce(
        (total, conv) => total + conv.getUnreadCount(),
        0
      );
    }
  }

  get conversations() {
    // Trigger lazy initialization when accessed
    this.ensureStarted();

    // Sort by last message timestamp (most recent first)
    return [...this._conversations].sort((a, b) => {
      const aTime = a.getLastMessage()?.timestamp || 0;
      const bTime = b.getLastMessage()?.timestamp || 0;
      return bTime - aTime;
    });
  }

  get totalUnreadCount() {
    this.ensureStarted();
    return this._totalUnreadCount;
  }

  getMessenger(): NDKMessenger | null {
    return this.messenger;
  }
}

// Create singleton instance
export const messagesStore = new MessagesStore();
