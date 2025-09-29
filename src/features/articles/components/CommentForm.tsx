import { useState } from 'react';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKArticle, NDKEvent } from '@nostr-dev-kit/ndk';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface CommentFormProps {
  article: NDKArticle;
  onCommentPublished: (comment: NDKEvent) => void;
  onError: (error: string) => void;
}

export function CommentForm({ article, onCommentPublished, onError }: CommentFormProps) {
  const currentUser = useNDKCurrentUser();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentPublish = async () => {
    if (!currentUser || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const replyEvent = article.reply();
      replyEvent.content = replyContent;
      await replyEvent.publish();

      onCommentPublished(replyEvent);
      setReplyContent('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish comment';
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mb-8">
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
            placeholder="Share your thoughts..."
            className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCommentPublish}
              disabled={!replyContent.trim() || isSubmitting}
              className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isSubmitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}