import { NDKArticle } from '@nostr-dev-kit/ndk';
import { ArticlePreviewCard } from './ArticlePreviewCard';

interface ArticleListProps {
  articles: NDKArticle[];
  isLoading?: boolean;
  variant?: 'default' | 'compact';
  emptyMessage?: string;
}

export function ArticleList({ 
  articles, 
  isLoading = false, 
  variant = 'default',
  emptyMessage = 'No articles found'
}: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {articles.map((article) => (
        <ArticlePreviewCard 
          key={article.id} 
          article={article} 
          variant={variant}
        />
      ))}
    </div>
  );
}
