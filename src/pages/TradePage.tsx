import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { OrderBook } from '@/features/trades/OrderBook';
import { CreateOrderModal } from '@/features/trades/CreateOrderModal';
import { QuickFilters } from '@/features/trades/QuickFilters';
import { CompactFilters } from '@/features/trades/CompactFilters';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

export function TradePage() {
  const currentUser = useNDKCurrentUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    currency: 'all',
    paymentMethod: 'all',
    orderType: 'all' as 'all' | 'buy' | 'sell',
    minAmount: 0,
    maxAmount: 1000000
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">P2P Trading</h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 hidden sm:block">
                Buy and sell Bitcoin directly
              </p>
            </div>

            {currentUser && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="hidden md:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters - Mobile vs Desktop */}
      {isMobile ? (
        <CompactFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      ) : (
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <QuickFilters
              selectedCurrency={filters.currency}
              selectedPaymentMethod={filters.paymentMethod}
              onCurrencyChange={(currency) => setFilters({ ...filters, currency })}
              onPaymentMethodChange={(method) => setFilters({ ...filters, paymentMethod: method })}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OrderBook filters={filters} />
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}