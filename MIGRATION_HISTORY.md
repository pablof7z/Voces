# Migration History: React to Svelte 5

## Overview

This document provides historical context about the major architectural migration that occurred in this project, transforming it from a React-based application to a modern Svelte 5 implementation.

## Timeline

### React Era (Pre-October 2024)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand, React Query
- **UI**: shadcn/ui with Radix UI primitives
- **Routing**: React Router DOM
- **Database**: Dexie (IndexedDB wrapper) for caching

### Migration Point (Commit: 95b6ef7)
**"Port to Svelte 5 with ndk-svelte5"**

This commit marks the beginning of the migration from React to Svelte 5. The migration was driven by:
- Better integration with NDK through `@nostr-dev-kit/svelte`
- Improved reactivity with Svelte 5's runes system
- Simplified state management
- Better performance characteristics
- Cleaner, more maintainable codebase

### Svelte 5 Era (October 2024 - Present)
- **Framework**: Svelte 5 with SvelteKit
- **Build Tool**: Vite (maintained)
- **State Management**: Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **UI**: Tailwind CSS 4 with custom components
- **Routing**: SvelteKit routing
- **Database**: SQLite WASM for caching

## Key Migration Commits

### Phase 1: Initial Migration
```
95b6ef7 - Port to Svelte 5 with ndk-svelte5
346a51c - Update NDK dependencies to latest versions
e6c074b - Add new modal and component implementations
7b8e1b4 - Refactor login flow to use centralized modal
```

### Phase 2: Component Migration & Enhancement
```
668498c - Add real-time recent articles to sidebar
027b873 - Clean up and refine component implementations
6acd6f7 - Enhance page components with improved features
ff56a72 - Update utilities and build configuration
6b35a86 - Add documentation for follow pack implementation
3f9e55e - Add relay authentication policy module
```

### Phase 3: Advanced Features
```
97a6c07 - Migrate to ndk-svelte5 and enhance UI components
337f1ef - Display relay icon when a specific relay is selected
369b660 - Update sessions and wallet packages to fix zustand bundling issue
56db5d3 - Add Articles tab to profile pages and improve follow pack management
08c5e3b - Configure Vite to externalize zustand dependency
682e5ca - Update wallet to 0.8.6 with zustand/vanilla fix
```

### Phase 4: Rebrand & Finalization
```
d265e22 - Rebrand to Agora and modernize application architecture
18708e8 - Update README for Agora rebrand and Svelte 5 architecture
9c46d25 - Update voces-reference submodule
65cb617 - Merge svelte branch: Complete Agora rebrand and modernization
```

## Major Changes

### Removed
- All React components and hooks
- React-specific state management (Zustand stores, React Query)
- shadcn/ui components
- Dexie database layer
- React Router DOM
- TSX/JSX files

### Added
- Svelte 5 components with runes
- SvelteKit routing system
- SQLite WASM caching
- `@nostr-dev-kit/svelte` integration
- Svelte-native stores and utilities
- Enhanced relay authentication system
- Improved wallet integration
- Modern component architecture

### Transformed
- **State Management**: Zustand → Svelte runes
- **Routing**: React Router → SvelteKit routes
- **Components**: React/TSX → Svelte
- **Data Fetching**: React Query → NDK with Svelte stores
- **Styling**: Maintained Tailwind CSS, improved theming

## Architecture Benefits

### Before (React)
- Complex state management with multiple libraries
- Heavy bundle size
- More boilerplate code
- Separate concerns for reactivity

### After (Svelte 5)
- Built-in reactivity with runes
- Smaller bundle size
- Less boilerplate
- Unified reactive paradigm
- Better performance
- Improved developer experience

## Integration with NDK

The migration enabled better integration with Nostr Development Kit:

- Direct use of `@nostr-dev-kit/svelte` for Svelte 5
- Native reactive stores for NDK events
- Simplified session management
- Better caching with SQLite WASM
- Improved relay authentication handling

## Breaking Changes

This migration was a **complete rewrite**. No backwards compatibility was maintained with the React version. The migration was a one-way transformation:

- All React component APIs were replaced
- State management patterns changed completely
- Routing structure transformed
- Build configuration updated

## Future Context

For developers working on this codebase:

1. **This is a Svelte 5 project** - Use Svelte runes, not legacy stores
2. **No React patterns** - Don't look for hooks, context, or React patterns
3. **NDK integration** - Use `@nostr-dev-kit/svelte` for all Nostr operations
4. **Routing** - Use SvelteKit's file-based routing in `src/routes/`
5. **State** - Use `$state()`, `$derived()`, and `$effect()` runes

## Reference Implementation

The `voces-reference` directory previously contained the React implementation for reference. This was removed as the Svelte 5 implementation is now the canonical version.

## Lessons Learned

1. **Framework migration is feasible** - With proper planning, a complete framework migration is achievable
2. **Better tooling matters** - Native reactivity and better NDK integration improved DX significantly
3. **Clean slate approach** - Not maintaining backwards compatibility allowed for cleaner architecture
4. **Documentation is key** - This document exists to provide context for future developers

## Resources

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [NDK Svelte Integration](https://github.com/nostr-dev-kit/ndk/tree/master/ndk-svelte5)
- [Migration commit range](https://github.com/yourrepo/commits/95b6ef7..65cb617)

---

*Last updated: October 2025*
*Migration completed: October 2024*
