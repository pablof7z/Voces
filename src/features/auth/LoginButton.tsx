import { useState } from 'react';
import { useNDK } from '@/contexts/NDKContext';
import { Button } from '@/components/ui/button';
import { User, LogOut, Key, Sparkles } from 'lucide-react';

export function LoginButton() {
  const { 
    currentUser, 
    login: loginWithExtension, 
    loginWithPrivateKey,
    generateNewIdentity,
    logout 
  } = useNDK();
  const [showOptions, setShowOptions] = useState(false);
  const [nsec, setNsec] = useState('');
  const [showNsecInput, setShowNsecInput] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleExtensionLogin = async () => {
    setIsConnecting(true);
    try {
      await loginWithExtension();
      setShowOptions(false);
    } catch (error) {
      console.error('Extension login failed:', error);
      alert('Extension login failed. Please make sure you have a Nostr extension installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrivateKeyLogin = async () => {
    if (!nsec) return;
    setIsConnecting(true);
    try {
      await loginWithPrivateKey(nsec);
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
      const { npub, nsec } = await generateNewIdentity();
      alert(`New identity created!\nnpub: ${npub}\nnsec: ${nsec}\n\nIMPORTANT: Save your nsec somewhere safe!`);
      setShowOptions(false);
    } catch (error) {
      console.error('Failed to generate identity:', error);
      alert('Failed to generate new identity');
    } finally {
      setIsConnecting(false);
    }
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {currentUser.profile?.image && (
            <img
              src={currentUser.profile.image}
              alt={currentUser.profile.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium">
            {currentUser.profile?.name || currentUser.npub.slice(0, 12) + '...'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
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
    <Button
      onClick={() => setShowOptions(true)}
      disabled={isConnecting}
      variant="default"
    >
      <User className="w-4 h-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Login with Nostr'}
    </Button>
  );
}