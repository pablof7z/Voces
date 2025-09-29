import { Globe, CreditCard, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAvailableCurrencies } from './hooks/useAvailableCurrencies';
import { useAvailablePaymentMethods } from './hooks/useAvailablePaymentMethods';

interface QuickFiltersProps {
  selectedCurrency: string;
  selectedPaymentMethod: string;
  onCurrencyChange: (currency: string) => void;
  onPaymentMethodChange: (method: string) => void;
}


function CurrencyDropdown({
  currencies,
  selectedCurrency,
  onCurrencyChange,
}: {
  currencies: Array<{ code: string; name: string; flag: string }>;
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[140px]
          ${selectedCurrency !== 'all'
            ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
            : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
          }
        `}
      >
        <span className="text-base">{selectedCurrencyData?.flag}</span>
        <span className="flex-1 text-left">
          {selectedCurrency === 'all' ? 'All Currencies' : selectedCurrency}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100] max-h-96 overflow-y-auto">
          <div className="py-1">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  onCurrencyChange(currency.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left
                  ${selectedCurrency === currency.code ? 'bg-purple-50 dark:bg-purple-900/30' : ''}
                `}
              >
                <span className="text-lg">{currency.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {currency.code === 'all' ? currency.name : currency.code}
                  </div>
                  {currency.code !== 'all' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">{currency.name}</div>
                  )}
                </div>
                {selectedCurrency === currency.code && (
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentMethodDropdown({
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodChange,
}: {
  paymentMethods: Array<{ id: string; name: string; icon: string }>;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMethodData = paymentMethods.find(pm => pm.id === selectedPaymentMethod);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[140px]
          ${selectedPaymentMethod !== 'all'
            ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
            : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
          }
        `}
      >
        <span className="text-base">{selectedMethodData?.icon}</span>
        <span className="flex-1 text-left">
          {selectedPaymentMethod === 'all' ? 'All Methods' : selectedMethodData?.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100] max-h-96 overflow-y-auto">
          <div className="py-1">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  onPaymentMethodChange(method.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left
                  ${selectedPaymentMethod === method.id ? 'bg-purple-50 dark:bg-purple-900/30' : ''}
                `}
              >
                <span className="text-lg">{method.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{method.name}</div>
                </div>
                {selectedPaymentMethod === method.id && (
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickFilters({
  selectedCurrency,
  selectedPaymentMethod,
  onCurrencyChange,
  onPaymentMethodChange,
}: QuickFiltersProps) {
  const { currencies } = useAvailableCurrencies();
  const { paymentMethods } = useAvailablePaymentMethods();
  const showCurrencyAsDropdown = currencies.length > 8;
  const showPaymentAsDropdown = paymentMethods.length > 8;

  return (
    <div className="space-y-4">
      {/* Currency Filter */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Globe className="w-4 h-4" />
          <span>Currency</span>
        </div>
        {showCurrencyAsDropdown ? (
          <CurrencyDropdown
            currencies={currencies}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => onCurrencyChange(currency.code)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedCurrency === currency.code
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-sm'
                  }
                `}
              >
                <span className="text-base">{currency.flag}</span>
                <span>{currency.code === 'all' ? currency.name : currency.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Filter */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CreditCard className="w-4 h-4" />
          <span>Payment Method</span>
        </div>
        {showPaymentAsDropdown ? (
          <PaymentMethodDropdown
            paymentMethods={paymentMethods}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={onPaymentMethodChange}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => onPaymentMethodChange(method.id)}
                className={`
                  group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedPaymentMethod === method.id
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-sm'
                  }
                `}
              >
                <span className="text-base">{method.icon}</span>
                <span>{method.name}</span>
              </button>
            ))}
          </div>
        )}
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
              {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon} {selectedPaymentMethod}
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