import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';

export type NotificationType =
  | 'follow'
  | 'mention'
  | 'reply'
  | 'reaction'
  | 'repost'
  | 'zap'
  | 'unknown';

export interface NotificationGroup {
  id: string;
  type: NotificationType;
  targetEvent?: NDKEvent; // The event being reacted to/replied to
  sourceEvents: NDKEvent[]; // All events in this group (reactions, replies, etc)
  latestTimestamp: number;
  read: boolean;
}

interface NotificationState {
  // Core state
  groups: Map<string, NotificationGroup>;
  filter: NDKFilter | null;
  lastSeenTimestamp: number;

  // Unread counts
  unreadCount: number;

  // Actions
  setUserPubkey: (userPubkey: string | null) => void;
  addEvent: (event: NDKEvent) => void;
  markGroupAsRead: (groupId: string) => void;
  markAllAsRead: () => void;
  getUnreadGroups: () => NotificationGroup[];
  getNewNotificationCount: () => number;
  clearNotifications: () => void;
}

function getNotificationType(event: NDKEvent): NotificationType {
  switch (event.kind) {
    case NDKKind.Contacts:
      return 'follow';
    case NDKKind.Text:
      return 'mention';
    case NDKKind.Reaction:
    case 7:
      return 'reaction';
    case NDKKind.Repost:
    case NDKKind.GenericRepost:
      return 'repost';
    case NDKKind.Zap:
      return 'zap';
    case 1111: // GenericReply
      return 'reply';
    default:
      return 'unknown';
  }
}

function getGroupId(event: NDKEvent, type: NotificationType): string {
  // For reactions/replies, group by the event being reacted to
  const eTags = event.tags.filter(t => t[0] === 'e');
  if (eTags.length > 0 && (type === 'reaction' || type === 'reply')) {
    // Use the last e-tag (the one being reacted to)
    return `${type}:${eTags[eTags.length - 1][1]}`;
  }

  // For follows, each follow is its own group
  if (type === 'follow') {
    return `follow:${event.pubkey}:${event.created_at}`;
  }

  // For mentions without e-tags, group by the mentioning event
  if (type === 'mention') {
    return `mention:${event.id}`;
  }

  // For zaps, group by the zapped event if available
  if (type === 'zap' && eTags.length > 0) {
    return `zap:${eTags[0][1]}`;
  }

  // Default: each event is its own group
  return `${type}:${event.id}`;
}

function shouldIncludeNotification(event: NDKEvent, userPubkey: string): boolean {
  const pTags = event.tags.filter(t => t[0] === 'p');

  // Skip if it's spam (mentions 10+ people)
  if (event.kind === NDKKind.Text && pTags.length > 10) {
    return false;
  }

  // Skip if it doesn't mention us
  const mentionsUser = pTags.some(t => t[1] === userPubkey);
  if (!mentionsUser) {
    return false;
  }

  return true;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      groups: new Map(),
      filter: null,
      lastSeenTimestamp: Math.floor(Date.now() / 1000),
      unreadCount: 0,

      setUserPubkey: (userPubkey: string | null) => {
        if (!userPubkey) {
          set({ filter: null });
          return;
        }

        // Create filter for notifications
        const filter: NDKFilter = {
          kinds: [1, 1111, 20, 7, NDKKind.Zap, NDKKind.Nutzap],
          '#p': [userPubkey],
        };

        set({ filter });
      },

      addEvent: (event: NDKEvent) => {
        const { filter } = get();
        if (!filter || !filter['#p'] || filter['#p'].length === 0) {
          return;
        }

        const userPubkey = filter['#p'][0];

        // Check if we should include this notification
        if (!shouldIncludeNotification(event, userPubkey)) {
          return;
        }

        const type = getNotificationType(event);
        const groupId = getGroupId(event, type);

        set((state) => {
          const groups = new Map(state.groups);
          const existingGroup = groups.get(groupId);

          if (existingGroup) {
            // Add to existing group
            existingGroup.sourceEvents.push(event);
            existingGroup.latestTimestamp = Math.max(
              existingGroup.latestTimestamp,
              event.created_at || 0
            );

            // Update read status if this is a new event
            if (event.created_at && event.created_at > state.lastSeenTimestamp) {
              existingGroup.read = false;
            }
          } else {
            // Create new group
            const newGroup: NotificationGroup = {
              id: groupId,
              type,
              sourceEvents: [event],
              latestTimestamp: event.created_at || 0,
              read: event.created_at ? event.created_at <= state.lastSeenTimestamp : true,
            };

            groups.set(groupId, newGroup);
          }

          // Calculate unread count
          let unreadCount = 0;
          groups.forEach(group => {
            if (!group.read) unreadCount++;
          });

          return { groups, unreadCount };
        });
      },

      markGroupAsRead: (groupId: string) => {
        set((state) => {
          const groups = new Map(state.groups);
          const group = groups.get(groupId);
          if (group) {
            group.read = true;
          }

          // Recalculate unread count
          let unreadCount = 0;
          groups.forEach(g => {
            if (!g.read) unreadCount++;
          });

          return { groups, unreadCount };
        });
      },

      markAllAsRead: () => {
        set((state) => {
          const groups = new Map(state.groups);
          const now = Math.floor(Date.now() / 1000);

          groups.forEach(group => {
            group.read = true;
          });

          return {
            groups,
            unreadCount: 0,
            lastSeenTimestamp: now
          };
        });
      },

      getUnreadGroups: () => {
        const { groups } = get();
        return Array.from(groups.values()).filter(g => !g.read);
      },

      getNewNotificationCount: () => {
        return get().unreadCount;
      },

      clearNotifications: () => {
        set({
          groups: new Map(),
          unreadCount: 0
        });
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        lastSeenTimestamp: state.lastSeenTimestamp,
      }),
    }
  )
);