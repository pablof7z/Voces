import { NDKArticle } from '@nostr-dev-kit/ndk';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { useArticleComments } from '../hooks/useArticleComments';
import { ARTICLE_STYLES } from '../constants/styles';

interface CommentSectionProps {
  article: NDKArticle;
  onError: (error: string) => void;
}

export function CommentSection({ article, onError }: CommentSectionProps) {
  const { comments, isLoading, addComment } = useArticleComments(article);

  return (
    <div className={`mt-8 ${ARTICLE_STYLES.CARD_BG} rounded-xl ${ARTICLE_STYLES.CARD_BORDER} overflow-hidden`}>
      <div className={`px-8 py-6 ${ARTICLE_STYLES.SECTION_DIVIDER}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
          Comments ({comments.length})
        </h2>
      </div>

      <CommentForm
        article={article}
        onCommentPublished={addComment}
        onError={onError}
      />

      <CommentList comments={comments} isLoading={isLoading} />
    </div>
  );
}