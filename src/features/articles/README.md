# Articles Feature

Long-form article support using NDKArticle (kind 30023) with NIP-22 compliant commenting.

## Architecture

### Components (`/components`)
- **ArticleHeader**: Displays article metadata (title, summary, author, publication date)
- **ArticleContent**: Renders markdown content with Tailwind Typography and serif fonts
- **CommentSection**: Orchestrates comment display and submission
- **CommentForm**: Handles comment input and publishing via `article.reply()`
- **CommentList**: Renders list of comments with loading states
- **CommentCard**: Individual comment display
- **ArticlePreviewCard**: Displays article preview with title, excerpt, and metadata
- **ArticleList**: Renders list of article previews with loading states
- **RecentArticlesSidebar**: Sidebar showing recent articles from followed users

### Hooks (`/hooks`)
- **useArticle**: Fetches article by naddr, manages loading/error states
- **useArticleComments**: Fetches and manages article comments per NIP-22
- **useUserArticles**: Fetches articles published by a specific user
- **useRecentArticles**: Fetches recent articles from followed users (or global)

### Utilities (`/utils`)
- **fetchArticleByNaddr**: Decodes naddr and fetches NDKArticle from relay
- **fetchArticleComments**: Queries comments using `#a` tag reference

### Constants (`/constants`)
- **styles.ts**: Centralized Tailwind class constants

## NIP-22 Comment Implementation

### Fetching Comments
Comments are fetched using the `#a` tag with the format:
```
{kind}:{pubkey}:{dTag}
```

This follows NIP-22 specification for referencing parameterized replaceable events.

### Publishing Comments
Comments are created using NDKArticle's built-in `reply()` method:
```typescript
const replyEvent = article.reply();
replyEvent.content = "Comment text";
await replyEvent.publish();
```

The `reply()` method automatically:
- Sets the correct kind (kind 1)
- Adds the `#a` tag referencing the article
- Adds `#p` tag for the article author
- Handles proper event signing

## Styling

- **Typography**: Serif fonts (Georgia/Cambria) for article content
- **Markdown**: Full GFM support via react-markdown
- **Theme**: Substack-inspired reading experience
- **Responsive**: Mobile-first design with proper spacing

## Error Handling

Errors are handled at multiple levels:
1. **Fetch errors**: Displayed in ArticlePage via ErrorAlert
2. **Publish errors**: Passed to parent via callback, shown as dismissible alerts
3. **Graceful degradation**: Missing data shows sensible defaults

## Usage

### Article Detail Page
Articles are accessed via route:
```
/article/:naddr
```

Where `naddr` is a NIP-19 encoded article address (kind 30023).

### Profile Articles Tab
User profiles show an "Articles" tab if the user has published any articles. The tab displays:
- Article titles and excerpts
- Publication dates
- Links to full articles

The tab only appears when `hasArticles === true`, providing a clean UX for users without articles.

### Home Feed Sidebar
The home page includes a sidebar (visible on large screens) showing:
- Recent articles from followed users
- Compact preview cards with titles and authors
- Links to full article pages

The sidebar fetches up to 5 recent articles and updates based on the user's follows list.