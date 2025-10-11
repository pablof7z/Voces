# Agora - NDK Nostr App

A modern React-based Nostr client built with NDK (Nostr Development Kit), Vite, shadcn/ui, and TypeScript.

## Project Overview

Agora is a Nostr client application that allows users to authenticate with Nostr extensions or private keys, publish notes to the Nostr network, and view a real-time feed of notes from followed users. The application follows modern React best practices with a clean, modular architecture and a minimalistic, responsive UI.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Nostr SDK**: @nostr-dev-kit/ndk with React hooks
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Context API for NDK state, Zustand (included for future use)
- **Data Fetching**: TanStack Query (React Query) for server state
- **Database**: Dexie (IndexedDB wrapper) for caching
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components (Button, Card, etc.)
│   ├── navigation/  # Navigation components (Sidebar, BottomNav)
│   ├── layout/      # Layout components
│   └── nostr/      # Nostr-specific components
├── features/        # Feature-based modules
│   ├── auth/        # Authentication features (LoginButton)
│   ├── feed/        # Feed and notes features (NoteFeed, ComposeNote)
│   └── profile/     # User profile features
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── contexts/        # React contexts (NDK provider, etc.)
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
├── config/          # Configuration files (NDK setup, etc.)
├── pages/           # Page components for routing
└── index.css        # Global styles and theme configuration
```

## NDK Integration

### NDK Context
The application uses a React Context (`NDKContext`) to provide a single source of truth for the NDK instance, relays, and the signed-in user. This allows any component to access NDK functionality through the `useNDK()` hook.

### Key Components
1. **LoginButton** - Handles authentication via NIP-07 browser extensions or private key
2. **NoteFeed** - Displays a real-time feed of Nostr notes using NDK subscription hooks
3. **ComposeNote** - Allows users to publish new notes to the Nostr network
4. **NoteCard** - Displays individual notes with engagement features (like, repost, reply)

### Configuration
The NDK instance is configured with:
- Multiple default relays (Damus, Nostr.band, nos.lol, Snort, Primal)
- Dexie cache adapter for performance
- Auto-connection to user relays
- Outbox model support
- Auto-fetching of user mutelist

## Key Features

- **Nostr Authentication**: Login with NIP-07 browser extensions or private key
- **Real-time Feed**: View notes from followed users with live updates
- **Note Publishing**: Compose and publish text notes to the Nostr network
- **Modern UI**: Clean, responsive interface built with shadcn/ui components
- **Caching**: Dexie-based caching for improved performance
- **Type Safety**: Full TypeScript coverage throughout the application
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **Dark Mode**: Automatic dark/light mode based on system preferences

## UI/UX Improvements

### Navigation
- **Desktop**: Persistent sidebar navigation with user profile information
- **Mobile**: Bottom navigation bar for easy thumb access
- **Responsive**: Adapts seamlessly between mobile and desktop layouts
- **Intuitive**: Clear visual hierarchy and consistent navigation patterns

### Visual Design
- **Minimalist**: Clean interface with ample whitespace
- **Consistent**: Unified design language throughout the application
- **Accessible**: Proper contrast ratios and semantic HTML
- **Animated**: Subtle transitions and loading states for enhanced user experience

### User Experience
- **Real-time Updates**: Live feed updates without page refresh
- **Character Counter**: Visual feedback for note composition with color-coded limits
- **Profile Integration**: User avatars and names throughout the interface
- **Contextual Actions**: Relevant actions available for each note

## Development

The application is ready for development with:
- Hot module replacement via Vite
- Tailwind CSS for styling
- Path aliases for clean imports
- ESLint and TypeScript for code quality
- Pre-configured shadcn/ui components

## Future Improvements

1. Enhanced error handling and user feedback
2. Testing framework implementation
3. Environment-specific configuration
4. Additional state management for complex features
5. Accessibility improvements
6. Advanced profile customization
7. Notification system implementation
8. Media attachment support