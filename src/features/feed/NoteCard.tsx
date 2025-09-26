import { type NDKEvent, useProfile, useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent as NDKEventClass, NDKKind } from '@nostr-dev-kit/ndk';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ZapButton } from '@/components/wallet/ZapButton';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Link } from 'react-router-dom';
import { ContentRenderer } from '@/components/content/ContentRenderer';

interface NoteCardProps {
  event: NDKEvent;
}

export function NoteCard({ event }: NoteCardProps) {
  const profile = useProfile(event.author.pubkey);
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  const handleLike = async () => {
    if (!currentUser || !ndk) return;
    
    try {
      const reaction = new NDKEventClass(ndk);
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
      const repost = new NDKEventClass(ndk);
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
  const handle = profile?.nip05 ? `@${profile.nip05.split('@')[0]}` : `@${event.author?.npub?.slice(5, 12)}`;

  return (
    <article className="bg-white dark:bg-neutral-900/30 border-b border-neutral-200/50 dark:border-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200">
      <div className="px-5 py-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link to={`/p/${event.author.npub}`} className="flex-shrink-0">
            <UserAvatar
              pubkey={event.author.pubkey}
              size="md"
              className="w-11 h-11 ring-1 ring-neutral-200/50 dark:ring-neutral-800/50 shadow-soft"
            />
          </Link>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author info */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/p/${event.author.npub}`}
                className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
              >
                <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                  {displayName}
                </span>
                <span className="text-neutral-500 dark:text-neutral-500 text-sm font-normal">
                  {handle}
                </span>
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
              <time className="text-neutral-500 dark:text-neutral-500 text-xs font-normal hover:underline cursor-help">
                {formatDistanceToNow(new Date(event.created_at! * 1000), { addSuffix: true })}
              </time>
            </div>

            {/* Note content */}
            <div className="mt-2">
              <ContentRenderer
                content={event.content}
                className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed"
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 -ml-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {/* TODO: Implement reply */}}
                  className="group flex items-center gap-1.5 p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200"
                  disabled={!currentUser}
                >
                  <MessageCircle className="w-4 h-4 text-neutral-500 group-hover:text-accent-600 dark:text-neutral-500 dark:group-hover:text-accent-400" strokeWidth={1.5} />
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
                        ? "text-pink-500 dark:text-pink-400"
                        : "text-gray-500 group-hover:text-pink-500 dark:text-gray-400 dark:group-hover:text-pink-400"
                    )}>
                      {likeCount}
                    </span>
                  )}
                </button>

                {/* Zap Button */}
                <ZapButton
                  eventId={event.id}
                  authorPubkey={event.pubkey}
                  onZap={(amount) => console.log(`Zapped ${amount} sats to`, event.pubkey)}
                />

                <button
                  onClick={() => {/* TODO: Implement share */}}
                  className="group p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200"
                >
                  <Share className="w-4 h-4 text-neutral-500 group-hover:text-accent-600 dark:text-neutral-500 dark:group-hover:text-accent-400" strokeWidth={1.5} />
                </button>
              </div>

              <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200">
                <MoreHorizontal className="w-4 h-4 text-neutral-400 dark:text-neutral-600" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}