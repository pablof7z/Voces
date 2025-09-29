import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertCircle, Info, ExternalLink, Loader2, Search, Check } from 'lucide-react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { CashuMint, type GetInfoResponse } from '@cashu/cashu-ts';
import type { NDKFilter, NDKKind } from '@nostr-dev-kit/ndk';
import { useWalletStore } from '@/stores/walletStore';
import { motion } from 'framer-motion';

interface DiscoverMintsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiscoveredMint {
  url: string;
  info?: GetInfoResponse & { pubkey?: string };
  fromEvent?: boolean;
}

export function DiscoverMintsModal({ isOpen, onClose }: DiscoverMintsModalProps) {
  const { ndk } = useNDK();
  const mints = useWalletStore((state) => state.mints);
  const addMint = useWalletStore((state) => state.addMint);

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredMints, setDiscoveredMints] = useState<DiscoveredMint[]>([]);
  const [loadingMintInfo, setLoadingMintInfo] = useState<Set<string>>(new Set());
  const [addedMints, setAddedMints] = useState<Set<string>>(new Set());

  const fetchMintInfo = async (url: string) => {
    try {
      const mint = new CashuMint(url);
      const info = await mint.getInfo();
      return info;
    } catch (error) {
      console.error(`Failed to fetch mint info for ${url}:`, error);
      return null;
    }
  };

  const handleDiscoverMints = async () => {
    if (!ndk) return;

    setIsDiscovering(true);
    setDiscoveredMints([]);
    setAddedMints(new Set());

    try {
      // NIP-87: Discover Cashu mints
      const filters: NDKFilter[] = [
        {
          kinds: [38000 as NDKKind], // Mint announcements
          limit: 100
        },
        {
          kinds: [38172 as NDKKind], // Mint recommendations
          limit: 50
        }
      ];

      const events = await ndk.fetchEvents(filters);
      const mintUrls = new Set<string>();
      const mintEventInfo = new Map<string, { name?: string; description?: string; pubkey?: string }>();

      events.forEach((event) => {
        if (event.kind === 38000) {
          const uTag = event.tags.find((t) => t[0] === 'u');
          if (uTag && uTag[1]) {
            mintUrls.add(uTag[1]);

            const dTag = event.tags.find((t) => t[0] === 'd');
            const nameTag = event.tags.find((t) => t[0] === 'name');

            mintEventInfo.set(uTag[1], {
              name: nameTag?.[1] || dTag?.[1],
              description: event.content,
              pubkey: event.pubkey
            });
          }
        } else if (event.kind === 38172) {
          const uTag = event.tags.find((t) => t[0] === 'u');
          if (uTag && uTag[1]) {
            mintUrls.add(uTag[1]);
          }
        }
      });

      // Also check for mints in kind 10019 (wallet info) for backwards compatibility
      const walletInfoFilter: NDKFilter = {
        kinds: [10019 as NDKKind],
        limit: 20
      };

      const walletEvents = await ndk.fetchEvents(walletInfoFilter);
      walletEvents.forEach((event) => {
        const mintTag = event.tags.find((t) => t[0] === 'mint');
        if (mintTag && mintTag[1]) {
          mintUrls.add(mintTag[1]);
        }
      });

      // Convert to array and fetch mint info for each
      const mintList: DiscoveredMint[] = [];
      const loadingSet = new Set<string>();

      for (const url of Array.from(mintUrls)) {
        // Skip already added mints
        if (mints.includes(url)) continue;

        const eventInfo = mintEventInfo.get(url);
        mintList.push({
          url,
          info: eventInfo ? ({
            name: eventInfo.name,
            description: eventInfo.description,
            pubkey: eventInfo.pubkey
          } as GetInfoResponse & { pubkey?: string }) : undefined,
          fromEvent: !!eventInfo
        });

        loadingSet.add(url);
      }

      // Sort by whether we have info from events
      mintList.sort((a, b) => {
        if (a.fromEvent && !b.fromEvent) return -1;
        if (!a.fromEvent && b.fromEvent) return 1;
        return 0;
      });

      setDiscoveredMints(mintList);
      setLoadingMintInfo(loadingSet);

      // Fetch mint info asynchronously
      for (const mint of mintList) {
        fetchMintInfo(mint.url).then(info => {
          if (info) {
            setDiscoveredMints(prev =>
              prev.map(m =>
                m.url === mint.url
                  ? { ...m, info: { ...m.info, ...info } }
                  : m
              ).sort((a, b) => {
                const aHasInfo = a.info && (a.info.name || a.info.description);
                const bHasInfo = b.info && (b.info.name || b.info.description);
                if (aHasInfo && !bHasInfo) return -1;
                if (!aHasInfo && bHasInfo) return 1;
                return 0;
              })
            );
          }
          setLoadingMintInfo(prev => {
            const newSet = new Set(prev);
            newSet.delete(mint.url);
            return newSet;
          });
        });
      }
    } catch (error) {
      console.error('Failed to discover mints:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddMint = (mint: DiscoveredMint) => {
    addMint(mint.url);
    setAddedMints(prev => new Set([...prev, mint.url]));
    setDiscoveredMints(prev => prev.filter(m => m.url !== mint.url));
  };

  // Auto-discover when modal opens
  useEffect(() => {
    if (isOpen && discoveredMints.length === 0 && !isDiscovering) {
      handleDiscoverMints();
    }
  }, [isOpen]);

  const handleClose = () => {
    setDiscoveredMints([]);
    setAddedMints(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Discover Cashu Mints
          </DialogTitle>
          <DialogDescription>
            Find and add Cashu mints from the Nostr network (NIP-87)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isDiscovering && discoveredMints.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Discovering mints from the network...
              </p>
            </div>
          )}

          {!isDiscovering && discoveredMints.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-400 mb-4" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                No new mints discovered
              </p>
              <button
                onClick={handleDiscoverMints}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {discoveredMints.length > 0 && (
            <div className="space-y-3 pb-4">
              {addedMints.size > 0 && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Added {addedMints.size} mint{addedMints.size > 1 ? 's' : ''} successfully
                  </span>
                </div>
              )}

              {discoveredMints.map((mint, index) => (
                <motion.div
                  key={mint.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {mint.info?.name ? (
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {mint.info.name}
                          </h4>
                        ) : (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                            {loadingMintInfo.has(mint.url) ? 'Loading mint info...' : 'Unknown mint'}
                          </span>
                        )}
                        {mint.info?.contact && (
                          <button
                            onClick={() => {
                              const contact = mint.info?.contact?.find(c => c[0] === 'website');
                              if (contact?.[1]) window.open(contact[1], '_blank');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            title="Visit mint website"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {mint.info?.description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                          {mint.info.description}
                        </p>
                      )}

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-neutral-500 dark:text-neutral-500 font-mono break-all">
                          {mint.url}
                        </span>

                        {mint.info?.nuts && (
                          <div className="flex items-center gap-2 mt-1">
                            <Info className="w-3 h-3 text-neutral-400" />
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              Supports {Object.keys(mint.info.nuts).length} NUT(s)
                            </span>
                          </div>
                        )}

                        {mint.info?.motd && (
                          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-xs text-amber-700 dark:text-amber-300">
                            📢 {mint.info.motd}
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddMint(mint)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                    >
                      Add
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {discoveredMints.length > 0 && !isDiscovering && (
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Found {discoveredMints.length} new mint{discoveredMints.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDiscoverMints}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}