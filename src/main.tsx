import React, { useRef } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { NDKHeadless, NDKSessionLocalStorage } from '@nostr-dev-kit/ndk-hooks';
import NDKCacheAdapterSqliteWasm from '@nostr-dev-kit/ndk-cache-sqlite-wasm';
import { useSettingsStore } from './stores/settingsStore';
import './i18n/config';
import './app.css';
import App from './App.tsx';

const container = document.getElementById('root')!;

function AppWithNDK() {
  const relays = useSettingsStore((state) => state.relays);
  const selectedRelay = useSettingsStore((state) => state.selectedRelay);
  const sessionStorage = useRef(new NDKSessionLocalStorage());
  const cacheAdapter = useRef(new NDKCacheAdapterSqliteWasm({
    dbName: 'voces-ndk-cache-2',
    useWorker: false,
    workerUrl: '/worker.js',
    wasmUrl: '/sql-wasm.wasm'
  }));

  let relayUrls: string[];

  if (selectedRelay) {
    relayUrls = [selectedRelay];
  } else {
    const enabledRelayUrls = relays
      .filter((relay) => relay.enabled)
      .map((relay) => relay.url);

    relayUrls = enabledRelayUrls.length > 0
      ? enabledRelayUrls
      : ['wss://relay.damus.io', 'wss://nos.lol'];
  }

  return (
			<>
				<NDKHeadless
					ndk={{
						explicitRelayUrls: ['wss://purplepag.es', ...relayUrls],
						cacheAdapter: cacheAdapter.current,
					}}
					session={{
						storage: sessionStorage.current,
						opts: {
							follows: true,
							profile: true,
						},
					}}
				/>
				<App />
			</>
		);
}

const app = (
  <React.StrictMode>
    <AppWithNDK />
  </React.StrictMode>
);

// Use hydrateRoot if we have server-rendered content
if (container.children.length > 0 && container.children[0].innerHTML !== '') {
  hydrateRoot(container, app);
} else {
  const root = createRoot(container);
  root.render(app);
}