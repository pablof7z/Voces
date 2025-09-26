import { useState, type FormEvent, useRef, useEffect } from 'react';
import { useNDK, NDKEvent, useNDKCurrentUser, NDKKind, useProfile } from '@nostr-dev-kit/ndk-hooks';
import { Image, Smile, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ComposeNote() {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const profile = useProfile(currentUser?.pubkey);
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  }, [content]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser || !ndk) return;

    setIsPublishing(true);
    try {
      const event = new NDKEvent(ndk);
      event.kind = NDKKind.Text;
      event.content = content;
      
      await event.publish();
      setContent('');
    } catch (error) {
      console.error('Failed to publish note:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const displayName = profile?.name || 'Anonymous';
  const remainingChars = 280 - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white dark:bg-black rounded-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile?.picture ? (
              <img
                src={profile.picture}
                alt={displayName}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full p-0 text-lg placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-transparent resize-none focus:outline-none text-gray-900 dark:text-gray-100 min-h-[60px]"
              disabled={isPublishing}
            />
            
            {/* Actions bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                  title="Add image (coming soon)"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                  title="Add emoji (coming soon)"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                  title="Add location (coming soon)"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Character counter */}
                {content.length > 0 && (
                  <div className="relative">
                    <svg className="w-8 h-8 -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${Math.max(0, (Math.min(280, content.length) / 280) * 88)} 88`}
                        strokeLinecap="round"
                        className={cn(
                          "transition-all duration-150",
                          isOverLimit ? "text-red-500" : 
                          remainingChars < 20 ? "text-yellow-500" : 
                          "text-purple-500"
                        )}
                      />
                    </svg>
                    {remainingChars < 20 && (
                      <span className={cn(
                        "absolute inset-0 flex items-center justify-center text-xs font-medium",
                        isOverLimit ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {remainingChars}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Publish button */}
                <button
                  type="submit"
                  disabled={!content.trim() || isPublishing || isOverLimit}
                  className={cn(
                    "px-4 py-1.5 rounded-full font-medium transition-all",
                    (!content.trim() || isOverLimit)
                      ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                  )}
                >
                  {isPublishing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing
                    </span>
                  ) : (
                    'Publish'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}