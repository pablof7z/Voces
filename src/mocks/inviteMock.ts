export const MOCK_INVITER = {
  pubkey: '09d48a1a5dbe13404a729634f1d6ba722d40513468dd713c8ea38ca9b7b6f2c7',
  name: 'Pablo',
  displayName: 'Pablo',
  image: 'https://image.nostr.build/eb05b8ed41f8191e7a4b7d924dd1a1b0e0ef3e7c7c1e8dce18eb83c37f3f3e1f.jpg',
  nip05: 'pablo@voces.xyz',
  about: 'Building the future of decentralized social',
  banner: 'https://image.nostr.build/banner-abstract.jpg',
  lud16: 'pablo@getalby.com'
};

export const MOCK_ENCRYPTED_PAYLOAD = {
  name: 'Tim Garfield',
  welcomeMessage: 'Welcome to Voces! We\'re excited to have you join our community of authentic voices.',
  customizations: {
    primaryColor: '#8B5CF6',
    welcomeTitle: 'You\'ve Been Invited!'
  }
};

export const ONBOARDING_SCENARIOS = {
  scenario1: {
    welcomeMessage: 'Welcome to Voces! I think you\'ll love it here. This is where real conversations happen.',
    decryptedPayload: {
      name: 'Tim Garfield',
      message: 'Hey Tim! Excited to have you join. Here are some sats to get started!',
      cashu: 'cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJhbW91bnQiOjEsInNlY3JldCI6...',
    },
  },
  scenario3: {
    welcomeMessage: 'Welcome to the decentralized future. Let\'s build something amazing together.',
    decryptedPayload: {
      name: 'Tim Garfield',
      message: 'Access granted. Your credentials have been encrypted and your wallet is ready.',
      cashu: 'cashuA...',
    },
  },
  scenario5: {
    welcomeMessage: 'I\'ve been using Voces and I think you\'ll love it. Let me show you around!',
    decryptedPayload: {
      name: 'Tim Garfield',
      message: 'Hey Tim! I\'ve set up everything for you. Welcome to the future of social media!',
      cashu: 'cashuA...',
    },
  },
  scenario6: {
    welcomeMessage: 'You\'ve been personally selected to join an exclusive community where quality conversations thrive.',
    decryptedPayload: {
      name: 'Tim Garfield',
      message: 'Tim, your exclusive access has been approved. Welcome to the inner circle.',
      cashu: 'cashuA...',
    },
  },
  scenario2: {
    welcomeMessage: 'Hey! Super excited to have you here. Voces is the best place for authentic conversations!',
    decryptedPayload: {
      name: 'Tim Garfield',
      message: 'Tim! Welcome aboard! Here\'s a little gift to start your journey 🎁',
      cashu: 'cashuA...',
    },
  },
  scenario4: {
    welcomeMessage: 'Join me on Voces - where your voice matters and your data is yours.',
    decryptedPayload: {
      name: 'Tim Garfield',
      message: 'Tim, I set everything up for you. Your wallet has some sats to get started!',
      cashu: 'cashuA...',
    },
  },
};

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 14);
};

export const generateEncryptionKey = (): string => {
  return Math.random().toString(36).substring(2, 26);
};

export const buildInviteUrl = (code: string, key: string): string => {
  return `voces.xyz/i/${code}${key}`;
};