import type { NDKFollowPack } from '@nostr-dev-kit/ndk-hooks';

export interface FollowPackWithMetadata extends NDKFollowPack {
  subscriberCount?: number;
  isSubscribed?: boolean;
  lastUpdated?: number;
}

export interface FollowPackCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const FOLLOW_PACK_CATEGORIES: FollowPackCategory[] = [
  { id: 'tech', name: 'Technology', description: 'Developers, tech leaders, and innovators', icon: '💻' },
  { id: 'bitcoin', name: 'Bitcoin', description: 'Bitcoin developers and advocates', icon: '₿' },
  { id: 'art', name: 'Art & Design', description: 'Artists, designers, and creators', icon: '🎨' },
  { id: 'music', name: 'Music', description: 'Musicians and music enthusiasts', icon: '🎵' },
  { id: 'news', name: 'News & Media', description: 'Journalists and news sources', icon: '📰' },
  { id: 'philosophy', name: 'Philosophy', description: 'Thinkers and philosophers', icon: '🤔' },
  { id: 'nostr', name: 'Nostr Development', description: 'Nostr protocol developers', icon: '🟣' },
  { id: 'general', name: 'General', description: 'Mixed and general interest', icon: '🌐' }
];