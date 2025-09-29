import { NDKArticle, useProfile } from '@nostr-dev-kit/ndk-hooks';
import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Clock, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
  article: NDKArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const profile = useProfile(article.pubkey);
  const publishedAt = article.published_at || article.created_at;
  const timeAgo = publishedAt
    ? formatDistanceToNow(new Date(publishedAt * 1000), { addSuffix: true })
    : null;

  const readingTime = article.content ? Math.max(1, Math.round(article.content.split(/\s+/).length / 200)) : 1;

  const getFirstImage = () => {
    if (article.image) return article.image;

    const imgMatch = article.content?.match(/!\[.*?\]\((https?:\/\/[^\s)]+)/);
    return imgMatch ? imgMatch[1] : null;
  };

  const getSummary = () => {
    if (article.summary) return article.summary;

    const plainText = article.content
      ?.replace(/!\[.*?\]\(.*?\)/g, '')
      ?.replace(/\[.*?\]\(.*?\)/g, '')
      ?.replace(/[#*`]/g, '')
      ?.trim();

    return plainText ? plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '') : '';
  };

  const image = getFirstImage();
  const summary = getSummary();

  return (
    <Link
      to={`/article/${article.dTag}`}
      className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-800"
    >
      {image && (
        <div className="aspect-[2/1] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={image}
            alt={article.title || 'Article cover'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {article.title}
        </h2>

        {summary && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
            {summary}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <UserAvatar
              pubkey={article.pubkey}
              className="w-8 h-8 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile?.displayName || profile?.name || article.pubkey.slice(0, 8) + '...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
            {timeAgo && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}