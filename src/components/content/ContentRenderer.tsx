import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { nip19 } from 'nostr-tools';
import { Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmbeddedNote } from './EmbeddedNote';
import { EmbeddedArticle } from './EmbeddedArticle';
import { MediaEmbed } from './MediaEmbed';

interface ContentRendererProps {
  content: string;
  className?: string;
}

interface ParsedSegment {
  type: 'text' | 'npub' | 'nprofile' | 'note' | 'nevent' | 'naddr' | 'link' | 'media';
  content: string;
  data?: any;
}

export function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  // Remove [Image #X] labels from content
  const cleanedContent = useMemo(() => {
    return content.replace(/\[Image #\d+\]/gi, '').trim();
  }, [content]);

  const segments = useMemo(() => {
    const parsed: ParsedSegment[] = [];

    // Combined regex for all patterns
    const patterns = [
      // Nostr URIs (nostr:npub, nostr:note, etc.)
      /nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+|note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/gi,
      // Direct media files
      /https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mp3|wav|ogg|m4a)(\?[^\s<>"]*)?/gi,
      // YouTube URLs
      /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})[^\s<>"]*/gi,
      // Regular links
      /https?:\/\/[^\s<>"]+/gi,
    ];

    let lastIndex = 0;
    const allMatches: Array<{ match: RegExpExecArray; pattern: RegExp }> = [];

    // Collect all matches
    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset regex state
      let match;
      while ((match = pattern.exec(cleanedContent)) !== null) {
        allMatches.push({ match, pattern });
      }
    }

    // Sort matches by position
    allMatches.sort((a, b) => a.match.index - b.match.index);

    // Process matches without overlaps
    for (const { match } of allMatches) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      // Skip if this match overlaps with already processed content
      if (matchStart < lastIndex) continue;

      // Add text before the match
      if (matchStart > lastIndex) {
        parsed.push({
          type: 'text',
          content: cleanedContent.slice(lastIndex, matchStart),
        });
      }

      const matchedText = match[0];

      // Process the match
      if (matchedText.startsWith('nostr:')) {
        const uri = matchedText.slice(6); // Remove 'nostr:' prefix

        try {
          if (uri.startsWith('npub1')) {
            const decoded = nip19.decode(uri);
            parsed.push({
              type: 'npub',
              content: uri,
              data: decoded.data,
            });
          } else if (uri.startsWith('nprofile1')) {
            const decoded = nip19.decode(uri);
            parsed.push({
              type: 'nprofile',
              content: uri,
              data: decoded.data,
            });
          } else if (uri.startsWith('note1')) {
            const decoded = nip19.decode(uri);
            parsed.push({
              type: 'note',
              content: uri,
              data: decoded.data,
            });
          } else if (uri.startsWith('nevent1')) {
            const decoded = nip19.decode(uri);
            parsed.push({
              type: 'nevent',
              content: uri,
              data: decoded.data,
            });
          } else if (uri.startsWith('naddr1')) {
            const decoded = nip19.decode(uri);
            parsed.push({
              type: 'naddr',
              content: uri,
              data: decoded.data,
            });
          }
        } catch (_e) {
          // If decoding fails, treat as text
          parsed.push({
            type: 'text',
            content: matchedText,
          });
        }
      } else if (/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mp3|wav|ogg|m4a)(\?|$)/i.test(matchedText)) {
        parsed.push({
          type: 'media',
          content: matchedText,
        });
      } else if (/youtube\.com|youtu\.be/i.test(matchedText)) {
        parsed.push({
          type: 'media',
          content: matchedText,
        });
      } else if (matchedText.startsWith('http')) {
        parsed.push({
          type: 'link',
          content: matchedText,
        });
      }

      lastIndex = matchEnd;
    }

    // Add remaining text
    if (lastIndex < cleanedContent.length) {
      parsed.push({
        type: 'text',
        content: cleanedContent.slice(lastIndex),
      });
    }

    return parsed;
  }, [cleanedContent]);

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
            <UserMention pubkey={(segment.data as any).pubkey} />
          )}

          {segment.type === 'note' && (
            <EmbeddedNote eventId={segment.data as string} />
          )}

          {segment.type === 'nevent' && (
            <EmbeddedNote eventId={(segment.data as any).id} />
          )}

          {segment.type === 'naddr' && (
            <EmbeddedArticle naddr={segment.data} />
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