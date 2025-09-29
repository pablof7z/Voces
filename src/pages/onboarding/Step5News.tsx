interface Step5NewsProps {
  onNext: () => void;
}

export function Step5News({ onNext }: Step5NewsProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-6">📰</div>
        <h2 className="text-3xl font-bold mb-4">Real News from Real People</h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          No censorship. No propaganda. Just authentic stories from your community.
        </p>

        {/* News example */}
        <div className="bg-neutral-card rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-neutral-300 dark:bg-neutral-700 rounded-full flex items-center justify-center text-sm font-medium">
              CM
            </div>
            <div className="flex-1">
              <div className="font-semibold">Carlos Mendoza</div>
              <div className="text-xs text-neutral-500">Independent Journalist · 2 hours ago</div>
            </div>
          </div>
          <h3 className="font-semibold mb-2">Community Organizes Alternative Supply Chain</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Residents in Petare have successfully established a direct farmer-to-community distribution network,
            bypassing traditional middlemen and reducing food costs by 40%...
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              ⚡ 23.5k sats
            </span>
            <span className="flex items-center gap-1">
              💬 156 comments
            </span>
            <span className="flex items-center gap-1">
              🔁 89 reposts
            </span>
          </div>
        </div>

        <button
          onClick={onNext}
          className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}