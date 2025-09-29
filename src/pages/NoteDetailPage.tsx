import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useProfile, useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk-hooks';
import { ArrowLeft } from 'lucide-react';
import { NoteCard } from '@/features/feed/NoteCard';
import { ThreadNoteCard } from '@/components/thread/ThreadNoteCard';
import { useState, useEffect } from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function NoteDetailPage() {
  const { nevent } = useParams<{ nevent: string }>();
  const navigate = useNavigate();
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const [replies, setReplies] = useState<NDKEvent[]>([]);
  const [parentNotes, setParentNotes] = useState<NDKEvent[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the main event
  const event = useEvent(nevent ?? false);
  const profile = useProfile(event?.pubkey);

  // Fetch parent notes (thread context)
  useEffect(() => {
    if (!event || !ndk) return;

    const fetchThreadContext = async () => {
      const parents: NDKEvent[] = [];
      let currentEvent = event;

      // Walk up the thread to find all parent notes
      while (currentEvent) {
        // Find the reply/root tag
        const replyTag = currentEvent.tags.find(tag =>
          tag[0] === 'e' && (tag[3] === 'reply' || tag[3] === 'root')
        );

        // If no reply tag, check for any 'e' tag (older format)
        const eTag = replyTag || currentEvent.tags.find(tag => tag[0] === 'e');

        if (!eTag) break;

        const parentId = eTag[1];
        const parentEvent = await ndk.fetchEvent(parentId);

        if (parentEvent) {
          parents.unshift(parentEvent); // Add to beginning to maintain order
          currentEvent = parentEvent;
        } else {
          break;
        }
      }

      setParentNotes(parents);
    };

    fetchThreadContext();
  }, [event, ndk]);

  // Fetch replies
  useEffect(() => {
    if (!event || !ndk) return;

    const fetchReplies = async () => {
      const replyEvents = await ndk.fetchEvents({
        kinds: [NDKKind.Text],
        '#e': [event.id],
      });

      const replyArray = Array.from(replyEvents);
      // Filter out only direct replies (not replies to replies)
      const directReplies = replyArray.filter(reply => {
        const replyTag = reply.tags.find(tag =>
          tag[0] === 'e' && tag[3] === 'reply'
        );
        // If there's a specific reply tag, check if it's replying to our event
        // Otherwise check if our event is the last 'e' tag (older format)
        if (replyTag) {
          return replyTag[1] === event.id;
        }
        const eTags = reply.tags.filter(tag => tag[0] === 'e');
        return eTags.length > 0 && eTags[eTags.length - 1][1] === event.id;
      });

      // Sort by creation time (oldest first for better thread reading)
      directReplies.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
      setReplies(directReplies);
    };

    fetchReplies();
  }, [event, ndk]);

  const handleReply = async () => {
    if (!currentUser || !ndk || !event || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const reply = new NDKEvent(ndk);
      reply.kind = NDKKind.Text;
      reply.content = replyContent;
      reply.tags = [
        ['e', event.id, '', 'reply'],
        ['p', event.pubkey]
      ];

      // Add root tag if this event is also a reply
      const rootTag = event.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
      if (rootTag) {
        reply.tags.push(['e', rootTag[1], '', 'root']);
      } else {
        reply.tags.push(['e', event.id, '', 'root']);
      }

      await reply.publish();

      // Add the new reply to the list
      setReplies(prev => [reply, ...prev]);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to publish reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
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
                  className="w-full min-h-[100px] p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
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
                <NoteCard key={reply.id} event={reply} />
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