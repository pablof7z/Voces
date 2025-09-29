import { useState } from 'react';
import {
  useNDKSessionLogin,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk-hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chrome, Shield, Key, Sparkles, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const login = useNDKSessionLogin();

  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [nsec, setNsec] = useState('');
  const [bunkerUrl, setBunkerUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setActiveMethod(null);
    setNsec('');
    setBunkerUrl('');
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleExtensionLogin = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.nostr) {
        throw new Error('No Nostr extension found. Please install Alby, nos2x, or another NIP-07 compatible extension.');
      }
      const signer = new NDKNip07Signer();
      await login(signer, false);
      handleClose();
    } catch (error) {
      console.error('Extension login failed:', error);
      setError(error instanceof Error ? error.message : 'Extension login failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBunkerLogin = async () => {
    if (!bunkerUrl) return;
    setIsConnecting(true);
    setError(null);
    try {
      const signer = new NDKNip46Signer(bunkerUrl);
      await signer.blockUntilReady();
      await login(signer, true);
      handleClose();
    } catch (error) {
      console.error('Bunker login failed:', error);
      setError(error instanceof Error ? error.message : 'Bunker connection failed. Please check your bunker URL.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrivateKeyLogin = async () => {
    if (!nsec) return;
    setIsConnecting(true);
    setError(null);
    try {
      const signer = new NDKPrivateKeySigner(nsec);
      await login(signer, true);
      handleClose();
    } catch (error) {
      console.error('Private key login failed:', error);
      setError('Invalid private key. Please check your nsec or hex key.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateIdentity = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const signer = NDKPrivateKeySigner.generate();
      await login(signer, true);
      const privateKey = signer.privateKey!;
      const user = await signer.user();

      // Show the keys in a more user-friendly way
      const message = `Identity created successfully!\n\nPublic Key (npub):\n${user.npub}\n\nPrivate Key (nsec):\n${privateKey}\n\nIMPORTANT: Save your private key (nsec) in a secure location. You will need it to login again.`;
      alert(message);
      handleClose();
    } catch (error) {
      console.error('Failed to generate identity:', error);
      setError('Failed to generate new identity. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to Nostr</DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to connect to the Nostr network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!activeMethod && (
            <>
              <Button
                onClick={() => {
                  setActiveMethod('extension');
                  handleExtensionLogin();
                }}
                disabled={isConnecting}
                className="w-full justify-start bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600"
                variant="outline"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Browser Extension (NIP-07)
                {isConnecting && activeMethod === 'extension' && (
                  <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                )}
              </Button>

              <Button
                onClick={() => setActiveMethod('bunker')}
                disabled={isConnecting}
                className="w-full justify-start bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600"
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Remote Signer / Bunker (NIP-46)
              </Button>

              <Button
                onClick={() => setActiveMethod('private-key')}
                disabled={isConnecting}
                className="w-full justify-start bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600"
                variant="outline"
              >
                <Key className="w-4 h-4 mr-2" />
                Private Key
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neutral-900 px-2 text-neutral-400">Or</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setActiveMethod('generate');
                  handleGenerateIdentity();
                }}
                disabled={isConnecting}
                className="w-full justify-start bg-purple-900/50 hover:bg-purple-800/50 text-white border-purple-700/50"
                variant="secondary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Identity
                {isConnecting && activeMethod === 'generate' && (
                  <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                )}
              </Button>
            </>
          )}

          {activeMethod === 'bunker' && (
            <div className="space-y-3">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Enter your bunker URL to connect using a remote signer.
                  Example: bunker://pubkey?relay=wss://relay.url
                </AlertDescription>
              </Alert>

              <Input
                type="text"
                placeholder="bunker://..."
                value={bunkerUrl}
                onChange={(e) => setBunkerUrl(e.target.value)}
                disabled={isConnecting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && bunkerUrl) {
                    handleBunkerLogin();
                  }
                }}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleBunkerLogin}
                  disabled={!bunkerUrl || isConnecting}
                  className="flex-1"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Connect
                </Button>
                <Button
                  onClick={() => setActiveMethod(null)}
                  variant="outline"
                  disabled={isConnecting}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {activeMethod === 'private-key' && (
            <div className="space-y-3">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Enter your private key (nsec or hex format). This will be stored locally in your browser.
                </AlertDescription>
              </Alert>

              <Input
                type="password"
                placeholder="nsec1... or hex key"
                value={nsec}
                onChange={(e) => setNsec(e.target.value)}
                disabled={isConnecting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nsec) {
                    handlePrivateKeyLogin();
                  }
                }}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handlePrivateKeyLogin}
                  disabled={!nsec || isConnecting}
                  className="flex-1"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Login
                </Button>
                <Button
                  onClick={() => setActiveMethod(null)}
                  variant="outline"
                  disabled={isConnecting}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}