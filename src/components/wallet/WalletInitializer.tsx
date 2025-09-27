import { useEffect } from 'react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { useWalletStore } from '../../stores/walletStore';

export function WalletInitializer() {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const initialize = useWalletStore((state) => state.initialize);
  const cleanup = useWalletStore((state) => state.cleanup);

  useEffect(() => {
    if (!ndk || !currentUser) {
      cleanup();
      return;
    }

    initialize(ndk, currentUser);

    return () => {
      cleanup();
    };
  }, [ndk, currentUser, initialize, cleanup]);

  return null;
}