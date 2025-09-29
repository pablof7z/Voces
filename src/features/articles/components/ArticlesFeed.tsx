import { useArticles } from '../hooks/useArticles';
import { ArticleList } from './ArticleList';
interface ArticlesFeedProps {
  authors?: string[];
}
export function ArticlesFeed({ authors }: ArticlesFeedProps) {
  const articles = useArticles({ authors });

  // When user is not logged in (no authors), show all articles
  const emptyMessage = authors && authors.length > 0
    ? "No articles found from the authors you follow."
    : "No articles available yet.";

  return (
    <ArticleList
      articles={articles}
      emptyMessage={emptyMessage}
    />
  );
}