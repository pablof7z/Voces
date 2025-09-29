interface Step4P2PTradesProps {
  onNext: () => void;
}

export function Step4P2PTrades({ onNext }: Step4P2PTradesProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-6">🤝</div>
        <h2 className="text-3xl font-bold mb-4">Peer-to-Peer Trading</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Trade directly with verified community members. Built-in escrow keeps your transactions safe.
        </p>

        {/* Order book example */}
        <div className="bg-neutral-card rounded-xl p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-semibold mb-4 text-left">Active Orders</h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-green-600 dark:text-green-400 font-semibold">BUY</span>
                <span className="font-medium">100 USD</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">485,000 sats</div>
                <div className="text-xs text-gray-500">by Jorge M.</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-red-600 dark:text-red-400 font-semibold">SELL</span>
                <span className="font-medium">50 USD</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">240,000 sats</div>
                <div className="text-xs text-gray-500">by Ana R.</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Escrow protected</span>
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