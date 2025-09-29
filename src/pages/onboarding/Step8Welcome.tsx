interface Step8WelcomeProps {
  selectedPacks: string[];
  profileData: {
    name: string;
  };
  onComplete: () => void;
}

export function Step8Welcome({ selectedPacks, profileData, onComplete }: Step8WelcomeProps) {
  const followCount = selectedPacks.length * 25; // Approximate

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4">Welcome to Voces, {profileData.name || 'Friend'}!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Your voice matters. Your community is here.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6">
            <div className="text-3xl font-bold mb-1">{followCount}</div>
            <div className="text-sm text-gray-500">People Following</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6">
            <div className="text-3xl font-bold mb-1">{selectedPacks.length}</div>
            <div className="text-sm text-gray-500">Follow Packs</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6">
            <div className="text-3xl font-bold mb-1">1</div>
            <div className="text-sm text-gray-500">Post Published</div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl p-8 mb-8 text-left max-w-lg mx-auto">
          <h3 className="font-semibold mb-4">What&apos;s Next?</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Your feed is ready with content from {followCount} community voices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>You can start buying and selling in the marketplace</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Join P2P trades with verified community members</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Share your stories and earn sats for valuable content</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onComplete}
          className="bg-black dark:bg-white text-white dark:text-black px-12 py-4 rounded-lg font-medium text-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          Enter Voces →
        </button>
      </div>
    </div>
  );
}