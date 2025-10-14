import type { NDKArticle } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { NDKKind, NDKList } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

/**
 * Composable for managing article bookmarks
 */
export function createBookmarksManager(ndk: NDKSvelte) {
  let isBookmarked = $state(false);

  async function checkBookmark(article: NDKArticle) {
    const currentUser = ndk.$currentUser;
    if (!currentUser || !article) return;

    try {
      const bookmarksNaddr = nip19.naddrEncode({
        kind: NDKKind.CurationSet,
        pubkey: currentUser.pubkey,
        identifier: 'bookmarks'
      });

      const bookmarkList = await ndk.fetchEvent(bookmarksNaddr);
      if (bookmarkList) {
        const bookmarkedItems = bookmarkList.tags
          .filter(tag => tag[0] === 'a')
          .map(tag => tag[1]);

        const articlePointer = article.tagId();
        isBookmarked = bookmarkedItems.includes(articlePointer);
      }
    } catch (err) {
      console.error('Failed to check bookmark status:', err);
    }
  }

  async function toggleBookmark(article: NDKArticle) {
    const currentUser = ndk.$currentUser;
    if (!currentUser || !article) return;

    try {
      const bookmarksNaddr = nip19.naddrEncode({
        kind: NDKKind.ArticleCurationSet,
        pubkey: currentUser.pubkey,
        identifier: 'bookmarks'
      });

      let bookmarkList = await ndk.fetchEvent(bookmarksNaddr) as NDKList | null;

      if (!bookmarkList) {
        bookmarkList = new NDKList(ndk);
        bookmarkList.kind = NDKKind.CurationSet;
        bookmarkList.tags = [
          ['d', 'bookmarks'],
          ['title', 'Bookmarks']
        ];
      }

      const articlePointer = article.tagId();

      if (isBookmarked) {
        bookmarkList.tags = bookmarkList.tags.filter(
          tag => !(tag[0] === 'a' && tag[1] === articlePointer)
        );
      } else {
        bookmarkList.addItem(article);
      }

      await bookmarkList.publish();
      isBookmarked = !isBookmarked;
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  }

  return {
    get isBookmarked() {
      return isBookmarked;
    },
    checkBookmark,
    toggleBookmark
  };
}
