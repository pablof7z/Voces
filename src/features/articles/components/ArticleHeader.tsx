import { NDKArticle } from '@nostr-dev-kit/ndk';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { Calendar } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ARTICLE_STYLES } from '../constants/styles';

interface ArticleHeaderProps {
  article: NDKArticle;
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const authorProfile = useProfile(article.pubkey);
  const title = article.title || 'Untitled';
  const summary = article.summary;
  const publishedAt = article.published_at;

  return (
    <div className={`${ARTICLE_STYLES.CONTENT_PADDING} pt-12 pb-8 ${ARTICLE_STYLES.SECTION_DIVIDER}`}>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-serif leading-tight">
        {title}
      </h1>

      {summary && (
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-serif leading-relaxed">
          {summary}
        </p>
      )}

      <div className="flex items-center gap-4">
        <UserAvatar
          pubkey={article.pubkey}
          size="lg"
          className={ARTICLE_STYLES.AVATAR_LARGE}
        />
        <div className="flex-1">
          <div className="font-semibold text-gray-900 dark:text-white">
            {authorProfile?.name || authorProfile?.displayName || 'Anonymous'}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(publishedAt * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}