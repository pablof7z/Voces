import { useState } from 'react';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKArticle, NDKEvent } from '@nostr-dev-kit/ndk';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ARTICLE_STYLES } from '../constants/styles';

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
    <div className={`px-8 py-6 ${ARTICLE_STYLES.SECTION_DIVIDER}`}>
      <div className="flex gap-4">
        <UserAvatar
          pubkey={currentUser.pubkey}
          size="md"
          className={ARTICLE_STYLES.AVATAR_SMALL}
        />
        <div className="flex-1">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a comment..."
            className={`${ARTICLE_STYLES.INPUT_BASE} ${ARTICLE_STYLES.TEXTAREA_MIN_HEIGHT} font-sans`}
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleCommentPublish}
              disabled={!replyContent.trim() || isSubmitting}
              className={ARTICLE_STYLES.BUTTON_PRIMARY}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}