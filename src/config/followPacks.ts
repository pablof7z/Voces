// Hardcoded follow pack naddr identifiers
// These will be replaced with dynamic data later
export const FOLLOW_PACK_ADDRESSES: Record<string, string[]> = {
  venezuela: [
    'naddr1qvzqqqyckypzpm0yzdfrja6cz4z3g9ytysgjxzxwm9k3yy3fkrn2v679526qcqlvqy88wumn8ghj7mn0wvhxcmmv9uqpkum5wfjkzmt9wfe5vmmvd3hhw5rpvd4kswzt0ge4qvn3zqe5pv',
    'naddr1qvzqqqyckypzp7gpv9hspf3lf7w83qw5sudq8heafnh89y02l4ade0h20j2utr38qy88wumn8ghj7mn0wvhxcmmv9uqqcmmyv4hx5mejdc6nsvn0wnru2m',
    'naddr1qvzqqqyckypzpq3zq944rrmyyj3uu2zhhvlwj03d7tyce2905kkvhzt98nr5axrxqy88wumn8ghj7mn0wvhxcmmv9uqsuamnwvaz7tmwdaejumr0dshsqrrn0fu8xvrjvy6hgut6w5vtmsm6',
    'naddr1qvzqqqyckypzpq3zq944rrmyyj3uu2zhhvlwj03d7tyce2905kkvhzt98nr5axrxqy88wumn8ghj7mn0wvhxcmmv9uqsuamnwvaz7tmwdaejumr0dshsqrrcv9ch2utjw4ekkce5wg7srgqv'
  ],
  // Other communities can be added here
  default: [
    'naddr1qvzqqqyckypzpm0yzdfrja6cz4z3g9ytysgjxzxwm9k3yy3fkrn2v679526qcqlvqy88wumn8ghj7mn0wvhxcmmv9uqpkum5wfjkzmt9wfe5vmmvd3hhw5rpvd4kswzt0ge4qvn3zqe5pv'
  ]
};

// Community metadata - this will be shown while loading actual data
export const COMMUNITY_METADATA: Record<string, { name: string; description: string }> = {
  venezuela: {
    name: 'Venezuela',
    description: 'Connect with the Venezuelan community'
  },
  cambodia: {
    name: 'Cambodia',
    description: 'Join voices from the Kingdom of Wonder'
  },
  nicaragua: {
    name: 'Nicaragua',
    description: 'Unite with Nicaraguan changemakers'
  },
  zimbabwe: {
    name: 'Zimbabwe',
    description: 'Connect with Zimbabwe\'s innovators'
  },
  afghanistan: {
    name: 'Afghanistan',
    description: 'Support Afghan voices of hope'
  },
  iran: {
    name: 'Iran',
    description: 'Join the Persian community'
  }
};