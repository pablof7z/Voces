import { useEffect } from 'react';
import { useNDKCurrentUser, useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import { useNotificationStore } from '@/stores/notificationStore';

export function NotificationProvider() {
  const currentUser = useNDKCurrentUser();
  const { filter, setUserPubkey, addEvent } = useNotificationStore();

  // Update filter when user changes
  useEffect(() => {
    setUserPubkey(currentUser?.pubkey || null);
  }, [currentUser?.pubkey, setUserPubkey]);

  // Subscribe to notifications
  const { events } = useSubscribe(
    filter ? [filter] : false,
    {
      subId: 'notifications',
      closeOnEose: false,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
    [filter]
  );

  // Add events to the store
  useEffect(() => {
    if (events && events.length > 0) {
      events.forEach(event => {
        addEvent(event);
      });
    }
  }, [events, addEvent]);

  return null;
}