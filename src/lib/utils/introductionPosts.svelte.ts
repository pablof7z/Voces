import type NDK from '@nostr-dev-kit/ndk';
import { NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';

export interface IntroductionPost {
  event: NDKEvent;
  engagementCount: number;
}

export async function fetchIntroductionPosts(ndk: NDK): Promise<IntroductionPost[]> {
  try {
    // Fetch posts with #introductions hashtag from more than 12 hours ago
    const twelveHoursAgo = Math.floor(Date.now() / 1000) - (12 * 60 * 60);

    const filter: NDKFilter = {
      kinds: [1],
      "#t": ["introductions"],
      since: twelveHoursAgo,
    };

    const introEvents = await ndk.fetchEvents(filter);

    if (introEvents.size === 0) {
      return [];
    }

    // Get all event IDs
    const eventIds = Array.from(introEvents).map(e => e.id);

    // Fetch all events that tag these introduction posts
    const tagsFilter: NDKFilter = {
      "#e": eventIds,
    };

    const taggingEvents = await ndk.fetchEvents(tagsFilter);

    // Count how many times each introduction post has been tagged
    const engagementMap = new Map<string, number>();

    for (const event of taggingEvents) {
      const eTags = event.tags.filter(tag => tag[0] === 'e');
      for (const tag of eTags) {
        const eventId = tag[1];
        if (eventIds.includes(eventId)) {
          engagementMap.set(eventId, (engagementMap.get(eventId) || 0) + 1);
        }
      }
    }

    // Create the introduction posts with engagement metrics
    const introductionPosts: IntroductionPost[] = Array.from(introEvents)
      .map(event => ({
        event,
        engagementCount: engagementMap.get(event.id) || 0
      }))
      .sort((a, b) => b.engagementCount - a.engagementCount)
      .slice(0, 10); // Get top 10 most engaged posts

    return introductionPosts;
  } catch (error) {
    console.error('Error fetching introduction posts:', error);
    return [];
  }
}
