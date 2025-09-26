import { Globe, CreditCard } from 'lucide-react';
import { useAvailableCurrencies } from './hooks/useAvailableCurrencies';

interface QuickFiltersProps {
  selectedCurrency: string;
  selectedPaymentMethod: string;
  onCurrencyChange: (currency: string) => void;
  onPaymentMethodChange: (method: string) => void;
}

const popularPaymentMethods = [
  { id: 'all', name: 'All Methods', icon: '💰', countries: [] },
  { id: 'Cash', name: 'Cash', icon: '💵', countries: ['Universal'] },
  { id: 'PIX', name: 'PIX', icon: '🔄', countries: ['Brazil'] },
  { id: 'BLIK', name: 'BLIK', icon: '📱', countries: ['Poland'] },
  { id: 'Revolut', name: 'Revolut', icon: '💳', countries: ['Europe'] },
  { id: 'Zelle', name: 'Zelle', icon: '🏦', countries: ['USA'] },
  { id: 'CashApp', name: 'CashApp', icon: '📲', countries: ['USA'] },
  { id: 'CVU', name: 'CVU/MP', icon: '🏧', countries: ['Argentina'] },
  { id: 'f2f', name: 'Face to Face', icon: '🤝', countries: ['Local'] },
];

export function QuickFilters({
  selectedCurrency,
  selectedPaymentMethod,
  onCurrencyChange,
  onPaymentMethodChange,
}: QuickFiltersProps) {
  const { currencies, loading } = useAvailableCurrencies();

  return (
    <div className="space-y-4">
      {/* Currency Filter */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Globe className="w-4 h-4" />
          <span>Currency</span>
          {loading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">(Loading currencies...)</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => onCurrencyChange(currency.code)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedCurrency === currency.code
                  ? 'bg-purple-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-sm'
                }
              `}
            >
              <span className="text-base">{currency.flag}</span>
              <span>{currency.code === 'all' ? currency.name : currency.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Filter */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CreditCard className="w-4 h-4" />
          <span>Payment Method</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularPaymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onPaymentMethodChange(method.id)}
              className={`
                group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedPaymentMethod === method.id
                  ? 'bg-purple-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-sm'
                }
              `}
            >
              <span className="text-base">{method.icon}</span>
              <span>{method.name}</span>
              {method.countries.length > 0 && method.id !== 'all' && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full ml-1
                  ${selectedPaymentMethod === method.id
                    ? 'bg-purple-700/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {method.countries[0]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedCurrency !== 'all' || selectedPaymentMethod !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Active filters:</span>
          {selectedCurrency !== 'all' && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
              {currencies.find(c => c.code === selectedCurrency)?.flag} {selectedCurrency}
            </span>
          )}
          {selectedPaymentMethod !== 'all' && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
              {popularPaymentMethods.find(m => m.id === selectedPaymentMethod)?.icon} {selectedPaymentMethod}
            </span>
          )}
          <button
            onClick={() => {
              onCurrencyChange('all');
              onPaymentMethodChange('all');
            }}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline text-xs"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}