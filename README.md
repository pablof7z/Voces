# Voces - Modern NDK Nostr App

A modern React-based Nostr client built with NDK (Nostr Development Kit), Vite, shadcn/ui, and TypeScript.

## Features

- **Nostr Authentication**: Login with NIP-07 browser extensions (Alby, nos2x, etc.) or private key
- **Real-time Feed**: View and publish notes to the Nostr network
- **Modern UI**: Built with shadcn/ui and Tailwind CSS for a clean, responsive interface
- **State Management**: Zustand for global state, React Query for server state
- **Caching**: Dexie-based caching for improved performance
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Nostr SDK**: @nostr-dev-kit/ndk with React hooks
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Database**: Dexie (IndexedDB wrapper) for caching
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── nostr/       # Nostr-specific components
│   └── layout/      # Layout components
├── features/        # Feature-based modules
│   ├── auth/        # Authentication features
│   ├── feed/        # Feed and notes features
│   └── profile/     # User profile features
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── contexts/        # React contexts (NDK provider, etc.)
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── config/          # Configuration files (NDK setup, etc.)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Nostr browser extension (recommended: [Alby](https://getalby.com/))

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
```

### Development

The app will run on `http://localhost:5173` by default.

### Configuration

The app connects to multiple public Nostr relays by default:
- wss://relay.damus.io
- wss://relay.nostr.band
- wss://nos.lol
- wss://relay.snort.social
- wss://relay.primal.net

You can modify the relay list in `src/config/ndk.ts`.

## Key Features Implementation

### NDK Integration

The app uses NDK with:
- Auto-connection to user relays
- Outbox model support
- Dexie cache adapter for performance
- NIP-07 signer support for browser extensions

### Component Architecture

- **Feature-based organization**: Each feature (auth, feed, profile) has its own folder
- **Shared UI components**: Common UI elements in `components/ui`
- **Type-safe**: Full TypeScript coverage with strict mode

### State Management

- **NDK Context**: Provides NDK instance and user state globally
- **Zustand**: For complex client state (included, ready for use)
- **React Query**: For server state and caching

## License

MIT
