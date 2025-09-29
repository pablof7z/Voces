import { useProfile, useNDK, useNDKCurrentUser, useEvent } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk-hooks';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Copy, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ZapButton } from '@/components/wallet/ZapButton';
import { walletLogger } from '@/utils/walletLogger';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Link, useNavigate } from 'react-router-dom';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { nip19 } from 'nostr-tools';

// Custom function for abbreviated timestamps
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

interface NoteCardProps {
  event: NDKEvent;
  isLargeText?: boolean;
}

export function NoteCard({ event, isLargeText = false }: NoteCardProps) {
  const profile = useProfile(event.pubkey);
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Determine what this note is replying to
  let replyToEventId: string | undefined;

  // First, check for explicit 'reply' marker
  const replyTag = event.tags.find(tag =>
    tag[0] === 'e' && tag[3] === 'reply'
  );

  if (replyTag) {
    replyToEventId = replyTag[1];
  } else {
    // Check for 'root' marker as fallback
    const rootTag = event.tags.find(tag =>
      tag[0] === 'e' && tag[3] === 'root'
    );

    if (rootTag) {
      replyToEventId = rootTag[1];
    } else {
      // If there's only a single 'e' tag with no marker, it's likely a reply to that event
      const eTags = event.tags.filter(tag => tag[0] === 'e');
      if (eTags.length === 1) {
        replyToEventId = eTags[0][1];
      }
    }
  }

  // Fetch the event being replied to
  const replyToEvent = useEvent(replyToEventId || '');
  const replyToProfile = useProfile(replyToEvent?.pubkey || '');
  
  const handleLike = async () => {
    if (!currentUser || !ndk) return;
    
    try {
      const reaction = new NDKEvent(ndk);
      reaction.kind = NDKKind.Reaction;
      reaction.content = isLiked ? '-' : '+';
      reaction.tags = [
        ['e', event.id],
        ['p', event.pubkey]
      ];
      
      await reaction.publish();
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Failed to publish reaction:', error);
    }
  };

  const handleRepost = async () => {
    if (!currentUser || !ndk) return;
    
    try {
      const repost = new NDKEvent(ndk);
      repost.kind = NDKKind.Repost;
      repost.content = '';
      repost.tags = [
        ['e', event.id],
        ['p', event.pubkey]
      ];
      
      await repost.publish();
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  };

  const displayName = profile?.name || 'Anonymous';
  const npub = nip19.npubEncode(event.pubkey);
  const handle = profile?.nip05 ? `@${profile.nip05.split('@')[0]}` : `@${npub.slice(5, 12)}`;

  // Check if content exceeds 60vh
  useEffect(() => {
    if (contentRef.current) {
      const viewportHeight = window.innerHeight;
      const maxHeight = viewportHeight * 0.6; // 60vh
      const contentHeight = contentRef.current.scrollHeight;
      setNeedsExpansion(contentHeight > maxHeight);
    }
  }, [event.content]);

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

  const handleCopyId = () => {
    navigator.clipboard.writeText(event.encode());
    setDropdownOpen(false);
  };

  const handleViewRaw = () => {
    setShowRawEvent(true);
    setDropdownOpen(false);
  };

  return (
    <>
    <article
      className="bg-white dark:bg-black border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all duration-150 cursor-pointer"
      onClick={handleNoteClick}>
      <div className="px-4 py-3 sm:px-5 sm:py-4 relative">
        {/* Timestamp in top right corner */}
        <time
          className="absolute top-3 right-4 sm:top-4 sm:right-5 text-neutral-500 dark:text-neutral-400 text-[13px] sm:text-sm hover:underline cursor-help"
          title={new Date(event.created_at! * 1000).toLocaleString()}
        >
          {formatTimeAgo(event.created_at!)}
        </time>

        {/* Mobile: Stack layout, Desktop: Side-by-side */}
        <div className="flex flex-col sm:flex-row sm:gap-3">
          {/* Mobile header (avatar + author info) */}
          <div className="flex items-start gap-3 mb-2 sm:hidden">
            <Link to={`/p/${npub}`} className="flex-shrink-0">
              <UserAvatar
                pubkey={event.pubkey}
                size="md"
                className="w-10 h-10 ring-1 ring-neutral-200/50 dark:ring-neutral-800/50 shadow-soft"
              />
            </Link>
            <div className="flex-1 min-w-0 pr-24">
              <Link
                to={`/p/${npub}`}
                className="flex items-center gap-1 hover:opacity-75 transition-opacity"
              >
                <span className="font-medium text-[15px] text-neutral-900 dark:text-white whitespace-nowrap">
                  {displayName}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 text-[13px] whitespace-nowrap">
                  {handle}
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop avatar */}
          <Link to={`/p/${npub}`} className="hidden sm:block flex-shrink-0">
            <UserAvatar
              pubkey={event.pubkey}
              size="md"
              className="w-11 h-11 ring-1 ring-neutral-200/50 dark:ring-neutral-800/50 shadow-soft"
            />
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop author info */}
            <div className="hidden sm:flex items-center gap-2 pr-32">
              <Link
                to={`/p/${npub}`}
                className="flex items-center gap-1.5 hover:opacity-75 transition-opacity min-w-0"
              >
                <span className="font-medium text-base text-neutral-900 dark:text-white whitespace-nowrap">
                  {displayName}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm whitespace-nowrap">
                  {handle}
                </span>
              </Link>
            </div>

            {/* Reply indicator */}
            {replyToEvent && (
              <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                <span>Replying to</span>
                <Link
                  to={`/p/${nip19.npubEncode(replyToEvent.pubkey)}`}
                  className="font-medium hover:underline text-neutral-700 dark:text-neutral-300"
                >
                  @{replyToProfile?.name || replyToProfile?.displayName || `${replyToEvent.pubkey.slice(0, 8)}...`}
                </Link>
              </div>
            )}

            {/* Note content */}
            <div className="mt-2 relative">
              <div
                ref={contentRef}
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  !isExpanded && needsExpansion && "max-h-[60vh]"
                )}
              >
                <ContentRenderer
                  content={event.content.trim()}
                  emojiTags={event.tags}
                  event={event}
                  className={cn(
                    "text-neutral-800 dark:text-neutral-200 leading-relaxed",
                    isLargeText ? "text-lg sm:text-xl" : "text-[15px] sm:text-base"
                  )}
                />
                {/* Gradient fade when collapsed */}
                {!isExpanded && needsExpansion && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
                )}
              </div>

              {/* Read More/Less Button */}
              {needsExpansion && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-800 transition-all duration-200"
                >
                  <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 -ml-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {/* TODO: Implement reply */}}
                  className="group flex items-center gap-1.5 p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200"
                  disabled={!currentUser}
                >
                  <MessageCircle className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300" strokeWidth={1.5} />
                  {/* Reply count will be shown when implemented */}
                </button>

                <button
                  onClick={handleRepost}
                  className="group flex items-center gap-1.5 p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200"
                  disabled={!currentUser}
                >
                  <Repeat2 className="w-4 h-4 text-neutral-500 group-hover:text-success-600 dark:text-neutral-500 dark:group-hover:text-success-400" strokeWidth={1.5} />
                  {/* Repost count will be shown when implemented */}
                </button>

                <button
                  onClick={handleLike}
                  className={cn(
                    "group flex items-center gap-1.5 p-2.5 rounded-lg transition-all duration-200",
                    isLiked
                      ? "bg-danger-50 dark:bg-danger-950/20"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                  )}
                  disabled={!currentUser}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-all duration-200",
                      isLiked
                        ? "fill-current text-danger-500 dark:text-danger-400"
                        : "text-neutral-500 group-hover:text-danger-500 dark:text-neutral-500 dark:group-hover:text-danger-400"
                    )}
                    strokeWidth={1.5}
                  />
                  {likeCount > 0 && (
                    <span className={cn(
                      "text-sm font-medium",
                      isLiked
                        ? "text-red-500 dark:text-red-400"
                        : "text-neutral-500 group-hover:text-red-500 dark:text-neutral-400 dark:group-hover:text-red-400"
                    )}>
                      {likeCount}
                    </span>
                  )}
                </button>

                {/* Zap Button */}
                <ZapButton
                  event={event}
                  onZap={(amount, success) => {
                    if (success) {
                      walletLogger.info(`Zapped ${amount} sats to ${event.pubkey}`, 'NoteCard');
                    }
                  }}
                />

                <button
                  onClick={() => {/* TODO: Implement share */}}
                  className="group p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200"
                >
                  <Share className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300" strokeWidth={1.5} />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200"
                >
                  <MoreHorizontal className="w-4 h-4 text-neutral-400 dark:text-neutral-600" strokeWidth={1.5} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 rounded-t-lg"
                    >
                      <Copy className="w-4 h-4" />
                      Copy ID
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRaw();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 rounded-b-lg"
                    >
                      <Code2 className="w-4 h-4" />
                      View Raw Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>

    {/* Raw Event Modal */}
    {showRawEvent && (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowRawEvent(false)}
        />
        <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full z-50">
          <div className="bg-white dark:bg-black rounded-lg shadow-xl h-full md:h-auto max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold">Raw Event</h3>
              <button
                onClick={() => setShowRawEvent(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-neutral-50 dark:bg-black p-4 rounded-lg">
                <code className="language-json">
                  {event.inspect}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
}