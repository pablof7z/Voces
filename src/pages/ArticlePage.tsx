import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Bookmark, MoreHorizontal, Copy, Twitter, Facebook, Linkedin, CheckCircle } from 'lucide-react';
import { useArticle } from '@/features/articles/hooks/useArticle';
import { ArticleHeader } from '@/features/articles/components/ArticleHeader';
import { ArticleContent } from '@/features/articles/components/ArticleContent';
import { CommentSection } from '@/features/articles/components/CommentSection';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useState, useRef, useEffect } from 'react';
import { useNDKCurrentUser, useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKList, NDKKind } from '@nostr-dev-kit/ndk';

export function ArticlePage() {
  const { naddr } = useParams<{ naddr: string }>();
  const navigate = useNavigate();
  const { article, isLoading, error: fetchError } = useArticle(naddr);
  const { error: userError, handleError, clearError } = useErrorHandler();
  const currentUser = useNDKCurrentUser();
  const { ndk } = useNDK();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Check if article is bookmarked
  useEffect(() => {
    if (!currentUser || !article) return;

    const checkBookmark = async () => {
      try {
        // Fetch user's bookmark list (NIP-51 kind:30001 with "d" tag "bookmarks")
        const lists = await ndk.fetchEvents({
          kinds: [NDKKind.BookmarkSet],
          authors: [currentUser.pubkey],
          '#d': ['bookmarks']
        });

        const bookmarkList = Array.from(lists)[0];
        if (bookmarkList) {
          const bookmarkedItems = bookmarkList.tags
            .filter(tag => tag[0] === 'a')
            .map(tag => tag[1]);

          const articlePointer = article.tagId();
          setIsBookmarked(bookmarkedItems.includes(articlePointer));
        }
      } catch (error) {
        console.error('Failed to check bookmark status:', error);
      }
    };

    checkBookmark();
  }, [currentUser, article, ndk]);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookmark = async () => {
    if (!currentUser || !article) return;

    try {
      // Fetch or create bookmark list
      const lists = await ndk.fetchEvents({
        kinds: [NDKKind.BookmarkSet],
        authors: [currentUser.pubkey],
        '#d': ['bookmarks']
      });

      let bookmarkList = Array.from(lists)[0] as NDKList | undefined;

      if (!bookmarkList) {
        // Create new bookmark list
        bookmarkList = new NDKList(ndk);
        bookmarkList.kind = NDKKind.BookmarkSet;
        bookmarkList.tags = [
          ['d', 'bookmarks'],
          ['title', 'Bookmarks']
        ];
      }

      const articlePointer = article.tagId();

      if (isBookmarked) {
        // Remove bookmark
        bookmarkList.tags = bookmarkList.tags.filter(
          tag => !(tag[0] === 'a' && tag[1] === articlePointer)
        );
      } else {
        // Add bookmark
        bookmarkList.addItem(['a', articlePointer, article.relay?.url || '', article.author.pubkey]);
      }

      await bookmarkList.publish();
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      handleError('Failed to update bookmarks');
      console.error('Bookmark error:', error);
    }
  };

  const handleCopyIdentifier = () => {
    if (!article) return;

    const identifier = article.encode();
    navigator.clipboard.writeText(identifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowDropdown(false);
  };

  const handleShare = (platform: string) => {
    if (!article) return;

    const title = encodeURIComponent(article.title || 'Check out this article');
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${article.title} by ${article.author.profile?.name || 'Anonymous'}`);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }

    setShowShareMenu(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-white"></div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading article...</p>
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white dark:bg-black">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Article Not Found</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{fetchError || 'The article could not be loaded.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors text-sm font-medium"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
        <div className="max-w-screen-lg mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </button>

            <div className="flex items-center gap-2">
              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                disabled={!currentUser}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={currentUser ? (isBookmarked ? 'Remove bookmark' : 'Add bookmark') : 'Login to bookmark'}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button */}
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
                >
                  <Share2 className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3"
                    >
                      <Twitter className="w-4 h-4" />
                      Share on X
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3"
                    >
                      <Facebook className="w-4 h-4" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3"
                    >
                      <Linkedin className="w-4 h-4" />
                      Share on LinkedIn
                    </button>
                  </div>
                )}
              </div>

              {/* More Options Button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={handleCopyIdentifier}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Article Identifier
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32">
        <article className="max-w-screen-md mx-auto px-6 lg:px-8">
          {userError && (
            <ErrorAlert message={userError} onDismiss={clearError} />
          )}

          <ArticleHeader article={article} />
          <ArticleContent content={article.content} emojiTags={article.tags} />
        </article>

        {/* Comments Section */}
        <div className="max-w-screen-md mx-auto px-6 lg:px-8 mt-16">
          <CommentSection article={article} onError={handleError} />
        </div>
      </main>
    </div>
  );
}