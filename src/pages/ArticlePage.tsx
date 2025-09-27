import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useArticle } from '@/features/articles/hooks/useArticle';
import { ArticleHeader } from '@/features/articles/components/ArticleHeader';
import { ArticleContent } from '@/features/articles/components/ArticleContent';
import { CommentSection } from '@/features/articles/components/CommentSection';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ARTICLE_STYLES } from '@/features/articles/constants/styles';

export function ArticlePage() {
  const { naddr } = useParams<{ naddr: string }>();
  const navigate = useNavigate();
  const { article, isLoading, error: fetchError } = useArticle(naddr);
  const { error: userError, handleError, clearError } = useErrorHandler();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{fetchError || 'The article could not be loaded.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className={`flex items-center gap-4 px-4 py-3 ${ARTICLE_STYLES.CONTAINER_MAX_WIDTH} mx-auto`}>
          <button
            onClick={() => navigate(-1)}
            className={ARTICLE_STYLES.BUTTON_BACK}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Article</h1>
        </div>
      </header>

      <main className={`${ARTICLE_STYLES.CONTAINER_MAX_WIDTH} mx-auto px-4 py-8`}>
        {userError && (
          <ErrorAlert message={userError} onDismiss={clearError} />
        )}

        <article className={`${ARTICLE_STYLES.CARD_BG} rounded-xl ${ARTICLE_STYLES.CARD_BORDER} overflow-hidden`}>
          <ArticleHeader article={article} />
          <ArticleContent content={article.content} />
        </article>

        <CommentSection article={article} onError={handleError} />
      </main>
    </div>
  );
}