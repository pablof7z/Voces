import type { NDKArticle } from '@nostr-dev-kit/ndk';

const IMAGE_REGEX = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/;
const URL_IMAGE_REGEX = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg))/i;

export function extractArticleImage(article: NDKArticle): string | null {
  const imageTag = article.tags.find(tag => tag[0] === 'image');
  if (imageTag && imageTag[1]) {
    return imageTag[1];
  }

  const markdownMatch = article.content.match(IMAGE_REGEX);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  }

  const urlMatch = article.content.match(URL_IMAGE_REGEX);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return null;
}
