import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useAvailableCurrencies } from './hooks/useAvailableCurrencies';
import { useAvailablePaymentMethods } from './hooks/useAvailablePaymentMethods';

interface MobileFiltersProps {
  selectedCurrency: string;
  selectedPaymentMethod: string;
  onCurrencyChange: (currency: string) => void;
  onPaymentMethodChange: (method: string) => void;
}

export function MobileFilters({
  selectedCurrency,
  selectedPaymentMethod,
  onCurrencyChange,
  onPaymentMethodChange,
}: MobileFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { currencies } = useAvailableCurrencies();
  const { paymentMethods } = useAvailablePaymentMethods();

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);
  const selectedPaymentData = paymentMethods.find(p => p.id === selectedPaymentMethod);

  return (
    <>
      {/* Compact Filter Bar */}
      <div className="flex gap-2 p-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setShowFilters(true)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-black rounded-lg text-sm"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {(selectedCurrency !== 'all' || selectedPaymentMethod !== 'all') && (
            <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-xs">
              {[selectedCurrency !== 'all' && selectedCurrency, selectedPaymentMethod !== 'all' && selectedPaymentMethod].filter(Boolean).length}
            </span>
          )}
        </button>

        {selectedCurrency !== 'all' && (
          <button
            onClick={() => onCurrencyChange('all')}
            className="flex items-center gap-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-sm"
          >
            <span>{selectedCurrencyData?.flag}</span>
            <span className="font-medium">{selectedCurrency}</span>
            <X className="w-3 h-3" />
          </button>
        )}

        {selectedPaymentMethod !== 'all' && (
          <button
            onClick={() => onPaymentMethodChange('all')}
            className="flex items-center gap-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-sm"
          >
            <span>{selectedPaymentData?.icon}</span>
            <span className="font-medium">{selectedPaymentMethod}</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Full Screen Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Currency */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Currency</h3>
              <div className="grid grid-cols-4 gap-2">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => onCurrencyChange(currency.code)}
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-lg transition-all
                      ${selectedCurrency === currency.code
                        ? 'bg-purple-600 text-white'
                        : 'bg-neutral-100 dark:bg-black hover:bg-neutral-200 dark:hover:bg-neutral-900'
                      }
                    `}
                  >
                    <span className="text-2xl">{currency.flag}</span>
                    <span className="text-xs font-medium">{currency.code === 'all' ? 'All' : currency.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Method</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => onPaymentMethodChange(method.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg transition-all
                      ${selectedPaymentMethod === method.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-neutral-100 dark:bg-black hover:bg-neutral-200 dark:hover:bg-neutral-900'
                      }
                    `}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onCurrencyChange('all');
                  onPaymentMethodChange('all');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}