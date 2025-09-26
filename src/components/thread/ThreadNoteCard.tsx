import { NDKEvent } from '@nostr-dev-kit/ndk-hooks';
import { NoteCard } from '@/features/feed/NoteCard';
import { cn } from '@/lib/utils';

interface ThreadNoteCardProps {
  event: NDKEvent;
  isMainNote?: boolean;
  showConnector?: boolean;
  isLastInThread?: boolean;
}

export function ThreadNoteCard({
  event,
  isMainNote = false,
  showConnector = false,
  isLastInThread = false
}: ThreadNoteCardProps) {
  return (
    <div className="relative">
      {/* Thread connector line before the note */}
      {showConnector && !isMainNote && (
        <div className="absolute left-[29px] -top-px h-[73px] w-0.5 bg-gray-300 dark:bg-gray-700" />
      )}

      {/* The note itself with larger text for main note */}
      <div className="relative">
        <NoteCard event={event} isLargeText={isMainNote} />
      </div>

      {/* Thread connector line after the note */}
      {!isLastInThread && !isMainNote && (
        <div className="absolute left-[29px] top-[73px] bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700" />
      )}
    </div>
  );
}