import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';
import sirv from 'sirv';
import NDK from '@nostr-dev-kit/ndk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

// Create Express app
const app = express();
app.use(compression());

// NDK instance for server-side fetching
const ndk = new NDK({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://purplepag.es',
    'wss://relay.snort.social',
    'wss://relay.primal.net'
  ]
});

await ndk.connect();

// Content type patterns
const contentPatterns = {
  article: /^\/article\/(naddr1[a-z0-9]+)/i,
  note: /^\/note\/(note1[a-z0-9]+|nevent1[a-z0-9]+)/i,
  profile: /^\/profile\/(npub1[a-z0-9]+|nprofile1[a-z0-9]+)/i,
  followpack: /^\/followpack\/(naddr1[a-z0-9]+)/i,
  listing: /^\/marketplace\/listing\/(naddr1[a-z0-9]+)/i,
};

// Helper to decode Nostr identifiers
async function decodeIdentifier(type, identifier) {
  try {
    switch (type) {
      case 'article':
      case 'followpack':
      case 'listing':
        // These use naddr (parameterized replaceable events)
        const { type: eventType, data } = await import('nostr-tools/nip19').then(m =>
          m.decode(identifier)
        );
        if (eventType === 'naddr') {
          return {
            kind: data.kind,
            author: data.pubkey,
            identifier: data.identifier,
            relays: data.relays
          };
        }
        break;

      case 'note':
        // Regular notes or note references
        const noteDecoded = await import('nostr-tools/nip19').then(m =>
          m.decode(identifier)
        );
        if (noteDecoded.type === 'note') {
          return { id: noteDecoded.data };
        } else if (noteDecoded.type === 'nevent') {
          return {
            id: noteDecoded.data.id,
            relays: noteDecoded.data.relays
          };
        }
        break;

      case 'profile':
        // User profiles
        const profileDecoded = await import('nostr-tools/nip19').then(m =>
          m.decode(identifier)
        );
        if (profileDecoded.type === 'npub') {
          return { pubkey: profileDecoded.data };
        } else if (profileDecoded.type === 'nprofile') {
          return {
            pubkey: profileDecoded.data.pubkey,
            relays: profileDecoded.data.relays
          };
        }
        break;
    }
  } catch (error) {
    console.error('Failed to decode identifier:', error);
  }
  return null;
}

// Fetch content from Nostr
async function fetchNostrContent(type, decoded) {
  try {
    let event = null;
    let profile = null;

    switch (type) {
      case 'article':
        // Fetch article (kind 30023)
        event = await ndk.fetchEvent({
          kinds: [30023],
          authors: [decoded.author],
          '#d': [decoded.identifier]
        });
        break;

      case 'followpack':
        // Fetch follow pack (kind 30000)
        event = await ndk.fetchEvent({
          kinds: [30000],
          authors: [decoded.author],
          '#d': [decoded.identifier]
        });
        break;

      case 'listing':
        // Fetch marketplace listing (kind 30402)
        event = await ndk.fetchEvent({
          kinds: [30402],
          authors: [decoded.author],
          '#d': [decoded.identifier]
        });
        break;

      case 'note':
        // Fetch note (kind 1)
        event = await ndk.fetchEvent({
          ids: [decoded.id]
        });
        break;

      case 'profile':
        // Fetch profile metadata (kind 0)
        const profileEvents = await ndk.fetchEvents({
          kinds: [0],
          authors: [decoded.pubkey],
          limit: 1
        });
        event = Array.from(profileEvents)[0];

        // Parse profile content
        if (event) {
          try {
            profile = JSON.parse(event.content);
          } catch (e) {
            console.error('Failed to parse profile:', e);
          }
        }
        break;
    }

    // Fetch author profile for content that has an author
    if (event && event.pubkey && type !== 'profile') {
      const authorEvents = await ndk.fetchEvents({
        kinds: [0],
        authors: [event.pubkey],
        limit: 1
      });
      const authorEvent = Array.from(authorEvents)[0];
      if (authorEvent) {
        try {
          profile = JSON.parse(authorEvent.content);
        } catch (e) {
          console.error('Failed to parse author profile:', e);
        }
      }
    }

    return { event, profile };
  } catch (error) {
    console.error('Failed to fetch Nostr content:', error);
    return { event: null, profile: null };
  }
}

// Generate Open Graph meta tags
function generateMetaTags(type, data, identifier) {
  const { event, profile } = data;
  const baseUrl = process.env.APP_URL || `http://localhost:${port}`;
  let tags = [];

  // Default tags
  tags.push(`<meta property="og:site_name" content="Voces">`);
  tags.push(`<meta property="og:type" content="website">`);
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);

  if (!event && type !== 'profile') {
    // Fallback for when content can't be loaded
    tags.push(`<meta property="og:title" content="Voces - Nostr Content">`);
    tags.push(`<meta property="og:description" content="View this content on Voces">`);
    return tags.join('\n    ');
  }

  switch (type) {
    case 'article':
      const title = event.tags.find(t => t[0] === 'title')?.[1] || 'Untitled Article';
      const summary = event.tags.find(t => t[0] === 'summary')?.[1] ||
                      event.content.substring(0, 200);
      const image = event.tags.find(t => t[0] === 'image')?.[1];
      const publishedAt = event.tags.find(t => t[0] === 'published_at')?.[1];

      tags.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
      tags.push(`<meta property="og:description" content="${escapeHtml(summary)}">`);
      tags.push(`<meta property="og:url" content="${baseUrl}/article/${identifier}">`);
      tags.push(`<meta property="article:author" content="${escapeHtml(profile?.name || 'Anonymous')}">`);

      if (publishedAt) {
        tags.push(`<meta property="article:published_time" content="${new Date(parseInt(publishedAt) * 1000).toISOString()}">`);
      }

      if (image) {
        tags.push(`<meta property="og:image" content="${image}">`);
      }

      if (profile?.name) {
        tags.push(`<meta name="author" content="${escapeHtml(profile.name)}">`);
      }
      break;

    case 'note':
      const noteContent = event.content.length > 200
        ? event.content.substring(0, 197) + '...'
        : event.content;

      tags.push(`<meta property="og:title" content="Note by ${escapeHtml(profile?.name || 'Nostr User')}">`);
      tags.push(`<meta property="og:description" content="${escapeHtml(noteContent)}">`);
      tags.push(`<meta property="og:url" content="${baseUrl}/note/${identifier}">`);

      if (profile?.picture) {
        tags.push(`<meta property="og:image" content="${profile.picture}">`);
      }
      break;

    case 'profile':
      const userProfile = profile || {};
      tags.push(`<meta property="og:title" content="${escapeHtml(userProfile.name || 'Nostr User')}">`);
      tags.push(`<meta property="og:description" content="${escapeHtml(userProfile.about || 'Nostr profile on Voces')}">`);
      tags.push(`<meta property="og:url" content="${baseUrl}/profile/${identifier}">`);

      if (userProfile.picture) {
        tags.push(`<meta property="og:image" content="${userProfile.picture}">`);
      }

      if (userProfile.banner) {
        tags.push(`<meta name="twitter:image" content="${userProfile.banner}">`);
      }
      break;

    case 'followpack':
      const packTitle = event.tags.find(t => t[0] === 'title')?.[1] ||
                       event.tags.find(t => t[0] === 'd')?.[1] || 'Follow Pack';
      const packDesc = event.tags.find(t => t[0] === 'description')?.[1] ||
                      `A curated list by ${profile?.name || 'a Nostr user'}`;
      const packImage = event.tags.find(t => t[0] === 'image')?.[1];
      const pTags = event.tags.filter(t => t[0] === 'p').length;

      tags.push(`<meta property="og:title" content="${escapeHtml(packTitle)}">`);
      tags.push(`<meta property="og:description" content="${escapeHtml(packDesc)} • ${pTags} profiles">`);
      tags.push(`<meta property="og:url" content="${baseUrl}/followpack/${identifier}">`);

      if (packImage) {
        tags.push(`<meta property="og:image" content="${packImage}">`);
      }
      break;

    case 'listing':
      const listingTitle = event.tags.find(t => t[0] === 'title')?.[1] || 'Marketplace Listing';
      const price = event.tags.find(t => t[0] === 'price')?.[1];
      const location = event.tags.find(t => t[0] === 'location')?.[1];
      const listingImage = event.tags.find(t => t[0] === 'image')?.[1];

      let description = event.tags.find(t => t[0] === 'summary')?.[1] || event.content.substring(0, 200);
      if (price) description = `${price} • ${description}`;
      if (location) description = `📍 ${location} • ${description}`;

      tags.push(`<meta property="og:title" content="${escapeHtml(listingTitle)}">`);
      tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
      tags.push(`<meta property="og:url" content="${baseUrl}/marketplace/listing/${identifier}">`);

      if (listingImage) {
        tags.push(`<meta property="og:image" content="${listingImage}">`);
      }
      break;
  }

  return tags.join('\n    ');
}

// HTML escape helper
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Vite integration
let vite;
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

// SSR middleware
app.use(async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    // Check if this is a content URL that needs SSR
    let contentType = null;
    let identifier = null;

    for (const [type, pattern] of Object.entries(contentPatterns)) {
      const match = url.match(pattern);
      if (match) {
        contentType = type;
        identifier = match[1];
        break;
      }
    }

    let template;
    let render;

    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = await fs.readFile('./dist/client/index.html', 'utf-8');
      render = (await import('./dist/server/entry-server.js')).render;
    }

    // If this is a content URL, fetch data and inject meta tags
    if (contentType && identifier) {
      const decoded = await decodeIdentifier(contentType, identifier);

      if (decoded) {
        const content = await fetchNostrContent(contentType, decoded);
        const metaTags = generateMetaTags(contentType, content, identifier);

        // Inject meta tags into the head
        template = template.replace(
          '</head>',
          `    ${metaTags}\n  </head>`
        );
      }
    }

    // For client-side navigation, we still need the React app
    const rendered = await render(url, null);

    const html = template
      .replace(`<!--app-html-->`, rendered?.html ?? '')
      .replace(`<!--app-head-->`, rendered?.head ?? '');

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    if (!isProduction && vite) {
      vite.ssrFixStacktrace(e);
    }
    console.error(e.stack);
    res.status(500).end(e.stack);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});