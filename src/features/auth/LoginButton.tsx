import { useState } from 'react';
import {
  useNDKCurrentUser,
  useNDKSessionLogout
} from '@nostr-dev-kit/ndk-hooks';
import { User, LogOut } from 'lucide-react';
import { LoginModal } from './LoginModal';

export function LoginButton() {
  const currentUser = useNDKCurrentUser();
  const logout = useNDKSessionLogout();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('nostr_private_key');
    localStorage.removeItem('nostr_bunker_url');
    localStorage.removeItem('nostr_extension_auto_login');
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-black dark:hover:bg-neutral-900 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }


  return (
    <>
      <button
        onClick={() => setShowLoginModal(true)}
        className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 transition-all text-sm font-medium flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">Login</span>
        <span className="sm:hidden">Login</span>
      </button>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}