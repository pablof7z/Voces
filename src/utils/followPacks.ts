import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKKind, NDKFollowPack } from "@nostr-dev-kit/ndk"

/**
 * Follows all users in the selected follow packs
 * @param ndk The NDK instance
 * @param packIds Array of follow pack encoded IDs (naddr strings)
 * @returns Promise with the list of followed pubkeys
 */
export async function followPackUsers(ndk: NDK, packIds: string[]): Promise<string[]> {
  const followedPubkeys = new Set<string>();

  try {
    // Get current user
    const currentUser = await ndk.signer?.user();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Get existing contacts list
    const existingContacts = await ndk.fetchEvent({
      kinds: [3 as NDKKind],
      authors: [currentUser.pubkey],
    });

    // Parse existing follows
    const existingFollows = new Set<string>();
    if (existingContacts) {
      existingContacts.tags
        .filter(tag => tag[0] === 'p')
        .forEach(tag => existingFollows.add(tag[1]));
    }

    // Fetch each follow pack and collect pubkeys
    for (const packId of packIds) {
      try {
        // Fetch the follow pack by its ID
        const packEvent = await ndk.fetchEvent(packId);

        if (packEvent) {
          const pack = NDKFollowPack.from(packEvent);

          // Add all pubkeys from the pack that aren't already being followed
          pack.pubkeys?.forEach(pubkey => {
            if (!existingFollows.has(pubkey)) {
              followedPubkeys.add(pubkey);
            }
          });
        }
      } catch (err) {
        console.error(`Error processing pack ${packId}:`, err);
      }
    }

    // Create new contact list with merged follows
    if (followedPubkeys.size > 0) {
      const newContactsEvent = new NDKEvent(ndk);
      newContactsEvent.kind = 3 as NDKKind;
      newContactsEvent.content = existingContacts?.content || '';

      // Add existing follows
      if (existingContacts) {
        newContactsEvent.tags = [...existingContacts.tags];
      } else {
        newContactsEvent.tags = [];
      }

      // Add new follows
      for (const pubkey of followedPubkeys) {
        newContactsEvent.tags.push(['p', pubkey]);
      }

      // Publish the updated contact list
      await newContactsEvent.publish();
    }

    return Array.from(followedPubkeys);
  } catch (error) {
    console.error('Error following pack users:', error);
    throw error;
  }
}

/**
 * Get the count of users that would be followed from the selected packs
 * @param ndk The NDK instance
 * @param packIds Array of follow pack encoded IDs (naddr strings)
 * @returns Promise with the total count
 */
export async function getFollowPackUserCount(ndk: NDK, packIds: string[]): Promise<number> {
  const uniquePubkeys = new Set<string>();

  for (const packId of packIds) {
    try {
      const packEvent = await ndk.fetchEvent(packId);

      if (packEvent) {
        const pack = NDKFollowPack.from(packEvent);
        pack.pubkeys?.forEach(pubkey => uniquePubkeys.add(pubkey));
      }
    } catch (err) {
      console.error(`Error counting pack users ${packId}:`, err);
    }
  }

  return uniquePubkeys.size;
}