import { FileText } from 'lucide-react';
import { useRecentArticles } from '../hooks/useRecentArticles';
import { ArticlePreviewCard } from './ArticlePreviewCard';

const SIDEBAR_ARTICLE_LIMIT = 5;

export function ArticleSidebar() {
  const { articles, isLoading, error } = useRecentArticles({ limit: SIDEBAR_ARTICLE_LIMIT });

  return (
    <div className="sticky top-16 w-80 border-l border-neutral-200 dark:border-neutral-800 h-screen overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Articles</h2>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Loading articles...</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No articles found</p>
          </div>
        )}

        {!isLoading && !error && articles.length > 0 && (
          <div className="space-y-2">
            {articles.map(article => (
              <ArticlePreviewCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}