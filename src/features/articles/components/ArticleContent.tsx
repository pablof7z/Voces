import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { useMemo } from 'react';

interface ArticleContentProps {
  content: string;
  emojiTags?: string[][];
}

export function ArticleContent({ content, emojiTags }: ArticleContentProps) {
  // Check if content contains markdown indicators
  const hasMarkdown = useMemo(() => {
    // Common markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s/m,        // Headers
      /\*\*[^*]+\*\*/,     // Bold
      /\*[^*]+\*/,         // Italic
      /\[([^\]]+)\]\([^)]+\)/, // Links
      /^[-*+]\s/m,         // Lists
      /^>\s/m,             // Blockquotes
      /```[\s\S]*?```/,    // Code blocks
      /^\d+\.\s/m,         // Ordered lists
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  }, [content]);

  // If content has markdown, render with ReactMarkdown but with Nostr entity support
  if (hasMarkdown) {
    return (
      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ children }) => (
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mt-12 mb-6 font-serif">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-10 mb-5 font-serif">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-8 mb-4 font-serif">
                {children}
              </h3>
            ),

            // Paragraphs - Use ContentRenderer for Nostr entities
            p: ({ children }) => {
              // Check if children contains only text
              const textContent = typeof children === 'string' ? children :
                Array.isArray(children) ? children.filter(c => typeof c === 'string').join('') : '';

              // If we have text content, use ContentRenderer for Nostr entity support
              if (textContent) {
                return (
                  <div className="text-lg leading-[1.8] text-neutral-800 dark:text-neutral-200 mb-6 font-serif">
                    <ContentRenderer content={textContent.trim()} emojiTags={emojiTags} />
                  </div>
                );
              }

              // Otherwise render normally
              return (
                <p className="text-lg leading-[1.8] text-neutral-800 dark:text-neutral-200 mb-6 font-serif">
                  {children}
                </p>
              );
            },

            // Lists
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-6 space-y-2 text-lg text-neutral-800 dark:text-neutral-200 font-serif">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg text-neutral-800 dark:text-neutral-200 font-serif">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-[1.8]">
                {children}
              </li>
            ),

            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-6 my-8 italic">
                <div className="text-xl text-neutral-700 dark:text-neutral-300 font-serif leading-[1.8]">
                  {children}
                </div>
              </blockquote>
            ),

            // Code
            code: ({ children, className }) => {
              const isInline = !className;

              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }

              return (
                <code className="block bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed mb-6">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="mb-6 overflow-hidden rounded-lg">
                {children}
              </pre>
            ),

            // Links
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            // Images
            img: ({ src, alt }) => (
              <figure className="my-8">
                <img
                  src={src}
                  alt={alt}
                  className="w-full rounded-lg shadow-sm"
                  loading="lazy"
                />
                {alt && (
                  <figcaption className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-3 font-sans">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ),

            // Horizontal rule
            hr: () => (
              <hr className="my-12 border-t border-neutral-200 dark:border-neutral-800" />
            ),

            // Strong/Bold
            strong: ({ children }) => (
              <strong className="font-bold text-neutral-900 dark:text-white">
                {children}
              </strong>
            ),

            // Emphasis/Italic
            em: ({ children }) => (
              <em className="italic">
                {children}
              </em>
            ),
          }}
        >
          {content.trim()}
        </ReactMarkdown>
      </div>
    );
  }

  // If no markdown, use ContentRenderer directly for plain text with Nostr entities
  return (
    <div className="article-content text-lg leading-[1.8] text-neutral-800 dark:text-neutral-200 font-serif">
      <ContentRenderer content={content.trim()} emojiTags={emojiTags} className="space-y-6" />
    </div>
  );
}