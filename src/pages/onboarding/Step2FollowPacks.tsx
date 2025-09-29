import { useState, useEffect } from 'react';
import { NDKFollowPack, NDKEvent } from '@nostr-dev-kit/ndk';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { nip19 } from 'nostr-tools';
import { FollowPackCard } from '@/features/followPacks/components/FollowPackCard';
import { FOLLOW_PACK_ADDRESSES, COMMUNITY_METADATA } from '@/config/followPacks';

interface Step2FollowPacksProps {
  selectedCommunity: string | null;
  selectedPacks: string[];
  onSelectPacks: (packs: string[]) => void;
  onNext: () => void;
}

export function Step2FollowPacks({ selectedCommunity, selectedPacks, onSelectPacks, onNext }: Step2FollowPacksProps) {
  const [loading, setLoading] = useState(true);
  const [followPacks, setFollowPacks] = useState<NDKFollowPack[]>([]);
  const { ndk } = useNDK();

  // Get follow pack addresses for the selected community
  const communityKey = selectedCommunity || 'venezuela';
  const packAddresses = FOLLOW_PACK_ADDRESSES[communityKey] || FOLLOW_PACK_ADDRESSES.venezuela || FOLLOW_PACK_ADDRESSES.default;
  const communityInfo = COMMUNITY_METADATA[communityKey] || COMMUNITY_METADATA.venezuela;

  // Fetch follow packs from naddr
  useEffect(() => {
    async function fetchPacks() {
      if (!ndk) return;

      setLoading(true);
      const packs: NDKFollowPack[] = [];

      for (const naddr of packAddresses) {
        try {
          // Decode the naddr
          const decoded = nip19.decode(naddr);
          if (decoded.type !== 'naddr') continue;

          const { identifier, pubkey, kind, relays } = decoded.data;

          // Fetch the event
          const filter = {
            kinds: [kind],
            authors: [pubkey],
            '#d': [identifier],
          };

          const event = await ndk.fetchEvent(filter, { closeOnEose: true }, relays ? new Set(relays) : undefined);

          if (event) {
            // Convert NDKEvent to NDKFollowPack
            const pack = NDKFollowPack.from(event as NDKEvent);
            packs.push(pack);
          }
        } catch (err) {
          console.error(`Error fetching pack ${naddr}:`, err);
        }
      }

      setFollowPacks(packs);
      setLoading(false);
    }

    fetchPacks();
  }, [ndk, packAddresses]);

  const handlePackClick = (pack: NDKFollowPack, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const packId = pack.encode();
    if (selectedPacks.includes(packId)) {
      onSelectPacks(selectedPacks.filter(id => id !== packId));
    } else {
      onSelectPacks([...selectedPacks, packId]);
    }
  };

  const handleNext = async () => {
    if (selectedPacks.length === 0) return;
    onNext();
  };


  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Visual */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80"
          alt="Community leaders"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="mb-8">
            <p className="text-3xl text-white/90 italic leading-relaxed">
              &quot;We&apos;re not just surviving—we&apos;re building the future our community deserves. One voice at a time.&quot;
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-semibold">
              MR
            </div>
            <div className="text-white">
              <div className="font-semibold">María Rodríguez</div>
              <div className="text-sm opacity-75">Community Organizer · Caracas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Follow Packs Grid */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="max-w-xl w-full">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3">Build Your Network</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
              Follow curated packs from the {communityInfo.name} community
            </p>
          </div>

          {loading ? (
            <div className="space-y-2 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-neutral-100 dark:bg-black rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Follow Pack List */}
              <div className="space-y-2 mb-6 lg:mb-8 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto p-2 -m-2">
                {followPacks.map((pack) => {
                  const isSelected = selectedPacks.includes(pack.encode());
                  return (
                    <div
                      key={pack.encode()}
                      onClick={(e) => handlePackClick(pack, e)}
                      className={`
                        relative cursor-pointer rounded-xl transition-all
                        ${isSelected
                          ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/20'
                          : ''
                        }
                      `}
                    >
                      {/* Wrapper div to intercept clicks */}
                      <div
                        className="pointer-events-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FollowPackCard pack={pack} variant="compact" />
                      </div>

                      {/* Selection checkmark */}
                      {isSelected && (
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-purple-500 text-white rounded-full p-1.5 z-10">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {followPacks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No follow packs available for this community yet
                </div>
              )}
            </>
          )}

          <button
            onClick={handleNext}
            disabled={selectedPacks.length === 0 || loading}
            className={`
              w-full py-3 lg:py-4 px-6 rounded-lg font-medium transition-all text-sm lg:text-base
              ${selectedPacks.length > 0 && !loading
                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
                : 'bg-neutral-100 dark:bg-black text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}