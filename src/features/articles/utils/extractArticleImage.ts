import { NDKArticle } from '@nostr-dev-kit/ndk';

export function extractArticleImage(article: NDKArticle): string | null {
  const imageTag = article.tags.find(tag => tag[0] === 'image');
  if (imageTag && imageTag[1]) {
    return imageTag[1];
  }

  const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/;
  const match = article.content.match(imageRegex);
  if (match && match[1]) {
    return match[1];
  }

  const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif))/i;
  const urlMatch = article.content.match(urlRegex);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return null;
}
