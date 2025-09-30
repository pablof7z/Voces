import { NoteFeed } from '@/features/feed/NoteFeed';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { RelaySelector } from '@/components/navigation/RelaySelector';
import { useValidFollows } from '@/hooks/useValidFollows';

export function HomePage() {
  const currentUser = useNDKCurrentUser();
  const follows = useValidFollows();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Desktop relay selector - hidden on mobile since mobile has it in the header */}
      <div className="hidden md:block sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
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