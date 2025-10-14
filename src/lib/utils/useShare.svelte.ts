import type { NDKArticle } from '@nostr-dev-kit/ndk';

/**
 * Composable for managing article sharing
 */
export function createShareManager() {
  let showShareMenu = $state(false);
  let copied = $state(false);

  function handleShare(article: NDKArticle, platform: string) {
    const title = encodeURIComponent(article.title || 'Check out this article');
    const url = encodeURIComponent(window.location.href);
    const authorName = article.author?.profile?.name || 'Anonymous';
    const text = encodeURIComponent(`${article.title} by ${authorName}`);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }

    showShareMenu = false;
  }

  function copyIdentifier(article: NDKArticle) {
    const identifier = article.encode();
    navigator.clipboard.writeText(identifier);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
  }

  return {
    get showShareMenu() {
      return showShareMenu;
    },
    get copied() {
      return copied;
    },
    handleShare,
    copyIdentifier,
    toggleShareMenu
  };
}
