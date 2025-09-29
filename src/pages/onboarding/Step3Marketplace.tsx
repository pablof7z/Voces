interface Step3MarketplaceProps {
  onNext: () => void;
}

export function Step3Marketplace({ onNext }: Step3MarketplaceProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-6">🛍️</div>
        <h2 className="text-3xl font-bold mb-4">Buy and Sell Locally</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Connect with your community marketplace. No middlemen, no fees. Just people helping people.
        </p>

        {/* Example listing */}
        <div className="bg-neutral-card rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
              MR
            </div>
            <div className="flex-1">
              <div className="font-semibold">María&apos;s Bakery</div>
              <div className="text-xs text-gray-500">2km away</div>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              Available
            </span>
          </div>
          <h3 className="font-semibold mb-2">Fresh Bread & Pastries</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Daily baked goods, accepting sats or local currency. Delivery available in Petare area.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">2,500 sats / dozen</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">Contact Seller →</button>
          </div>
        </div>

        <button
          onClick={onNext}
          className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}