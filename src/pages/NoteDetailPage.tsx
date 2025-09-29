import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useProfile, useNDK, useNDKCurrentUser, useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk-hooks';
import { ArrowLeft } from 'lucide-react';
import { NoteCard } from '@/features/feed/NoteCard';
import { CompactNoteCard } from '@/features/feed/CompactNoteCard';
import { ThreadNoteCard } from '@/components/thread/ThreadNoteCard';
import { useState, useMemo } from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function NoteDetailPage() {
  const { nevent } = useParams<{ nevent: string }>();
  const navigate = useNavigate();
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticReply, setOptimisticReply] = useState<NDKEvent | null>(null);

  // Fetch the main event
  const event = useEvent(nevent ?? false);
  const profile = useProfile(event?.pubkey);

  // Extract root event ID from the main event's tags
  const rootEventId = useMemo(() => {
    if (!event) return null;

    // Find root tag
    const rootTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
    if (rootTag) {
      return rootTag[1];
    }

    // If no root tag, check if there's a reply tag (this might be the root itself)
    const replyTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
    if (replyTag) {
      return replyTag[1];
    }

    // Fallback for older format - first 'e' tag might be the root
    const eTags = event.tags.filter(tag => tag[0] === 'e');
    if (eTags.length > 0) {
      return eTags[0][1];
    }

    return null;
  }, [event]);

  // Subscribe to root event and all events in the thread
  const { events: threadEvents } = useSubscribe(
    rootEventId ? [
      { ids: [rootEventId] }, // Get the root event
      { kinds: [1], '#e': [rootEventId] } // Get all events replying to root
    ] : false,
    {
      closeOnEose: true // Close after initial fetch since thread structure won't change
    }
  );

  // Build the parent thread chain by walking back from the target event
  const parentNotes = useMemo(() => {
    if (!event || !threadEvents || threadEvents.length === 0) return [];

    const parents: NDKEvent[] = [];
    const eventMap = new Map(threadEvents.map(e => [e.id, e]));

    // Start from our target event and walk back to root
    let currentEvent = event;

    while (currentEvent) {
      // Find the parent of the current event
      const replyTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
      const rootTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');

      let parentId: string | null = null;

      if (replyTag) {
        // If there's a reply tag, that's the immediate parent
        parentId = replyTag[1];
      } else if (rootTag && rootTag[1] !== currentEvent.id) {
        // If only root tag exists and it's not self, that's the parent
        parentId = rootTag[1];
      } else {
        // Fallback: check for any 'e' tags (older format)
        const eTags = currentEvent.tags.filter(tag => tag[0] === 'e');
        if (eTags.length > 0) {
          // The last e-tag is usually the immediate parent in older format
          parentId = eTags[eTags.length - 1][1];
        }
      }

      if (parentId && eventMap.has(parentId)) {
        const parentEvent = eventMap.get(parentId)!;
        parents.unshift(parentEvent);
        currentEvent = parentEvent;
      } else {
        // No more parents found or parent not in our event map
        break;
      }
    }

    return parents;
  }, [event, threadEvents]);

  // Fetch replies in real-time
  const { events: replyEvents } = useSubscribe(
    event ? {
      kinds: [1],
      '#e': [event.id]
    } : false,
    {
      closeOnEose: false // Keep subscription open for real-time updates
    }
  );

  // Filter and sort replies
  const replies = useMemo(() => {
    if (!replyEvents || !event) return [];
    
    // Filter for direct replies only
    const directReplies = replyEvents.filter(reply => {
      const replyTag = reply.tags.find(tag =>
        tag[0] === 'e' && tag[3] === 'reply'
      );
      // If there's a specific reply tag, check if it's replying to our event
      if (replyTag) {
        return replyTag[1] === event.id;
      }
      // Otherwise check if our event is the last 'e' tag (older format)
      const eTags = reply.tags.filter(tag => tag[0] === 'e');
      return eTags.length > 0 && eTags[eTags.length - 1][1] === event.id;
    });
    
    // Add optimistic reply if present
    const allReplies = optimisticReply 
      ? [optimisticReply, ...directReplies.filter(r => r.id !== optimisticReply.id)]
      : directReplies;
    
    // Sort by creation time (oldest first for better thread reading)
    return allReplies.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  }, [replyEvents, event, optimisticReply]);

  const handleReply = async () => {
    if (!ndk || !replyContent || !currentUser || !event) return;
    
    // Optimistically close the reply UI
    setIsSubmitting(true);
    
    try {
      // Create and publish the reply using the correct NDK method
      const replyEvent = await event.reply(replyContent);
      
      // Optimistically add the reply
      setOptimisticReply(replyEvent);
      
      await replyEvent.publish();
      
      // Reset content only after a successful publish
      setReplyContent('');
      
      // Clear optimistic reply after a delay (real event should arrive via subscription)
      setTimeout(() => setOptimisticReply(null), 2000);
    } catch (error) {
      console.error('Failed to publish reply:', error);
      // Re-open the reply box or show an error to the user
      alert('Failed to send reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove hard loading state - render progressively as data arrives
  if (!event) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-black">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Thread</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Thread</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto">
        {/* Parent Notes (Thread Context) */}
        {parentNotes.map((parentNote, index) => (
          <ThreadNoteCard
            key={parentNote.id}
            event={parentNote}
            showConnector={index > 0}
            isLastInThread={false}
          />
        ))}

        {/* Main Note - Highlighted */}
        <ThreadNoteCard
          event={event}
          isMainNote={true}
          showConnector={parentNotes.length > 0}
        />

        {/* Reply Box */}
        {currentUser && (
          <div className="border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex gap-3">
              <UserAvatar
                pubkey={currentUser.pubkey}
                size="md"
                className="w-10 h-10 flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${profile?.name || 'this note'}...`}
                  className="w-full min-h-[100px] p-3 bg-neutral-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim() || isSubmitting}
                    className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        <div>
          {replies.length > 0 ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h2>
              </div>
              {replies.map(reply => (
                <CompactNoteCard key={reply.id} event={reply} />
              ))}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No replies yet. Be the first to reply!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}