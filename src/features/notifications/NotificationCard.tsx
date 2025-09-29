import type { NotificationGroup, NotificationType } from '@/stores/notificationStore';
import { useNDK, useProfile } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { Heart, MessageCircle, Repeat2, Zap, UserPlus, AtSign, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CompactNoteCard } from '@/features/feed/CompactNoteCard';

interface NotificationCardProps {
  group: NotificationGroup;
  onRead?: () => void;
}

export function NotificationCard({ group, onRead }: NotificationCardProps) {
  const {ndk} = useNDK();
  const [targetEvent, setTargetEvent] = useState<NDKEvent | null>(null);

  // Get the primary actors (max 3 for display)
  const actors = [...new Set(group.sourceEvents.map(e => e.pubkey))].slice(0, 3);

  // Fetch target event for reactions/replies
  useEffect(() => {
    if ((group.type === 'reaction' || group.type === 'reply') && group.sourceEvents[0]) {
      const eTags = group.sourceEvents[0].tags.filter(t => t[0] === 'e');
      if (eTags.length > 0) {
        const targetId = eTags[eTags.length - 1][1];
        ndk.fetchEvent(targetId).then(event => {
          if (event) setTargetEvent(event);
        });
      }
    }
  }, [group, ndk]);

  // Mark as read when visible
  useEffect(() => {
    if (!group.read && onRead) {
      onRead();
    }
  }, [group.read, onRead]);

  const getIcon = () => {
    switch (group.type) {
      case 'reaction':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'reply':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'repost':
        return <Repeat2 className="w-5 h-5 text-green-500" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-orange-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-indigo-500" />;
      default:
        return <MoreHorizontal className="w-5 h-5 text-neutral-500" />;
    }
  };

  const getActionText = () => {
    const count = group.sourceEvents.length;

    switch (group.type) {
      case 'reaction':
        return count > 1
          ? `and ${count - 1} ${count === 2 ? 'other' : 'others'} reacted to your note`
          : 'reacted to your note';
      case 'reply':
        return count > 1
          ? `and ${count - 1} ${count === 2 ? 'other' : 'others'} replied to your note`
          : 'replied to your note';
      case 'repost':
        return count > 1
          ? `and ${count - 1} ${count === 2 ? 'other' : 'others'} reposted your note`
          : 'reposted your note';
      case 'zap':
        const totalSats = group.sourceEvents.reduce((sum, event) => {
          const zapAmount = event.tags.find(t => t[0] === 'amount');
          return sum + (zapAmount ? parseInt(zapAmount[1]) / 1000 : 0);
        }, 0);
        return `zapped ${totalSats} sats`;
      case 'follow':
        return count > 1
          ? `and ${count - 1} ${count === 2 ? 'other' : 'others'} followed you`
          : 'followed you';
      case 'mention':
        return 'mentioned you';
      default:
        return 'interacted with you';
    }
  };

  return (
    <div
      className={cn(
        "px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors border-b border-neutral-200 dark:border-neutral-800",
        !group.read && "bg-blue-50/30 dark:bg-blue-900/10"
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Actors and action text on same line */}
          <div className="flex items-start gap-2 mb-2">
            <ActorAvatars pubkeys={actors} />
            <div className="flex-1">
              <span className="text-sm">
                <ActorNames pubkeys={actors} />
                <span className="text-neutral-600 dark:text-neutral-400 ml-1">
                  {getActionText()}
                </span>
              </span>
            </div>
          </div>

          {/* Target content preview */}
          {targetEvent && (
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-sm">
              <p className="line-clamp-2 text-neutral-700 dark:text-neutral-300">
                {targetEvent.content}
              </p>
            </div>
          )}

          {/* For replies and mentions, show the actual note content in compact form */}
          {(group.type === 'reply' || group.type === 'mention') && group.sourceEvents[0] && (
            <div className="mt-2 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <CompactNoteCard event={group.sourceEvents[0]} showActions={false} />
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
            {formatDistanceToNow(new Date(group.latestTimestamp * 1000), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActorAvatars({ pubkeys }: { pubkeys: string[] }) {
  return (
    <div className="flex -space-x-2">
      {pubkeys.map(pubkey => (
        <Avatar
          key={pubkey}
          pubkey={pubkey}
          size="xs"
          className="border-2 border-white dark:border-black"
        />
      ))}
    </div>
  );
}

function ActorNames({ pubkeys }: { pubkeys: string[] }) {
  const names = pubkeys.map((pk, index) => (
    <span key={pk}>
      <ActorName pubkey={pk} />
      {index < pubkeys.length - 1 && ', '}
    </span>
  ));

  return (
    <span className="font-medium text-neutral-900 dark:text-neutral-100">
      {names}
    </span>
  );
}

function ActorName({ pubkey }: { pubkey: string }) {
  const profile = useProfile(pubkey);
  const displayName = profile?.name || `${pubkey.slice(0, 8)}...`;

  return <span>{displayName}</span>;
}