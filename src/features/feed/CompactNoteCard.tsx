import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk-hooks';
import { Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZapButton } from '@/components/wallet/ZapButton';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Link, useNavigate } from 'react-router-dom';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { nip19 } from 'nostr-tools';

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const then = timestamp * 1000;
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
}

interface CompactNoteCardProps {
  event: NDKEvent;
  showActions?: boolean;
}

export function CompactNoteCard({ event, showActions = true }: CompactNoteCardProps) {
  const profile = useProfile(event.pubkey);
  const navigate = useNavigate();

  const displayName = profile?.name || 'Anonymous';
  const npub = nip19.npubEncode(event.pubkey);
  const handle = profile?.nip05 ? `@${profile.nip05.split('@')[0]}` : `@${npub.slice(5, 12)}`;

  const handleNoteClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    const neventId = event.encode();
    navigate(`/e/${neventId}`);
  };

  return (
    <article
      className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all duration-150 cursor-pointer"
      onClick={handleNoteClick}
    >
      <div className="px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex gap-2.5">
          {/* Avatar */}
          <Link to={`/p/${npub}`} className="flex-shrink-0">
            <UserAvatar
              pubkey={event.pubkey}
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9"
            />
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author info inline with content */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <Link
                to={`/p/${npub}`}
                className="inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
              >
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  {displayName}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {handle}
                </span>
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                · {formatTimeAgo(event.created_at!)}
              </span>
            </div>

            {/* Note content - more compact */}
            <div className="mt-1">
              <ContentRenderer
                content={event.content.trim()}
                emojiTags={event.tags}
                event={event}
                className="text-[14px] sm:text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-3"
              />
            </div>

            {/* Minimal action buttons */}
            {showActions && (
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement reply
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement repost
                  }}
                  className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                >
                  <Repeat2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement like
                  }}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                <ZapButton
                  event={event}
                  compact
                  onZap={(amount, success) => {
                    if (success) {
                      console.log(`Zapped ${amount} sats`);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}