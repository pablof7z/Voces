import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

export enum InviteType {
  General = 'general',
  Personalized = 'personalized',
}

export enum OnboardingStep {
  Welcome,
  Profile,
  IntroPost,
  Complete,
}

export const ANIMATION_DELAYS = {
  SLIDE: 0.3,
  FADE_IN: 0.5,
  COPY_TOAST: 2000,
};

export const MOCK_INVITER: NDKUserProfile = {
  name: 'Alex Rivera',
  picture: 'https://randomuser.me/api/portraits/men/75.jpg',
  pubkey: 'mock-pubkey-alex-rivera-123456',
  nip05: 'alex@voces.xyz',
};

export const MOCK_INTRO_POSTS = [
  {
    id: 'post1',
    author: {
      name: 'Maria Garcia',
      picture: 'https://randomuser.me/api/portraits/women/68.jpg',
      nip05: 'maria@domain.com',
    },
    content: "Hey everyone! 👋 Just joined Voces, invited by @alex. Excited to explore what's happening in the world of Nostr. I'm passionate about open-source and decentralized tech. Looking forward to connecting! #introductions",
    zaps: 125,
    replies: 15,
  },
  {
    id: 'post2',
    author: {
      name: 'Kenji Tanaka',
      picture: 'https://randomuser.me/api/portraits/men/32.jpg',
      nip05: 'kenji@nostr-id.org',
    },
    content: "Hello, Nostr! I'm Kenji. I'm a photographer and just got onboarded to Voces. The onboarding was super smooth! I'll be sharing my work here. Glad to be part of this community. #introductions",
    zaps: 340,
    replies: 42,
  },
];