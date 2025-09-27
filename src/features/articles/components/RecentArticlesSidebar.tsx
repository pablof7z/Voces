import { FileText } from 'lucide-react';
import { useRecentArticles } from '../hooks/useRecentArticles';
import { ArticleList } from './ArticleList';

export function RecentArticlesSidebar() {
  const { articles, isLoading } = useRecentArticles({ limit: 5 });

  if (isLoading && articles.length === 0) {
    return (
      <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
        <div className="sticky top-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Articles</h2>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
      <div className="sticky top-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
          <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Articles</h2>
        </div>
        <ArticleList 
          articles={articles} 
          isLoading={isLoading}
          variant="compact"
          emptyMessage="No recent articles"
        />
      </div>
    </div>
  );
}
