import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { nip19 } from 'nostr-tools';
import { Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmbeddedNote } from './EmbeddedNote';
import { EmbeddedArticle } from './EmbeddedArticle';
import { MediaEmbed } from './MediaEmbed';
import { ImageGrid } from './ImageGrid';

const EMOJI_TAG = 'emoji';
const EMOJI_IMG_CLASS = 'inline-block w-5 h-5 align-middle mx-0.5';

/**
 * Regular expression patterns for matching different content types in Nostr notes.
 * Order matters: patterns are checked in sequence, and earlier matches take precedence.
 */
const PATTERNS = {
  /** NIP-30: Custom emoji shortcodes like :shortcode: */
  EMOJI_SHORTCODE: /:([a-zA-Z0-9_]+):/g,
  
  /** NIP-19/27: Nostr entity URIs (npub, nprofile, note, nevent, naddr) */
  NOSTR_URI: /nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+|note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/gi,
  
  /** Direct media file URLs (images, videos, audio) */
  MEDIA_FILE: /https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mp3|wav|ogg|m4a)(\?[^\s<>"]*)?/gi,
  
  /** YouTube video URLs (various formats) */
  YOUTUBE: /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})[^\s<>"]*/gi,
  
  /** Generic HTTP/HTTPS URLs */
  URL: /https?:\/\/[^\s<>"]+/gi,
} as const;

interface ContentRendererProps {
  content: string;
  className?: string;
  emojiTags?: string[][];
}

interface ParsedSegment {
  type: 'text' | 'npub' | 'nprofile' | 'note' | 'nevent' | 'naddr' | 'link' | 'media' | 'emoji' | 'image-grid';
  content: string;
  data?: string | nip19.ProfilePointer | nip19.EventPointer | nip19.AddressPointer | string[];
}

/**
 * Builds a map of custom emoji shortcodes to their image URLs from NIP-30 emoji tags.
 * 
 * NIP-30 defines emoji tags as: ["emoji", "shortcode", "image-url"]
 * For example: ["emoji", "gleasonator", "https://example.com/emoji.png"]
 * This allows content like "Hello :gleasonator:" to display custom emoji images.
 * 
 * @param tags - Array of NDK event tags (typically event.tags)
 * @returns Map of shortcode → image URL for quick lookup during parsing
 */
function buildEmojiMap(tags: string[][]): Map<string, string> {
  const emojiMap = new Map<string, string>();
  
  tags.forEach(tag => {
    if (tag[0] === EMOJI_TAG) {
      const shortcode = tag[1];
      const url = tag[2];
      
      if (!shortcode || !url) {
        console.warn('[ContentRenderer] Malformed emoji tag: missing shortcode or URL', tag);
        return;
      }
      
      emojiMap.set(shortcode, url);
    }
  });
  
  return emojiMap;
}

/**
 * Handles custom emoji shortcode matches (NIP-30).
 * 
 * Converts ":shortcode:" patterns to emoji segments if the shortcode exists in the emoji map.
 * If no matching emoji is found, treats the text as plain text (preserves the colons).
 * 
 * @param matchedText - The matched shortcode string (e.g., ":gleasonator:")
 * @param emojiMap - Map of shortcode → URL built from emoji tags
 * @returns ParsedSegment with type 'emoji' (if found) or 'text' (if not found)
 */
function handleEmojiMatch(matchedText: string, emojiMap: Map<string, string>): ParsedSegment {
  const shortcode = matchedText.slice(1, -1);
  const emojiUrl = emojiMap.get(shortcode);
  
  if (emojiUrl) {
    return {
      type: 'emoji',
      content: shortcode,
      data: emojiUrl,
    };
  }
  
  return {
    type: 'text',
    content: matchedText,
  };
}

/**
 * Handles Nostr URI matches (NIP-19/27).
 * 
 * Decodes Nostr entity URIs like:
 * - nostr:npub1... (user public key)
 * - nostr:nprofile1... (user profile with relay hints)
 * - nostr:note1... (note/event ID)
 * - nostr:nevent1... (event with relay hints)
 * - nostr:naddr1... (replaceable event address)
 * 
 * These will be rendered as interactive components (user mentions, embedded notes, etc.)
 * 
 * @param matchedText - The matched URI string (e.g., "nostr:npub1...")
 * @returns ParsedSegment with appropriate type and decoded data, or 'text' if decoding fails
 */
function handleNostrUriMatch(matchedText: string): ParsedSegment {
  const uri = matchedText.slice(6);
  
  try {
    if (uri.startsWith('npub1')) {
      const decoded = nip19.decode(uri);
      return { type: 'npub', content: uri, data: decoded.data };
    }
    
    if (uri.startsWith('nprofile1')) {
      const decoded = nip19.decode(uri);
      return { type: 'nprofile', content: uri, data: decoded.data };
    }
    
    if (uri.startsWith('note1')) {
      const decoded = nip19.decode(uri);
      return { type: 'note', content: uri, data: decoded.data };
    }
    
    if (uri.startsWith('nevent1')) {
      const decoded = nip19.decode(uri);
      return { type: 'nevent', content: uri, data: decoded.data };
    }
    
    if (uri.startsWith('naddr1')) {
      const decoded = nip19.decode(uri);
      return { type: 'naddr', content: uri, data: decoded.data };
    }
  } catch (_e) {
    console.warn('[ContentRenderer] Failed to decode Nostr URI:', uri);
  }
  
  return { type: 'text', content: matchedText };
}

/**
 * Handles media URL matches (images, videos, audio).
 * 
 * Creates media segments that will be rendered as embedded media players or image viewers.
 * 
 * @param matchedText - The matched media URL
 * @returns ParsedSegment with type 'media'
 */
function handleMediaMatch(matchedText: string): ParsedSegment {
  return { type: 'media', content: matchedText };
}

/**
 * Handles regular link matches.
 * 
 * Creates link segments that will be rendered as clickable hyperlinks.
 * 
 * @param matchedText - The matched URL
 * @returns ParsedSegment with type 'link'
 */
function handleLinkMatch(matchedText: string): ParsedSegment {
  return { type: 'link', content: matchedText };
}

/**
 * Parses content string into an array of typed segments for rendering.
 * 
 * This function:
 * 1. Searches content for all pattern matches (emoji, URIs, media, links)
 * 2. Sorts matches by position to process them left-to-right
 * 3. Prevents overlapping matches (earlier patterns win)
 * 4. Preserves plain text between matches
 * 5. Routes each match to its appropriate handler based on content characteristics
 * 
 * The if-else chain checks match characteristics (not pattern type) because:
 * - Multiple patterns can match the same text
 * - We need to inspect actual content to determine correct handler
 * - Order matters for disambiguation (e.g., YouTube URLs are also generic URLs)
 * 
 * @param content - The cleaned content string to parse
 * @param emojiMap - Map of custom emoji shortcodes to URLs
 * @returns Array of ParsedSegment objects ready for rendering
 */
function parseContentToSegments(
  content: string,
  emojiMap: Map<string, string>
): ParsedSegment[] {
  const parsed: ParsedSegment[] = [];
  const patterns = [
    PATTERNS.EMOJI_SHORTCODE,
    PATTERNS.NOSTR_URI,
    PATTERNS.MEDIA_FILE,
    PATTERNS.YOUTUBE,
    PATTERNS.URL,
  ];

  let lastIndex = 0;
  const allMatches: Array<{ match: RegExpExecArray; pattern: RegExp }> = [];

  // Collect all pattern matches from the content
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      allMatches.push({ match, pattern });
    }
  }

  // Sort matches by position to process them left-to-right
  allMatches.sort((a, b) => a.match.index - b.match.index);

  // Process each match and extract segments
  for (const { match } of allMatches) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;

    // Skip overlapping matches (keep first occurrence)
    if (matchStart < lastIndex) continue;

    // Add plain text segment before this match
    if (matchStart > lastIndex) {
      parsed.push({
        type: 'text',
        content: content.slice(lastIndex, matchStart),
      });
    }

    const matchedText = match[0];
    let segment: ParsedSegment;

    // Route match to appropriate handler based on content characteristics.
    // Use if-else chain (not switch) because we're checking string patterns, not enum values.
    // Order matters: check more specific patterns before generic ones.
    if (matchedText.startsWith(':') && matchedText.endsWith(':')) {
      // Custom emoji shortcode (NIP-30)
      segment = handleEmojiMatch(matchedText, emojiMap);
    } else if (matchedText.startsWith('nostr:')) {
      // Nostr entity URI (NIP-19/27)
      segment = handleNostrUriMatch(matchedText);
    } else if (/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mp3|wav|ogg|m4a)(\?|$)/i.test(matchedText)) {
      // Direct media file URL
      segment = handleMediaMatch(matchedText);
    } else if (/youtube\.com|youtu\.be/i.test(matchedText)) {
      // YouTube video URL
      segment = handleMediaMatch(matchedText);
    } else if (matchedText.startsWith('http')) {
      // Generic HTTP/HTTPS link
      segment = handleLinkMatch(matchedText);
    } else {
      // Fallback: treat as plain text
      segment = { type: 'text', content: matchedText };
    }

    parsed.push(segment);
    lastIndex = matchEnd;
  }

  // Add remaining plain text after last match
  if (lastIndex < content.length) {
    parsed.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return parsed;
}

/**
 * Groups consecutive image segments into image-grid segments for better display.
 * Non-image media (video, audio) and other content types remain separate.
 *
 * @param segments - Array of parsed segments
 * @returns Array of segments with consecutive images grouped
 */
function groupConsecutiveImages(segments: ParsedSegment[]): ParsedSegment[] {
  const grouped: ParsedSegment[] = [];
  let imageBuffer: string[] = [];

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url.toLowerCase());
  };

  const flushImageBuffer = () => {
    if (imageBuffer.length > 0) {
      if (imageBuffer.length === 1) {
        // Single image remains as media segment
        grouped.push({
          type: 'media',
          content: imageBuffer[0],
        });
      } else {
        // Multiple images become image-grid segment
        grouped.push({
          type: 'image-grid',
          content: '',
          data: imageBuffer,
        });
      }
      imageBuffer = [];
    }
  };

  for (const segment of segments) {
    if (segment.type === 'media' && isImage(segment.content)) {
      // Add image to buffer
      imageBuffer.push(segment.content);
    } else {
      // Non-image segment: flush buffer first, then add segment
      flushImageBuffer();
      grouped.push(segment);
    }
  }

  // Flush any remaining images
  flushImageBuffer();

  return grouped;
}

export function ContentRenderer({ content, className = '', emojiTags = [] }: ContentRendererProps) {
  // Remove legacy image labels from content
  const cleanedContent = useMemo(() => {
    return content.replace(/\[Image #\d+\]/gi, '').trim();
  }, [content]);

  // Parse content into segments and group images, memoized for performance
  const segments = useMemo(() => {
    const emojiMap = buildEmojiMap(emojiTags);
    const parsed = parseContentToSegments(cleanedContent, emojiMap);
    return groupConsecutiveImages(parsed);
  }, [cleanedContent, emojiTags]);

  return (
    <div className={className}>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {segment.type === 'text' && (
            <span className="whitespace-pre-wrap break-words">{segment.content}</span>
          )}

          {segment.type === 'npub' && (
            <UserMention pubkey={segment.data as string} />
          )}

          {segment.type === 'nprofile' && (
            <UserMention pubkey={(segment.data as nip19.ProfilePointer).pubkey} />
          )}

          {segment.type === 'note' && (
            <EmbeddedNote eventId={segment.data as string} />
          )}

          {segment.type === 'nevent' && (
            <EmbeddedNote eventId={(segment.data as nip19.EventPointer).id} />
          )}

          {segment.type === 'naddr' && (
            <EmbeddedArticle naddr={segment.data as nip19.AddressPointer} />
          )}

          {segment.type === 'link' && (
            <a
              href={segment.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 dark:text-accent-400 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {segment.content}
            </a>
          )}

          {segment.type === 'media' && (
            <MediaEmbed url={segment.content} />
          )}

          {segment.type === 'image-grid' && (
            <ImageGrid images={segment.data as string[]} />
          )}

          {segment.type === 'emoji' && (
            <img
              src={segment.data as string}
              alt={`:${segment.content}:`}
              title={`:${segment.content}:`}
              className={EMOJI_IMG_CLASS}
              loading="lazy"
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

interface UserMentionProps {
  pubkey: string;
}

function UserMention({ pubkey }: UserMentionProps) {
  const profile = useProfile(pubkey);
  const npub = nip19.npubEncode(pubkey);

  const displayName = profile?.name || profile?.displayName || `@${npub.slice(0, 8)}...`;

  return (
    <Link
      to={`/p/${npub}`}
      className="inline-flex items-center gap-0.5 text-accent-600 dark:text-accent-400 hover:underline font-medium"
      onClick={(e) => e.stopPropagation()}
    >
      @{displayName}
    </Link>
  );
}