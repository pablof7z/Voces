import { useEffect, useState } from 'react';
import {
  useNDKCurrentUser,
  useNDKSessionLogin,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk-hooks';

export function useAutoLogin() {
  const currentUser = useNDKCurrentUser();
  const login = useNDKSessionLogin();
  const [isAttempting, setIsAttempting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (currentUser || attempted || isAttempting) return;

    const attemptAutoLogin = async () => {
      setIsAttempting(true);

      try {
        // Check for saved bunker URL first (NIP-46)
        const bunkerUrl = localStorage.getItem('nostr_bunker_url');
        if (bunkerUrl) {
          try {
            const signer = new NDKNip46Signer(bunkerUrl);
            await signer.blockUntilReady();
            await login(signer, true);
            return;
          } catch (error) {
            console.error('Bunker auto-login failed:', error);
            localStorage.removeItem('nostr_bunker_url');
          }
        }

        // Check for saved private key
        const privateKey = localStorage.getItem('nostr_private_key');
        if (privateKey) {
          try {
            const signer = new NDKPrivateKeySigner(privateKey);
            await login(signer, true);
            return;
          } catch (error) {
            console.error('Private key auto-login failed:', error);
            localStorage.removeItem('nostr_private_key');
          }
        }

        // Check for browser extension (NIP-07)
        if (window.nostr) {
          try {
            const hasAutoLoginConsent = localStorage.getItem('nostr_extension_auto_login');
            if (hasAutoLoginConsent === 'true') {
              const signer = new NDKNip07Signer();
              await login(signer, false); // Don't persist for extension
              return;
            }
          } catch (error) {
            console.error('Extension auto-login failed:', error);
            localStorage.removeItem('nostr_extension_auto_login');
          }
        }
      } finally {
        setIsAttempting(false);
        setAttempted(true);
      }
    };

    attemptAutoLogin();
  }, [currentUser, login, attempted, isAttempting]);

  return { isAttempting };
}