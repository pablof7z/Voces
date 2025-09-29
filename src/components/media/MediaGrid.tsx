import { mapImetaTag } from '@nostr-dev-kit/ndk';
import type { NDKEvent, NDKImetaTag } from '@nostr-dev-kit/ndk';
import { Play, Music, FileImage } from 'lucide-react';
import { useState } from 'react';
import { MediaViewer } from './MediaViewer';

interface MediaGridProps {
  events: NDKEvent[];
}

interface MediaItemProps {
  event: NDKEvent;
  imeta: NDKImetaTag;
}

function MediaItem({ event, imeta }: MediaItemProps) {
  const [showViewer, setShowViewer] = useState(false);

  // Determine media type from mimetype or URL extension
  const getMediaType = (imeta: NDKImetaTag): 'image' | 'video' | 'audio' | 'file' => {
    const mime = imeta.m;
    const url = imeta.url;

    if (mime) {
      if (mime.startsWith('image/')) return 'image';
      if (mime.startsWith('video/')) return 'video';
      if (mime.startsWith('audio/')) return 'audio';
    } else if (url) {
      const ext = url.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext || '')) return 'image';
      if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '')) return 'video';
      if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext || '')) return 'audio';
    }

    return 'file';
  };

  const mediaType = getMediaType(imeta);
  const fileSize = imeta.size ? (parseInt(imeta.size) / (1024 * 1024)).toFixed(1) : null;

  // Format blurhash if available
  const blurhash = imeta.blurhash;

  return (
    <>
      <div
        className="group relative aspect-square overflow-hidden bg-neutral-100 dark:bg-black cursor-pointer"
        onClick={() => setShowViewer(true)}
      >
        {mediaType === 'image' && (
          <img
            src={imeta.url}
            alt={imeta.alt || event.content || 'Image'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            style={blurhash ? {
              backgroundImage: `url(data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="${blurhash}"/></svg>`)})`,
              backgroundSize: 'cover'
            } : undefined}
          />
        )}

        {mediaType === 'video' && (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              src={imeta.url}
              className="max-w-full max-h-full"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-neutral-900 dark:text-white ml-1" />
              </div>
            </div>
          </div>
        )}

        {mediaType === 'audio' && (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Music className="w-16 h-16 text-white" />
          </div>
        )}

        {mediaType === 'file' && (
          <div className="w-full h-full bg-neutral-200 dark:bg-black flex flex-col items-center justify-center gap-2">
            <FileImage className="w-16 h-16 text-neutral-500" />
            {imeta.url && (
              <span className="text-xs text-neutral-600 dark:text-neutral-400 px-2 text-center">
                {imeta.url.split('/').pop()?.substring(0, 20)}...
              </span>
            )}
          </div>
        )}

        {/* Overlay with metadata */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {event.content && (
            <p className="text-white text-sm line-clamp-2 mb-1">
              {event.content.trim()}
            </p>
          )}
          <div className="flex items-center gap-2 text-white/80 text-xs">
            {fileSize && <span>{fileSize} MB</span>}
            {imeta.dim && <span>{imeta.dim}</span>}
          </div>
        </div>

        {/* Media type indicator */}
        {mediaType !== 'image' && (
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
            {mediaType === 'video' && 'Video'}
            {mediaType === 'audio' && 'Audio'}
            {mediaType === 'file' && 'File'}
          </div>
        )}
      </div>

      {/* Media viewer modal */}
      {showViewer && (
        <MediaViewer
          event={event}
          imeta={imeta}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}

export function MediaGrid({ events }: MediaGridProps) {
  // Helper to extract media URLs from content
  const extractMediaUrls = (content: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|webm|mov|avi|mkv))/gi;
    return content.match(urlRegex) || [];
  };

  // Process events to extract media items with imeta tags or content URLs
  const mediaItems = events.flatMap(event => {
    const imetaTags = event.tags.filter(tag => tag[0] === 'imeta');
    const imetas = imetaTags.map(tag => mapImetaTag(tag));

    // Items from imeta tags
    const imetaItems = imetas
      .filter(imeta => imeta.url)
      .map(imeta => ({ event, imeta }));

    // If we have imeta tags, use those
    if (imetaItems.length > 0) {
      return imetaItems;
    }

    // Otherwise, extract media URLs from content (for kind:1 events)
    const contentUrls = extractMediaUrls(event.content);
    return contentUrls.map(url => {
      // Create a simple imeta-like object from the URL
      const ext = url.split('.').pop()?.toLowerCase();
      const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '');

      return {
        event,
        imeta: {
          url,
          m: isVideo ? 'video/' + ext : 'image/' + ext,
        } as NDKImetaTag
      };
    });
  });

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        No media uploaded yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {mediaItems.map(({ event, imeta }, index) => (
        <MediaItem key={`${event.id}-${index}`} event={event} imeta={imeta} />
      ))}
    </div>
  );
}