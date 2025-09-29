import { useState } from 'react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import type { IntroductionPost } from '@/features/onboarding/hooks/useIntroductionPosts';
import { NoteCard } from '@/features/feed/NoteCard';

interface Step7IntroductionProps {
  publicKey: string | null;
  profileData: {
    name: string;
    bio: string;
    location: string;
  };
  introductionPosts: IntroductionPost[];
  onNext: () => void;
  onSkip: () => void;
}


export function Step7Introduction({ publicKey, profileData, introductionPosts, onNext, onSkip }: Step7IntroductionProps) {
  const [introText, setIntroText] = useState('');
  const [publishing, setPublishing] = useState(false);
  const ndk = useNDK();

  const hasValidIntro = introText.length > 10;
  const charCount = introText.length;

  const publishIntroduction = async () => {
    if (!hasValidIntro || !publicKey) return;

    setPublishing(true);
    try {
      // Auto-append #introductions if not present
      let content = introText;
      if (!content.includes('#introductions')) {
        content = content.trim() + ' #introductions';
      }

      const event = new NDKEvent(ndk.ndk);
      event.kind = 1; // Regular note
      event.content = content;
      event.tags = [['t', 'introductions']]; // Add hashtag

      await event.publish();
      onNext();
    } catch (error) {
      console.error('Error publishing introduction:', error);
      setPublishing(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-8 py-6 max-w-[1400px] mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Introduce Yourself to the Community</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Write a brief introduction. Good introductions often earn zaps!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Left column: Recent introductions */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">
              💎 Recent Introductions
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {introductionPosts.length > 0 ? (
                introductionPosts.map((intro) => (
                  <NoteCard
                    key={intro.event.id}
                    event={intro.event}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading recent introductions...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Composition area */}
          <div className="flex flex-col">

            <div className="p-6">
              <label className="block font-semibold mb-3">Write Your Introduction</label>
              <textarea
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                placeholder="Tell the community who you are, what you do, and what brings you here."
                className="w-full min-h-[200px] p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                rows={8}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">
                  {profileData.location && `Tip: Mention that you're from ${profileData.location}`}
                </div>
                <div className="text-xs">
                  <span className={charCount > 500 ? 'text-red-500' : 'text-gray-500'}>
                    {charCount} characters
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onSkip}
                  className="flex-1 py-3 px-6 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={publishIntroduction}
                  disabled={!hasValidIntro || publishing}
                  className={`
                    flex-1 py-3 px-6 rounded-lg font-medium transition-all
                    ${hasValidIntro && !publishing
                      ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                      : 'bg-gray-100 dark:bg-black text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {publishing ? 'Publishing...' : 'Post Introduction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}