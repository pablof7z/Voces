import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CompactFiltersProps {
  filters: {
    currency: string;
    paymentMethod: string;
    orderType: 'all' | 'buy' | 'sell';
  };
  onFiltersChange: (filters: any) => void;
}

const orderTypes = [
  { value: 'all', label: 'All', color: 'text-gray-700' },
  { value: 'buy', label: 'Buy', color: 'text-green-600' },
  { value: 'sell', label: 'Sell', color: 'text-red-600' },
];

const currencies = [
  { code: 'all', name: 'All', flag: '🌍' },
  { code: 'USD', name: 'USD', flag: '🇺🇸' },
  { code: 'EUR', name: 'EUR', flag: '🇪🇺' },
  { code: 'BRL', name: 'BRL', flag: '🇧🇷' },
  { code: 'ARS', name: 'ARS', flag: '🇦🇷' },
  { code: 'GBP', name: 'GBP', flag: '🇬🇧' },
  { code: 'PLN', name: 'PLN', flag: '🇵🇱' },
  { code: 'JPY', name: 'JPY', flag: '🇯🇵' },
];

const paymentMethods = [
  { id: 'all', name: 'All', icon: '💰' },
  { id: 'Cash', name: 'Cash', icon: '💵' },
  { id: 'PIX', name: 'PIX', icon: '🔄' },
  { id: 'BLIK', name: 'BLIK', icon: '📱' },
  { id: 'Revolut', name: 'Revolut', icon: '💳' },
  { id: 'Zelle', name: 'Zelle', icon: '🏦' },
  { id: 'CashApp', name: 'CashApp', icon: '📲' },
];

function Dropdown({
  value,
  options,
  onChange,
  renderOption,
  renderValue,
  className = ''
}: any) {
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

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {renderValue(value)}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-max min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] max-h-64 overflow-y-auto">
          {options.map((option: any) => (
            <button
              key={option.value || option.code || option.id}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              {renderOption(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompactFilters({ filters, onFiltersChange }: CompactFiltersProps) {
  const selectedOrderType = orderTypes.find(t => t.value === filters.orderType);
  const selectedCurrency = currencies.find(c => c.code === filters.currency);
  const selectedPayment = paymentMethods.find(p => p.id === filters.paymentMethod);

  return (
    <div className="relative flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-visible">
      {/* Order Type Dropdown */}
      <Dropdown
        value={filters.orderType}
        options={orderTypes}
        onChange={(option: any) => onFiltersChange({ ...filters, orderType: option.value })}
        renderValue={() => (
          <span className={selectedOrderType?.color}>
            {selectedOrderType?.label}
          </span>
        )}
        renderOption={(option: any) => (
          <span className={`text-sm font-medium ${option.color}`}>
            {option.label}
          </span>
        )}
      />

      {/* Currency Dropdown */}
      <Dropdown
        value={filters.currency}
        options={currencies}
        onChange={(option: any) => onFiltersChange({ ...filters, currency: option.code })}
        renderValue={() => (
          <>
            <span>{selectedCurrency?.flag}</span>
            <span>{selectedCurrency?.code === 'all' ? 'Currency' : selectedCurrency?.name}</span>
          </>
        )}
        renderOption={(option: any) => (
          <>
            <span className="text-lg">{option.flag}</span>
            <span className="text-sm">{option.code === 'all' ? 'All Currencies' : option.name}</span>
          </>
        )}
      />

      {/* Payment Method Dropdown */}
      <Dropdown
        value={filters.paymentMethod}
        options={paymentMethods}
        onChange={(option: any) => onFiltersChange({ ...filters, paymentMethod: option.id })}
        renderValue={() => (
          <>
            <span>{selectedPayment?.icon}</span>
            <span>{selectedPayment?.id === 'all' ? 'Payment' : selectedPayment?.name}</span>
          </>
        )}
        renderOption={(option: any) => (
          <>
            <span className="text-lg">{option.icon}</span>
            <span className="text-sm">{option.id === 'all' ? 'All Methods' : option.name}</span>
          </>
        )}
      />

      {/* Clear filters button - only show if filters are active */}
      {(filters.currency !== 'all' || filters.paymentMethod !== 'all' || filters.orderType !== 'all') && (
        <button
          onClick={() => onFiltersChange({
            ...filters,
            currency: 'all',
            paymentMethod: 'all',
            orderType: 'all'
          })}
          className="ml-auto px-2 py-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}