# Agora

A modern, feature-rich Nostr client built with Svelte 5, SvelteKit, and NDK. Agora provides a comprehensive social platform with publishing, payments, marketplace, and more.

## Features

### Core Social Features
- **Long-form Publishing**: Create and read articles (NIP-23) with markdown support
- **Comments & Threads**: Full comment system with nested replies (NIP-22)
- **Profile Management**: Rich profiles with avatar, banner, bio, and more
- **Follow System**: Follow users and discover content through follow packs
- **Notifications**: Real-time notifications for interactions
- **Direct Messages**: Private messaging between users

### Payment & Economy
- **Cashu Wallet**: Built-in ecash wallet for payments
- **Zaps**: Send and receive Lightning zaps
- **Nutzaps**: Cashu-powered zapping system
- **Marketplace**: Buy and sell items on Nostr
- **P2P Trading**: Decentralized order book for trades

### Advanced Features
- **Follow Packs**: Curated lists of accounts for easy onboarding (NIP-51)
- **Hashtag Interests**: Track and filter by hashtag interests (NIP-32)
- **Blossom Integration**: Decentralized media storage (NIP-29)
- **Relay Management**: Configure custom relays with detailed status monitoring
- **Relay Authentication**: Interactive relay auth handling (NIP-42)
- **Backup System**: Shamir secret sharing for key backup with trusted contacts
- **Theme System**: Light/dark mode support
- **Onboarding Flow**: Guided setup for new users

## Tech Stack

### Framework & Build
- **Svelte 5**: Latest version with runes for reactive state
- **SvelteKit**: Full-stack framework with SSR support
- **Vite**: Fast build tool and dev server
- **TypeScript**: Full type safety throughout

### Nostr & Data
- **NDK**: Nostr Development Kit for all Nostr operations
- **@nostr-dev-kit/svelte**: Svelte 5 integration for NDK
- **@nostr-dev-kit/sessions**: Session management with auto-fetch
- **@nostr-dev-kit/cache-sqlite-wasm**: SQLite WASM cache for performance
- **nostr-tools**: Additional Nostr utilities

### Payments & Storage
- **@cashu/cashu-ts**: Cashu ecash protocol implementation
- **@nostr-dev-kit/wallet**: NDK wallet integration
- **Blossom Client SDK**: Media upload/storage on Blossom servers

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS framework
- **marked**: Markdown parser for article rendering
- **date-fns**: Date formatting utilities

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── settings/        # Settings panels (relays, wallet, theme, etc.)
│   │   ├── wallet/          # Wallet-related components
│   │   ├── trades/          # Trading system components
│   │   ├── marketplace/     # Marketplace components
│   │   ├── backup/          # Key backup components
│   │   ├── onboarding/      # Onboarding flow components
│   │   └── invite/          # Invite system components
│   ├── pages/               # Page-level components
│   │   └── onboarding/      # Onboarding steps
│   ├── stores/              # Svelte stores (using runes)
│   ├── utils/               # Utility functions
│   ├── backup/              # Backup system (Shamir secret sharing)
│   ├── config/              # Configuration files
│   ├── data/                # Static data (follow packs, etc.)
│   ├── ndk.svelte.ts        # NDK instance and initialization
│   └── relayAuthPolicy.svelte.ts  # Relay authentication handler
├── routes/
│   ├── (app)/               # Main app routes (requires layout)
│   │   ├── +page.svelte     # Home feed
│   │   ├── article/[naddr]/ # Article pages
│   │   ├── e/[nevent]/      # Event pages
│   │   ├── p/[identifier]/  # Profile pages
│   │   ├── t/[hashtag]/     # Hashtag pages
│   │   ├── packs/           # Follow packs
│   │   ├── marketplace/     # Marketplace listings
│   │   ├── trades/          # Trading interface
│   │   ├── wallet/          # Wallet interface
│   │   ├── money/           # Payment management
│   │   ├── compose/         # Article composer
│   │   ├── messages/        # Direct messages
│   │   ├── notifications/   # Notifications
│   │   └── settings/        # Settings page
│   ├── onboarding/          # Onboarding flow
│   └── +layout.svelte       # Root layout
└── app.html                 # HTML template
```

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Nostr browser extension** (recommended): [Alby](https://getalby.com/), [nos2x](https://github.com/fiatjaf/nos2x), or similar

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Lint
npm run lint
```

### Development

The app runs on `http://localhost:5173` by default. Changes are hot-reloaded automatically.

### Configuration

#### Relays
The app connects to `wss://relay.primal.net` by default. Users can configure additional relays in Settings > Relays. The relay list is stored in the user's profile and automatically loaded on login.

#### Cache
The app uses SQLite WASM for local caching with Web Workers for performance. The cache is automatically initialized on startup and stores events, profiles, and other data for offline access.

#### Session Management
Sessions are managed by `@nostr-dev-kit/sessions` with automatic fetching of:
- Follows list (NIP-02)
- Mutes list (NIP-51)
- Relay list (NIP-65)
- Wallet information
- Interest lists (kind 10015)

## Key Nostr Features

### NIPs Implemented
- **NIP-01**: Basic protocol
- **NIP-02**: Contact list / follows
- **NIP-04**: Encrypted direct messages
- **NIP-07**: Browser extension signing
- **NIP-19**: bech32-encoded entities (npub, nprofile, nevent, etc.)
- **NIP-22**: Comments
- **NIP-23**: Long-form articles
- **NIP-29**: Blossom media storage
- **NIP-32**: Labeling (hashtags)
- **NIP-42**: Relay authentication
- **NIP-51**: Lists (follow packs, mutes)
- **NIP-57**: Zaps
- **NIP-60**: Cashu wallet (Nutzaps)
- **NIP-65**: Relay list metadata

### Authentication
- Login via NIP-07 browser extensions
- Automatic session persistence
- Relay-based key backup with Shamir secret sharing

### Publishing
- Rich markdown editor for articles
- Image uploads via Blossom
- Comment on articles and posts
- Media grid support

## Advanced Features

### Wallet
The integrated Cashu wallet supports:
- Multiple mint connections
- Send/receive ecash tokens
- Nutzap support for zapping with ecash
- Transaction history
- Balance tracking

### Marketplace
- Create listings with images and descriptions
- Browse marketplace items
- Direct messaging with sellers
- Payment integration

### Follow Packs
Curated collections of users to follow, perfect for:
- Topic-based discovery (Bitcoin, Art, Developers, etc.)
- Community building
- Easy onboarding for new users

### Backup System
Secure key backup using Shamir secret sharing:
- Split your key into multiple shards
- Distribute to trusted contacts on Nostr
- Recover with a quorum of shards
- Optional passphrase protection

## Deployment

The project uses `@sveltejs/adapter-vercel` for Vercel deployments. To deploy to other platforms:

1. Install the appropriate adapter:
   ```bash
   npm install -D @sveltejs/adapter-auto  # Auto-detect
   # or
   npm install -D @sveltejs/adapter-node  # Node server
   # or
   npm install -D @sveltejs/adapter-static  # Static site
   ```

2. Update `svelte.config.js` to use the new adapter

3. Build and deploy:
   ```bash
   npm run build
   ```

## Development Notes

### Svelte 5 Runes
This project uses Svelte 5's new runes system (`runes: true` in compiler options). State management is done with:
- `$state()` for reactive variables
- `$derived()` for computed values
- `$effect()` for side effects

### NDK Integration
The app uses `@nostr-dev-kit/svelte` which provides Svelte-native components and stores for NDK. The NDK instance is initialized in `src/lib/ndk.svelte.ts` and can be imported throughout the app.

### Type Safety
The project uses strict TypeScript. All NDK events, stores, and utilities are fully typed.

## Contributing

Contributions are welcome! Please ensure:
- Code follows the existing style (use the linter)
- TypeScript types are properly defined
- Components use Svelte 5 runes (not legacy stores)
- All NDK operations use the shared instance from `src/lib/ndk.svelte.ts`

## License

MIT
