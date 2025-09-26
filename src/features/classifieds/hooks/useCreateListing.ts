import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { CLASSIFIED_LISTING_KIND, createListingTags } from '../types';
import type { ListingFormData } from '../types';

export function useCreateListing() {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();

  const createListing = async (data: ListingFormData) => {
    if (!ndk || !currentUser) {
      throw new Error('You must be logged in to create a listing');
    }

    const event = new NDKEvent(ndk);
    event.kind = CLASSIFIED_LISTING_KIND;
    event.content = data.content;
    event.tags = createListingTags(data);

    await event.sign();
    await event.publish();

    return event;
  };

  const updateListing = async (eventId: string, data: ListingFormData) => {
    if (!ndk || !currentUser) {
      throw new Error('You must be logged in to update a listing');
    }

    // For replaceable events (30000-39999), we create a new event with the same 'd' tag
    const event = new NDKEvent(ndk);
    event.kind = CLASSIFIED_LISTING_KIND;
    event.content = data.content;
    event.tags = createListingTags(data);

    // Add the 'd' tag to identify this as a replacement
    event.tags.push(['d', eventId]);

    await event.sign();
    await event.publish();

    return event;
  };

  const deleteListing = async (eventId: string) => {
    if (!ndk || !currentUser) {
      throw new Error('You must be logged in to delete a listing');
    }

    // To delete, we update with a "sold" or "deleted" status
    const event = new NDKEvent(ndk);
    event.kind = CLASSIFIED_LISTING_KIND;
    event.content = '';
    event.tags = [
      ['d', eventId],
      ['status', 'deleted']
    ];

    await event.sign();
    await event.publish();

    return event;
  };

  return {
    createListing,
    updateListing,
    deleteListing,
    isAuthenticated: !!currentUser
  };
}