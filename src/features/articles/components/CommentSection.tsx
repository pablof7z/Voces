import { NDKArticle } from '@nostr-dev-kit/ndk';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { useArticleComments } from '../hooks/useArticleComments';

interface CommentSectionProps {
  article: NDKArticle;
  onError: (error: string) => void;
}

export function CommentSection({ article, onError }: CommentSectionProps) {
  const { comments, isLoading, addComment } = useArticleComments(article);

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-serif mb-2">
          Discussion
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
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