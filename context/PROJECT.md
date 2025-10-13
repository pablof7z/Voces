# Agora - Modern Nostr Client

A modern Nostr client built with Svelte 5, SvelteKit, and NDK (Nostr Development Kit), focusing on community building, content creation, and decentralized communication.

## Project Overview

Agora is a full-featured Nostr client application that enables users to:
- Authenticate with Nostr extensions or private keys
- Publish and interact with notes, articles, and long-form content
- Participate in community discussions and follow interesting voices
- Send and receive Bitcoin payments via Lightning (zaps) and Cashu ecash
- Trade goods and services in a decentralized marketplace
- Manage encrypted backups and invites

The application emphasizes user sovereignty, censorship resistance, and seamless integration of Bitcoin and Nostr protocols.

## Technology Stack

- **Framework**: Svelte 5 with TypeScript
- **Meta-framework**: SvelteKit (file-based routing, SSR/SPA)
- **Nostr SDK**: @nostr-dev-kit/ndk with ndk-svelte5 integration
- **UI Styling**: Tailwind CSS with custom design system
- **State Management**: Svelte 5 runes ($state, $derived, $effect) + NDK stores
- **Build Tool**: Vite
- **Database**: NDK SQLite WASM cache for local event storage
- **Internationalization**: svelte-i18n for multi-language support
- **PWA**: Progressive Web App capabilities with service worker

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── settings/        # Settings page components
│   │   ├── wallet/          # Cashu wallet components
│   │   ├── trades/          # Marketplace trading components
│   │   ├── backup/          # Encrypted backup components
│   │   └── invite/          # Invite system components
│   ├── pages/               # Page-level components (legacy pattern)
│   │   └── onboarding/      # Onboarding flow steps
│   ├── stores/              # Svelte 5 rune-based stores
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration (follow packs, etc.)
│   ├── ndk.svelte.ts       # NDK instance and initialization
│   └── relayAuthPolicy.svelte.ts  # Relay authentication handling
├── routes/                  # SvelteKit file-based routes
│   ├── (app)/               # Main app route group
│   │   ├── [nip05]/         # Dynamic profile routes
│   │   ├── article/         # Article viewing
│   │   ├── marketplace/     # Marketplace features
│   │   ├── money/           # Wallet and payments
│   │   ├── notifications/   # Notification center
│   │   └── settings/        # User settings
│   ├── onboarding/          # New user onboarding
│   └── i/                   # Invite redemption
├── i18n/                    # Internationalization
│   ├── config.ts            # i18n configuration
│   └── locales/             # Translation files (en, es)
└── app.css                  # Global styles and Tailwind config
```

## Key Architecture Patterns

### Svelte 5 Runes
The application uses Svelte 5's new reactivity system based on runes:
- `$state()` - Reactive state management
- `$derived()` - Computed values
- `$effect()` - Side effects and lifecycle management
- `$props()` - Component prop binding

### NDK Integration
NDK (Nostr Development Kit) is integrated via ndk-svelte5:
- **Global NDK Instance**: `ndk.svelte.ts` provides a singleton NDK instance
- **NDK Stores**: Reactive stores like `$sessions`, `$currentUser`, `$activeUser`, `$wallet`
- **Subscriptions**: `$subscribe()` for real-time event streams
- **Profile Fetching**: `$fetchProfile()` for user metadata
- **Smart Caching**: SQLite WASM cache for offline-first experience

### State Management Patterns
1. **Global Stores**: Shared application state using Svelte 5 runes
   - `settings.svelte.ts` - User preferences and configuration
   - `loginModal.svelte.ts` - Authentication modal state
   - `toast.svelte.ts` - Toast notifications
   - `sidebar.svelte.ts` - Sidebar visibility

2. **Component State**: Local state using `$state()` rune
3. **Derived State**: Computed values using `$derived()` rune
4. **NDK State**: Nostr protocol state via NDK stores

### SvelteKit Routing
- **File-based routing**: Routes defined by file structure in `src/routes/`
- **Route groups**: `(app)` group for authenticated app routes
- **Dynamic routes**: `[nip05]` for user profiles, `[identifier]` for content
- **Layouts**: Shared `+layout.svelte` files for consistent UI structure

## Key Features

### Authentication
- **NIP-07**: Browser extension support (Alby, nos2x)
- **Private Key**: Direct nsec/hex key login
- **Session Management**: NDK sessions for multi-account support
- **Onboarding**: Guided multi-step onboarding for new users

### Content & Communication
- **Notes**: Short-form content (kind 1, 1111)
- **Articles**: Long-form content with NIP-23 (kind 30023)
- **Comments**: Threaded discussions
- **Highlights**: Text highlighting and annotations
- **Media**: Image/video upload via Blossom servers

### Payments & Wallet
- **Zaps**: Lightning payments for content (NIP-57)
- **Cashu Wallet**: Ecash wallet integration
- **Nutzaps**: Cashu token transfers (NIP-61)
- **Multi-mint**: Support for multiple Cashu mints
- **Wallet UI**: Send, receive, manage tokens

### Marketplace
- **Listings**: Create and browse marketplace listings (kind 30402)
- **Orders**: P2P order books for trading
- **Escrow**: (Planned) Multi-sig escrow for safe trades

### Social Features
- **Follow Packs**: Curated follow lists for community discovery (kind 30003)
- **Invite System**: Encrypted invite codes with NIP-44
- **User Profiles**: Customizable profiles with NIP-05 verification
- **Hashtags**: Interest-based content filtering

### Advanced Features
- **Encrypted Backups**: Secure key backup with social recovery
- **Relay Management**: Custom relay configuration
- **Relay Auth**: NIP-42 authentication for private relays
- **PWA**: Installable progressive web app
- **Offline Support**: SQLite caching for offline functionality

## Design System

### Color Palette
- **Primary**: Orange (orange-600) - Main accent color
- **Secondary**: Red (red-600) - Gradients and emphasis
- **Neutral**: Neutral gray scale - Backgrounds and text
- **Semantic**: Blue (info), Green (success), Yellow (warning), Red (error)

### Component Patterns
- **Cards**: Consistent card-based layouts
- **Modals**: Backdrop blur with escape key support
- **Forms**: Tailwind-styled inputs with validation
- **Icons**: Heroicons via inline SVG
- **Responsive**: Mobile-first with desktop enhancements

## Development Workflow

### Local Development
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
npm run preview
```

### Testing
- Playwright configured for E2E testing
- Tests in `tests/` directory

## Configuration

### NDK Configuration
- Default relays configured in `ndk.svelte.ts`
- Outbox model enabled for optimal relay routing
- Auto-connect to user's relay list
- SQLite WASM cache for performance

### Build Configuration
- **Vite**: Module bundling and dev server (port 5173)
- **SvelteKit**: SSR/SPA adapter
- **Tailwind**: JIT compilation with custom theme

## Migration History

This project originated as a React application and was successfully migrated to Svelte 5 + SvelteKit. See `MIGRATION_HISTORY.md` for detailed migration notes.

## Contributing

The codebase follows these conventions:
- Use Svelte 5 runes for reactivity
- Feature-based component organization
- TypeScript for type safety
- Tailwind CSS for styling (no inline styles)
- Direct NDK usage (no unnecessary wrappers)

## Future Roadmap

- Complete marketplace escrow system
- Enhanced relay discovery and recommendations
- Advanced backup/recovery options
- Community moderation tools
- Video streaming support
- More robust testing coverage
