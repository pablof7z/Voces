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

    console.log('===== Analyzing event tags for root =====');
    console.log('Event ID:', event.id);
    console.log('Event tags:', event.tags);

    // Find root tag
    const rootTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
    if (rootTag) {
      console.log('Found root tag:', rootTag);
      console.log('Root event ID:', rootTag[1]);
      return rootTag[1];
    }

    // If no root tag, check if there's a reply tag (this might be the root itself)
    const replyTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
    if (replyTag) {
      console.log('No root tag, but found reply tag:', replyTag);
      console.log('Using reply as potential root:', replyTag[1]);
      return replyTag[1];
    }

    // Fallback for older format - first 'e' tag might be the root
    const eTags = event.tags.filter(tag => tag[0] === 'e');
    if (eTags.length > 0) {
      console.log('Fallback: using first e-tag as root:', eTags[0]);
      return eTags[0][1];
    }

    console.log('No root event found - this might be a root event itself');
    return null;
  }, [event]);

  // Subscribe to root event and all events in the thread
  const subscriptionFilters = useMemo(() => {
    if (!rootEventId) {
      console.log('No root ID, skipping thread subscription');
      return false;
    }

    const filters = [
      { ids: [rootEventId] }, // Get the root event
      { kinds: [1], '#e': [rootEventId] } // Get all events replying to root
    ];

    console.log('===== Thread subscription filters =====');
    console.log('Subscribing with filters:', JSON.stringify(filters, null, 2));

    return filters;
  }, [rootEventId]);

  const { events: threadEvents } = useSubscribe(
    subscriptionFilters,
    {
      closeOnEose: false, // Close after initial fetch since thread structure won't change
      subId: 'note-detail-page'
    }
  );

  // Log thread events as they come in
  useMemo(() => {
    if (threadEvents && threadEvents.length > 0) {
      console.log('===== Thread events received =====');
      console.log('Total thread events:', threadEvents.length);
      threadEvents.forEach(e => {
        console.log(`Event ${e.id.slice(0, 8)}...`, {
          created_at: e.created_at,
          content: e.content.slice(0, 50) + '...',
          tags: e.tags.filter(t => t[0] === 'e')
        });
      });
    }
  }, [threadEvents]);

  // Build the parent thread chain by walking back from the target event
  const parentNotes = useMemo(() => {
    console.log('===== Building parent chain =====');

    if (!event) {
      console.log('No target event yet');
      return [];
    }

    if (!threadEvents || threadEvents.length === 0) {
      console.log('No thread events loaded yet');
      return [];
    }

    console.log('Building parent chain from', threadEvents.length, 'thread events');

    const parents: NDKEvent[] = [];
    const eventMap = new Map(threadEvents.map(e => [e.id, e]));
    console.log('Event map size:', eventMap.size);

    // Start from our target event and walk back to root
    let currentEvent = event;
    let iteration = 0;

    while (currentEvent && iteration < 20) { // Safety limit
      iteration++;
      console.log(`\nIteration ${iteration}: Checking event ${currentEvent.id.slice(0, 8)}...`);

      // Find the parent of the current event
      const replyTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
      const rootTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');

      console.log('Reply tag:', replyTag);
      console.log('Root tag:', rootTag);

      let parentId: string | null = null;

      if (replyTag) {
        // If there's a reply tag, that's the immediate parent
        parentId = replyTag[1];
        console.log('Using reply tag for parent:', parentId.slice(0, 8));
      } else if (rootTag && rootTag[1] !== currentEvent.id) {
        // If only root tag exists and it's not self, that's the parent
        parentId = rootTag[1];
        console.log('Using root tag for parent:', parentId.slice(0, 8));
      } else {
        // Fallback: check for any 'e' tags (older format)
        const eTags = currentEvent.tags.filter(tag => tag[0] === 'e');
        if (eTags.length > 0) {
          // The last e-tag is usually the immediate parent in older format
          parentId = eTags[eTags.length - 1][1];
          console.log('Using last e-tag for parent (old format):', parentId.slice(0, 8));
        } else {
          console.log('No parent tags found');
        }
      }

      if (parentId && eventMap.has(parentId)) {
        const parentEvent = eventMap.get(parentId)!;
        console.log('✓ Found parent event in map:', parentId.slice(0, 8));
        parents.unshift(parentEvent);
        currentEvent = parentEvent;
      } else if (parentId) {
        console.log('✗ Parent ID not found in event map:', parentId.slice(0, 8));
        break;
      } else {
        console.log('No more parents - reached root or standalone event');
        break;
      }
    }

    console.log('\n===== Final parent chain =====');
    console.log('Parent chain length:', parents.length);
    parents.forEach((p, i) => {
      console.log(`${i + 1}. ${p.id.slice(0, 8)}... - "${p.content.slice(0, 30)}..."`);
    });

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