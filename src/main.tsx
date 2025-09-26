import React from 'react';
import { createRoot } from 'react-dom/client';
import { NDKHeadless, NDKSessionLocalStorage } from '@nostr-dev-kit/ndk-hooks';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { useSettingsStore } from './stores/settingsStore';
import './i18n/config';
import './app.css';
import App from './App.tsx';

const root = createRoot(document.getElementById('root')!);

function AppWithNDK() {
  // Get relay configuration from settings store
  const relays = useSettingsStore((state) => state.relays);
  const selectedRelay = useSettingsStore((state) => state.selectedRelay);

  // If a specific relay is selected, use only that one
  // Otherwise use all enabled relays
  let relayUrls: string[];

  if (selectedRelay) {
    // Single relay mode
    relayUrls = [selectedRelay];
  } else {
    // All enabled relays mode
    const enabledRelayUrls = relays
      .filter((relay) => relay.enabled)
      .map((relay) => relay.url);

    // Fallback to default relays if none are enabled
    relayUrls = enabledRelayUrls.length > 0
      ? enabledRelayUrls
      : ['wss://relay.damus.io', 'wss://nos.lol'];
  }

  return (
    <>
      <NDKHeadless
        ndk={{
          explicitRelayUrls: relayUrls,
          cacheAdapter: new NDKCacheAdapterDexie({ dbName: 'voces-ndk-cache' }),
        }}
        session={{
          storage: new NDKSessionLocalStorage(),
          opts: {
            follows: true,
            profile: true
          }
        }}
      />
      <App />
    </>
  );
}

root.render(
  <React.StrictMode>
    <AppWithNDK />
  </React.StrictMode>
);