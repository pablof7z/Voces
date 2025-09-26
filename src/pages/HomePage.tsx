import { NoteFeed } from '@/features/feed/NoteFeed';
import { ComposeNote } from '@/features/feed/ComposeNote';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

export function HomePage() {
  const currentUser = useNDKCurrentUser();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Home</h2>
        </div>
      </div>
      
      {/* Compose section for logged-in users - hidden on mobile */}
      {currentUser && (
        <div className="hidden md:block border-b border-gray-200 dark:border-gray-800">
          <div className="p-4 sm:p-6">
            <ComposeNote />
          </div>
        </div>
      )}
      
      {/* Notes feed */}
      <NoteFeed />
    </div>
  );
}