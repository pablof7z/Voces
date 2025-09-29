import { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  pubkey: string;
  npub: string;
}

export function ShareProfileModal({ isOpen, onClose, pubkey, npub }: ShareProfileModalProps) {
  const profile = useProfile(pubkey);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedNpub, setCopiedNpub] = useState(false);

  if (!isOpen) return null;

  const profileUrl = `https://voces.xyz/p/${npub}`;
  const shareMessage = `Find me on Nostr: ${profileUrl}`;

  const copyToClipboard = async (text: string, type: 'url' | 'npub') => {
    await navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedNpub(true);
      setTimeout(() => setCopiedNpub(false), 2000);
    }
  };

  const shareOnPlatform = (platform: 'whatsapp' | 'twitter' | 'telegram' | 'facebook') => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(profileUrl);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent('Find me on Nostr')}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    };

    window.open(urls[platform], '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || 'Anonymous'} on Nostr`,
          text: 'Find me on Nostr',
          url: profileUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">Share Profile</h2>

          {/* Profile Card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 mb-6">
            <div className="flex flex-col items-center text-white">
              <div className="relative mb-4">
                <UserAvatar pubkey={pubkey} size="xl" className="ring-4 ring-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-1">{profile?.name || 'Anonymous'}</h3>
              {profile?.nip05 && (
                <p className="text-white/80 text-sm">@{profile.nip05.split('@')[0]}</p>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <QRCodeSVG
              value={profileUrl}
              size={200}
              level="H"
              includeMargin={false}
              className="rounded-lg"
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          {/* Copy Actions */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => copyToClipboard(profileUrl, 'url')}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">voces.xyz/p/{npub.slice(0, 8)}...</span>
              {copiedUrl ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => copyToClipboard(npub, 'npub')}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">Copy npub</span>
              {copiedNpub ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Share on:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareOnPlatform('whatsapp')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>

              <button
                onClick={() => shareOnPlatform('twitter')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-neutral-900 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </button>

              <button
                onClick={() => shareOnPlatform('telegram')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </button>

              <button
                onClick={() => shareOnPlatform('facebook')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Native Share Button (if available) */}
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mt-3"
              >
                <Share2 className="w-5 h-5" />
                More Options
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}