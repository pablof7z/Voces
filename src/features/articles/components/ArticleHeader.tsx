import { NDKArticle } from '@nostr-dev-kit/ndk';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { FollowButton } from '@/components/ui/FollowButton';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

interface ArticleHeaderProps {
  article: NDKArticle;
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const authorProfile = useProfile(article.pubkey);
  const currentUser = useNDKCurrentUser();
  const title = article.title || 'Untitled';
  const summary = article.summary;
  const publishedAt = article.published_at;

  // Estimate reading time based on content length
  const wordsPerMinute = 200;
  const words = article.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(words / wordsPerMinute);

  const authorName = authorProfile?.name || authorProfile?.displayName || 'Anonymous';
  const authorBio = authorProfile?.about;

  const isOwnArticle = currentUser?.pubkey === article.pubkey;
  const npub = nip19.npubEncode(article.pubkey);

  return (
    <div className="mb-12">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight font-serif">
        {title}
      </h1>

      {/* Summary */}
      {summary && (
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-light">
          {summary}
        </p>
      )}

      {/* Author Section */}
      <div className="flex items-start sm:items-center gap-4 mb-8">
        <Link to={`/p/${npub}`} className="flex-shrink-0">
          <UserAvatar
            pubkey={article.pubkey}
            size="lg"
            className="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-white dark:ring-black hover:ring-4 transition-all"
          />
        </Link>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Link to={`/p/${npub}`} className="group">
              <div className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {authorName}
              </div>
              {authorBio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 max-w-md">
                  {authorBio}
                </p>
              )}
            </Link>

            {!isOwnArticle && currentUser && (
              <FollowButton pubkey={article.pubkey} variant="subtle" />
            )}
          </div>
        </div>
      </div>

      {/* Article Metadata */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {publishedAt && (
          <>
            <time dateTime={new Date(publishedAt * 1000).toISOString()}>
              {new Date(publishedAt * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>·</span>
          </>
        )}
        <span>{readingTime} min read</span>
      </div>

      {/* Divider */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-800" />
    </div>
  );
}