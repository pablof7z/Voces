import { NDKEvent } from '@nostr-dev-kit/ndk';
import { CommentCard } from './CommentCard';

interface CommentListProps {
  comments: NDKEvent[];
  isLoading: boolean;
}

export function CommentList({ comments, isLoading }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="px-8 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
        <p className="mt-3 text-gray-500 dark:text-gray-400">Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {comments.map(comment => (
        <CommentCard key={comment.id} event={comment} />
      ))}
    </div>
  );
}