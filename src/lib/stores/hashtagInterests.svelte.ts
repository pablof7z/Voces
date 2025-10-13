import { NDKKind, NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

export function createHashtagInterestsStore(ndk: NDKSvelte) {
  // Get the interest list event from session
  const interestsEvent = $derived(ndk.$sessions?.getSessionEvent(10015));

  // Extract interests from the session event
  const interests = $derived.by(() => {
    if (!interestsEvent) return [];

    return interestsEvent.tags
      .filter(tag => tag[0] === 't' && tag[1])
      .map(tag => tag[1].toLowerCase());
  });

  async function addHashtag(hashtag: string): Promise<void> {
    const currentUser = ndk.$currentUser;
    if (!currentUser) throw new Error('No user logged in');

    const normalizedHashtag = hashtag.toLowerCase();
    if (interests.includes(normalizedHashtag)) return;

    // Get existing event or create new one
    const existingEvent = interestsEvent;
    const event = new NDKEvent(ndk as any);
    event.kind = NDKKind.InterestList;

    // Preserve existing tags and add the new hashtag
    if (existingEvent) {
      event.tags = [
        ...existingEvent.tags.filter(tag => tag[0] === 't'),
        ['t', normalizedHashtag]
      ];
    } else {
      event.tags = [['t', normalizedHashtag]];
    }

    event.content = existingEvent?.content || '';

    await event.publish();
  }

  async function removeHashtag(hashtag: string): Promise<void> {
    const currentUser = ndk.$currentUser;
    if (!currentUser) throw new Error('No user logged in');

    const normalizedHashtag = hashtag.toLowerCase();
    if (!interests.includes(normalizedHashtag)) return;

    const existingEvent = interestsEvent;
    if (!existingEvent) return;

    // Create new event without the removed hashtag
    const event = new NDKEvent(ndk as any);
    event.kind = NDKKind.InterestList;
    event.tags = existingEvent.tags
      .filter(tag => !(tag[0] === 't' && tag[1]?.toLowerCase() === normalizedHashtag));
    event.content = existingEvent.content || '';

    await event.publish();
  }

  async function toggleHashtag(hashtag: string): Promise<void> {
    const normalizedHashtag = hashtag.toLowerCase();
    if (interests.includes(normalizedHashtag)) {
      await removeHashtag(normalizedHashtag);
    } else {
      await addHashtag(normalizedHashtag);
    }
  }

  return {
    get interests() {
      return interests;
    },
    addHashtag,
    removeHashtag,
    toggleHashtag,
  };
}
