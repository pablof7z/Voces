import { NoteFeed } from '@/features/feed/NoteFeed';
import { useNDKCurrentUser, useFollows } from '@nostr-dev-kit/ndk-hooks';
import { RelaySelector } from '@/components/navigation/RelaySelector';

export function HomePage() {
  const currentUser = useNDKCurrentUser();
  const follows = useFollows();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Desktop relay selector - hidden on mobile since mobile has it in the header */}
      <div className="hidden md:block sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 sm:px-6">
          <RelaySelector />
        </div>
      </div>
      
      <NoteFeed
        authors={currentUser ? Array.from(follows) : undefined}
        showMediaFilter={true}
      />
    </div>
  );
}