import { useState, useMemo } from 'react';
import { Play, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';

interface MediaEmbedProps {
  url: string;
  className?: string;
}

export function MediaEmbed({ url, className = '' }: MediaEmbedProps) {
  const [showMedia, setShowMedia] = useState(false);
  const [muted, setMuted] = useState(true);
  const [imageError, setImageError] = useState(false);

  const mediaType = useMemo(() => {
    const lowerUrl = url.toLowerCase();

    // Image formats
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(lowerUrl)) {
      return 'image';
    }

    // Video formats
    if (/\.(mp4|webm|mov)(\?|$)/i.test(lowerUrl)) {
      return 'video';
    }

    // Audio formats
    if (/\.(mp3|wav|ogg|m4a)(\?|$)/i.test(lowerUrl)) {
      return 'audio';
    }

    // YouTube
    if (/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)|youtu\.be\/([a-zA-Z0-9_-]+)/i.test(lowerUrl)) {
      return 'youtube';
    }

    return 'unknown';
  }, [url]);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  if (mediaType === 'image') {
    if (imageError) {
      return (
        <div className="my-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <ImageIcon className="w-4 h-4" />
          <span>Image could not be loaded</span>
        </div>
      );
    }

    return (
      <div className={`my-2 ${className}`}>
        <img
          src={url}
          alt="Embedded content"
          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
          loading="lazy"
          onError={() => setImageError(true)}
          onClick={(e) => {
            e.stopPropagation();
            window.open(url, '_blank');
          }}
        />
      </div>
    );
  }

  if (mediaType === 'video') {
    if (!showMedia) {
      return (
        <div className={`my-2 ${className}`}>
          <div
            className="relative bg-neutral-900 rounded-lg aspect-video flex items-center justify-center cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              setShowMedia(true);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-lg"></div>
            <button className="relative z-10 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
              <Play className="w-8 h-8 text-neutral-900 ml-1" fill="currentColor" />
            </button>
            <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
              Click to play video
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`my-2 relative ${className}`}>
        <video
          src={url}
          controls
          autoPlay
          muted={muted}
          className="max-w-full h-auto rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!muted);
          }}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  if (mediaType === 'audio') {
    return (
      <div className={`my-2 ${className}`}>
        <audio
          src={url}
          controls
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  if (mediaType === 'youtube') {
    const videoId = getYouTubeId(url);

    if (!videoId) return null;

    if (!showMedia) {
      return (
        <div className={`my-2 ${className}`}>
          <div
            className="relative bg-neutral-900 rounded-lg aspect-video flex items-center justify-center cursor-pointer group"
            style={{
              backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowMedia(true);
            }}
          >
            <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
            <button className="relative z-10 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`my-2 ${className}`}>
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }

  return null;
}