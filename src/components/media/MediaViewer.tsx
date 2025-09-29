import { useState, useEffect, useRef } from 'react';
import { NDKEvent, NDKKind, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import type { NDKImetaTag } from '@nostr-dev-kit/ndk';
import { useSubscribe, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { X, Send, Music, FileImage, Download } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { UserName } from '@/components/ui/UserName';
import { TimeAgo } from '@/components/ui/TimeAgo';
import { toast } from 'sonner';

interface MediaViewerProps {
  event: NDKEvent;
  imeta: NDKImetaTag;
  onClose: () => void;
}

export function MediaViewer({ event, imeta, onClose }: MediaViewerProps) {
  const currentUser = useNDKCurrentUser();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch replies to this event
  const { events: replies } = useSubscribe(
    [{
      kinds: [NDKKind.Text],
      '#e': [event.id],
    }],
    {
      subId: `replies-${event.id}`,
      cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
    },
    [event.id]
  );

  // Sort replies by timestamp
  const sortedReplies = replies?.sort((a, b) => (a.created_at || 0) - (b.created_at || 0)) || [];

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

  // Extract caption/content - for kind:20 it might be in content, for kind:1 with image URLs it's the main content
  const getCaption = () => {
    if (event.kind === NDKKind.Image) {
      // For kind:20, the content is the caption
      return event.content;
    } else if (event.kind === NDKKind.Text) {
      // For kind:1, remove the image URLs from content to get the caption
      const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|webm|mov|avi|mkv))/gi;
      return event.content.replace(urlRegex, '').trim();
    }
    return event.content;
  };

  const caption = getCaption();

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!comment.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const replyEvent = event.reply();
      replyEvent.content = comment;
      await replyEvent.publish();
      setComment('');
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full h-full max-w-7xl mx-auto flex">
        {/* Left side - Media */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          {mediaType === 'image' && (
            <img
              src={imeta.url}
              alt={imeta.alt || caption || 'Image'}
              className="max-w-full max-h-full object-contain"
            />
          )}

          {mediaType === 'video' && (
            <video
              src={imeta.url}
              className="max-w-full max-h-full"
              controls
              autoPlay
            />
          )}

          {mediaType === 'audio' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg p-8 min-w-[400px]">
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
            <div className="bg-white dark:bg-gray-950 rounded-lg p-8">
              <FileImage className="w-16 h-16 text-gray-500 mb-4" />
              <h3 className="font-semibold mb-2">{imeta.url.split('/').pop()}</h3>
              {fileSize && <p className="text-sm text-gray-500 mb-4">{fileSize} MB</p>}
              <a
                href={imeta.url}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          )}
        </div>

        {/* Right side - Details and Comments */}
        <div className="w-96 bg-white dark:bg-gray-950 flex flex-col">
          {/* Header with user info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <UserAvatar pubkey={event.pubkey} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  <UserName pubkey={event.pubkey} />
                </div>
                <div className="text-sm text-gray-500">
                  <TimeAgo timestamp={event.created_at || 0} />
                </div>
              </div>
            </div>
          </div>

          {/* Caption/Content */}
          {caption && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex gap-3">
                <UserAvatar pubkey={event.pubkey} size="sm" />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                    <UserName pubkey={event.pubkey} />
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {caption}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media metadata */}
          {(fileSize || imeta.dim) && (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {fileSize && <span>{fileSize} MB</span>}
                {imeta.dim && <span>{imeta.dim}</span>}
                {imeta.m && <span>{imeta.m}</span>}
              </div>
            </div>
          )}

          {/* Comments section */}
          <div className="flex-1 overflow-y-auto">
            {sortedReplies.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sortedReplies.map((reply) => (
                  <CommentItem key={reply.id} event={reply} />
                ))}
              </div>
            )}
          </div>

          {/* Comment input */}
          {currentUser && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <textarea
                  ref={commentInputRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                  rows={1}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || isSubmitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Comment item component
function CommentItem({ event }: { event: NDKEvent }) {
  return (
    <div className="p-4">
      <div className="flex gap-3">
        <UserAvatar pubkey={event.pubkey} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">
              <UserName pubkey={event.pubkey} />
            </span>
            <span className="text-xs text-gray-500">
              <TimeAgo timestamp={event.created_at || 0} />
            </span>
          </div>
          <div className="text-gray-800 dark:text-gray-200 mt-1 break-words">
            {event.content}
          </div>
        </div>
      </div>
    </div>
  );
}