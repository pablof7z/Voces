import { NDKArticle } from '@nostr-dev-kit/ndk';
import { ArticlePreviewCard } from './ArticlePreviewCard';
interface ArticleListProps {
  articles: NDKArticle[];
  variant?: 'default' | 'compact';
  emptyMessage?: string;
}
export function ArticleList({ 
  articles, 
  variant = 'default',
  emptyMessage = 'No articles found'
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
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