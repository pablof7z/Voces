import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNDKSessionLogin,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  useNDK
} from '@nostr-dev-kit/ndk-hooks';
import { NDKNip46Signer } from '@nostr-dev-kit/ndk';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chrome, Shield, Key, Sparkles, Loader2, Info, Globe, Users, Zap, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const login = useNDKSessionLogin();
  const { ndk } = useNDK();
  const navigate = useNavigate();

  const [modalState, setModalState] = useState<'signup' | 'login'>('signup');
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [nsec, setNsec] = useState('');
  const [bunkerUrl, setBunkerUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setModalState('signup');
    setActiveMethod(null);
    setNsec('');
    setBunkerUrl('');
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleStartOnboarding = () => {
    handleClose();
    navigate('/onboarding');
  };

  const handleExtensionLogin = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.nostr) {
        throw new Error('No Nostr extension found. Please install Alby, nos2x, or another NIP-07 compatible extension.');
      }
      const signer = new NDKNip07Signer();
      await login(signer);
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
    if (!ndk) {
      setError('NDK not initialized. Please refresh the page and try again.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const signer = NDKNip46Signer.bunker(ndk, bunkerUrl);
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
      <DialogContent className={modalState === 'signup' ? "sm:max-w-lg" : "sm:max-w-md"}>
        {modalState === 'signup' ? (
          // Signup State - Enticing card
          <>
            <div className="relative">
              {/* Hero Banner */}
              <div className="absolute inset-x-0 -top-6 h-32 bg-gradient-to-br from-orange-700 via-orange-600 to-red-700 rounded-t-lg" />

              {/* Content */}
              <div className="relative pt-20">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-3">Your Voice Matters</h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    Join a global community where every story counts
                  </p>
                </div>

                {/* Value Props */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Own Your Voice</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        No censorship. No gatekeepers. Your content, your control, forever.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Earn From Your Stories</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Get paid instantly in Bitcoin for valuable content. No banks, no fees.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Connect With Your Community</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Trade, share, and build with people who understand your journey.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleStartOnboarding}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white"
                  >
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <button
                    onClick={() => setModalState('login')}
                    className="w-full text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                  >
                    Already have a Nostr account? <span className="font-semibold underline">Sign in here</span>
                  </button>
                </div>

                {/* Trust Signals */}
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-center text-neutral-500 dark:text-neutral-500">
                    Built on Nostr protocol • No personal data required • Leave anytime with your content
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Login State - Existing login methods
          <>
            <DialogHeader>
              <DialogTitle>Welcome Back</DialogTitle>
              <DialogDescription>
                Sign in with your existing Nostr account
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

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-400">
                        Don't have an account?
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalState('signup')}
                    className="w-full text-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                  >
                    <span className="font-semibold underline">Create a new account</span>
                  </button>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}