import type { ReactNode } from 'react';
import {
  NDKHeadless,
  NDKSessionLocalStorage,
  useNDK as useNDKHook,
  useNDKCurrentUser,
  useNDKSessionLogin,
  useNDKSessionLogout,
  NDKNip07Signer,
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk-hooks';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';

// Default relay configuration
export const defaultRelays = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net'
];

// Main provider that sets up NDKHeadless
export function NDKProvider({ children }: { children: ReactNode }) {
  const dexieAdapter = new NDKCacheAdapterDexie({ dbName: 'voces-ndk-cache' });
  const sessionStorage = new NDKSessionLocalStorage();

  return (
    <>
      <NDKHeadless
        ndk={{
          explicitRelayUrls: defaultRelays,
          cacheAdapter: dexieAdapter,
          autoConnectUserRelays: true,
          autoFetchUserMutelist: true,
          enableOutboxModel: true
        }}
        session={{
          storage: sessionStorage,
          opts: {
            follows: true,
            profile: true
          }
        }}
      />
      {children}
    </>
  );
}

// Custom hook that provides all NDK functionality
export function useNDK() {
  const { ndk } = useNDKHook();
  const currentUser = useNDKCurrentUser();
  const login = useNDKSessionLogin();
  const logout = useNDKSessionLogout();

  // Helper to login with extension (NIP-07)
  const loginWithExtension = async () => {
    if (!window.nostr) {
      throw new Error('No Nostr extension found. Please install Alby or nos2x.');
    }
    const signer = new NDKNip07Signer();
    await login(signer, true);
  };

  // Helper to login with private key
  const loginWithPrivateKey = async (privateKey: string) => {
    const signer = new NDKPrivateKeySigner(privateKey);
    await login(signer, true);
    // Store for demo purposes - in production use secure storage
    localStorage.setItem('nostr_private_key', privateKey);
  };

  // Helper to generate a new identity
  const generateNewIdentity = async () => {
    const signer = NDKPrivateKeySigner.generate();
    await login(signer, true);
    // Store for demo purposes
    localStorage.setItem('nostr_private_key', signer.privateKey!);
    const user = await signer.user();
    return { npub: user.npub, nsec: signer.privateKey! };
  };

  // Custom logout that also clears local storage
  const logoutUser = () => {
    logout();
    localStorage.removeItem('nostr_private_key');
  };

  return {
    ndk,
    currentUser,
    login: loginWithExtension, // Default to extension login
    loginWithExtension,
    loginWithPrivateKey,
    generateNewIdentity,
    logout: logoutUser,
    isConnecting: false // The session hooks handle this internally
  };
}