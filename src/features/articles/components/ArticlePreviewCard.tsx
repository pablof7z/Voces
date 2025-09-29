import { NDKArticle } from '@nostr-dev-kit/ndk';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { extractArticleImage } from '../utils/extractArticleImage';

const MAX_EXCERPT_LENGTH = 150;
const THUMBNAIL_SIZE = 'w-32 h-24 sm:w-40 sm:h-28';

interface ArticlePreviewCardProps {
  article: NDKArticle;
  variant?: 'default' | 'compact';
}

export function ArticlePreviewCard({ article, variant = 'default' }: ArticlePreviewCardProps) {
  const authorProfile = useProfile(article.pubkey);
  const title = article.title || 'Untitled';
  const summary = article.summary;
  
  const excerpt = summary 
    ? summary.slice(0, MAX_EXCERPT_LENGTH) + (summary.length > MAX_EXCERPT_LENGTH ? '...' : '')
    : article.content.slice(0, MAX_EXCERPT_LENGTH) + (article.content.length > MAX_EXCERPT_LENGTH ? '...' : '');

  const publishedAt = article.published_at || article.created_at;
  const imageUrl = extractArticleImage(article);
  
  const naddr = nip19.naddrEncode({
    kind: article.kind!,
    pubkey: article.pubkey,
    identifier: article.dTag || '',
  });

  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${naddr}`}
        className="block p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors rounded-lg"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-accent-100 dark:bg-accent-900/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{authorProfile?.name || authorProfile?.displayName || 'Anonymous'}</span>
              {publishedAt && (
                <>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(publishedAt * 1000), { addSuffix: true })}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${naddr}`}
      className="block p-4 sm:p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors border-b border-gray-200 dark:border-gray-800 last:border-b-0"
    >
      <div className="flex gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mb-2 line-clamp-2 font-serif">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{authorProfile?.name || authorProfile?.displayName || 'Anonymous'}</span>
            {publishedAt && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  {formatDistanceToNow(new Date(publishedAt * 1000), { addSuffix: true })}
                </span>
              </>
            )}
          </div>
        </div>

        {imageUrl ? (
          <div className={`flex-shrink-0 ${THUMBNAIL_SIZE} rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800`}>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`flex-shrink-0 ${THUMBNAIL_SIZE} rounded-lg bg-accent-100 dark:bg-accent-900/20 flex items-center justify-center`}>
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-accent-600 dark:text-accent-400" />
          </div>
        )}
      </div>
    </Link>
  );
}