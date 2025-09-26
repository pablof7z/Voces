import { useState } from 'react';
import { 
  useNDKCurrentUser,
  useNDKSessionLogin,
  useNDKSessionLogout,
  NDKNip07Signer,
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk-hooks';
import { Button } from '@/components/ui/button';
import { User, LogOut, Key, Sparkles } from 'lucide-react';

export function LoginButton() {
  const currentUser = useNDKCurrentUser();
  const login = useNDKSessionLogin();
  const logout = useNDKSessionLogout();
  
  const [showOptions, setShowOptions] = useState(false);
  const [nsec, setNsec] = useState('');
  const [showNsecInput, setShowNsecInput] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleExtensionLogin = async () => {
    setIsConnecting(true);
    try {
      if (!window.nostr) {
        throw new Error('No Nostr extension found. Please install Alby or nos2x.');
      }
      const signer = new NDKNip07Signer();
      await login(signer, true);
      setShowOptions(false);
    } catch (error) {
      console.error('Extension login failed:', error);
      alert(error instanceof Error ? error.message : 'Extension login failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrivateKeyLogin = async () => {
    if (!nsec) return;
    setIsConnecting(true);
    try {
      const signer = new NDKPrivateKeySigner(nsec);
      await login(signer, true);
      localStorage.setItem('nostr_private_key', nsec);
      setNsec('');
      setShowNsecInput(false);
      setShowOptions(false);
    } catch (error) {
      console.error('Private key login failed:', error);
      alert('Invalid private key');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateIdentity = async () => {
    setIsConnecting(true);
    try {
      const signer = NDKPrivateKeySigner.generate();
      await login(signer, true);
      const privateKey = signer.privateKey!;
      localStorage.setItem('nostr_private_key', privateKey);
      const user = await signer.user();
      alert(`New identity created!\nnpub: ${user.npub}\nnsec: ${privateKey}\n\nIMPORTANT: Save your nsec somewhere safe!`);
      setShowOptions(false);
    } catch (error) {
      console.error('Failed to generate identity:', error);
      alert('Failed to generate new identity');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('nostr_private_key');
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  if (showOptions) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleExtensionLogin}
          disabled={isConnecting}
          variant="default"
          size="sm"
        >
          <User className="w-4 h-4 mr-2" />
          Login with Extension
        </Button>
        
        {showNsecInput ? (
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter nsec or hex key"
              value={nsec}
              onChange={(e) => setNsec(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
              disabled={isConnecting}
            />
            <Button
              onClick={handlePrivateKeyLogin}
              disabled={!nsec || isConnecting}
              size="sm"
              variant="outline"
            >
              Login
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowNsecInput(true)}
            disabled={isConnecting}
            variant="outline"
            size="sm"
          >
            <Key className="w-4 h-4 mr-2" />
            Login with Private Key
          </Button>
        )}
        
        <Button
          onClick={handleGenerateIdentity}
          disabled={isConnecting}
          variant="outline"
          size="sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate New Identity
        </Button>
        
        <Button
          onClick={() => {
            setShowOptions(false);
            setShowNsecInput(false);
            setNsec('');
          }}
          variant="ghost"
          size="sm"
          disabled={isConnecting}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowOptions(true)}
      disabled={isConnecting}
      className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 transition-all text-sm font-medium flex items-center gap-2"
    >
      <User className="w-4 h-4" />
      <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Login'}</span>
      <span className="sm:hidden">{isConnecting ? '...' : 'Login'}</span>
    </button>
  );
}