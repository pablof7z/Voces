import { NDKEvent } from '@nostr-dev-kit/ndk';
import { CommentCard } from './CommentCard';

interface CommentListProps {
  comments: NDKEvent[];
  isLoading: boolean;
}

export function CommentList({ comments, isLoading }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
        No comments yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map(comment => (
        <CommentCard key={comment.id} event={comment} />
      ))}
    </div>
  );
}