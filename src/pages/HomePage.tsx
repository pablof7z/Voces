import { NoteFeed } from '@/features/feed/NoteFeed';
import { ComposeNote } from '@/features/feed/ComposeNote';
import { useNDKCurrentUser, useFollows } from '@nostr-dev-kit/ndk-hooks';
import { RelaySelector } from '@/components/navigation/RelaySelector';

export function HomePage() {
  const currentUser = useNDKCurrentUser();
  const follows = useFollows();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 sm:px-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Home</h2>
          <RelaySelector />
        </div>
      </div>
      
      {currentUser && (
        <div className="hidden md:block border-b border-gray-200 dark:border-gray-800">
          <div className="p-4 sm:p-6">
            <ComposeNote />
          </div>
        </div>
      )}
      
      <NoteFeed authors={currentUser ? Array.from(follows) : undefined} />
    </div>
  );
}