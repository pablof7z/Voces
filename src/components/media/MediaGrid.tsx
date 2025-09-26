import { mapImetaTag } from '@nostr-dev-kit/ndk';
import type { NDKEvent, NDKImetaTag } from '@nostr-dev-kit/ndk';
import { Play, Music, FileImage, Download } from 'lucide-react';
import { useState } from 'react';

interface MediaGridProps {
  events: NDKEvent[];
}

interface MediaItemProps {
  event: NDKEvent;
  imeta: NDKImetaTag;
}

function MediaItem({ event, imeta }: MediaItemProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);

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
        className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 cursor-pointer"
        onClick={() => setShowFullscreen(true)}
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
              <div className="w-16 h-16 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-900 dark:text-white ml-1" />
              </div>
            </div>
          </div>
        )}

        {mediaType === 'audio' && (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="w-16 h-16 text-white" />
          </div>
        )}

        {mediaType === 'file' && (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center gap-2">
            <FileImage className="w-16 h-16 text-gray-500" />
            {imeta.url && (
              <span className="text-xs text-gray-600 dark:text-gray-400 px-2 text-center">
                {imeta.url.split('/').pop()?.substring(0, 20)}...
              </span>
            )}
          </div>
        )}

        {/* Overlay with metadata */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {event.content && (
            <p className="text-white text-sm line-clamp-2 mb-1">
              {event.content}
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

      {/* Fullscreen modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            {mediaType === 'image' && (
              <img
                src={imeta.url}
                alt={imeta.alt || event.content || 'Image'}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}

            {mediaType === 'video' && (
              <video
                src={imeta.url}
                className="max-w-full max-h-[90vh]"
                controls
                autoPlay
              />
            )}

            {mediaType === 'audio' && (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-8 min-w-[400px]">
                <div className="flex items-center gap-4 mb-4">
                  <Music className="w-12 h-12 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">{imeta.alt || 'Audio File'}</h3>
                    {fileSize && <p className="text-sm text-gray-500">{fileSize} MB</p>}
                  </div>
                </div>
                <audio src={imeta.url} controls autoPlay className="w-full" />
              </div>
            )}

            {mediaType === 'file' && imeta.url && (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-8">
                <FileImage className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="font-semibold mb-2">{imeta.url.split('/').pop()}</h3>
                {fileSize && <p className="text-sm text-gray-500 mb-4">{fileSize} MB</p>}
                <a
                  href={imeta.url}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  onClick={e => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function MediaGrid({ events }: MediaGridProps) {
  // Process events to extract media items with imeta tags
  const mediaItems = events.flatMap(event => {
    const imetaTags = event.tags.filter(tag => tag[0] === 'imeta');
    const imetas = imetaTags.map(tag => mapImetaTag(tag));

    // Return only events with valid imeta tags that have URLs
    return imetas
      .filter(imeta => imeta.url)
      .map(imeta => ({ event, imeta }));
  });

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No media uploaded yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {mediaItems.map(({ event, imeta }, index) => (
        <MediaItem key={`${event.id}-${index}`} event={event} imeta={imeta} />
      ))}
    </div>
  );
}