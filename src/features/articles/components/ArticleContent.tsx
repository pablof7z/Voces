import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ARTICLE_STYLES } from '../constants/styles';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className={`${ARTICLE_STYLES.CONTENT_PADDING} py-12`}>
      <div className={ARTICLE_STYLES.PROSE_STYLES}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}