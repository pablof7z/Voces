import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { useAvailableCurrencies } from './hooks/useAvailableCurrencies';
import { useAvailablePaymentMethods } from './hooks/useAvailablePaymentMethods';

interface TradeFiltersProps {
  filters: {
    currency: string;
    paymentMethod: string;
    orderType: 'all' | 'buy' | 'sell';
    minAmount: number;
    maxAmount: number;
  };
  onChange: (filters: any) => void;
}

export function TradeFilters({ filters, onChange }: TradeFiltersProps) {
  const { currencies } = useAvailableCurrencies();
  const { paymentMethods } = useAvailablePaymentMethods();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Currency Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <DollarSign className="w-4 h-4" />
          Currency
        </label>
        <select
          value={filters.currency}
          onChange={(e) => onChange({ ...filters, currency: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.code === 'all' ? curr.name : `${curr.code} - ${curr.name}`}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Method Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CreditCard className="w-4 h-4" />
          Payment Method
        </label>
        <select
          value={filters.paymentMethod}
          onChange={(e) => onChange({ ...filters, paymentMethod: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
        >
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      {/* Order Type Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <TrendingUp className="w-4 h-4" />
          Order Type
        </label>
        <select
          value={filters.orderType}
          onChange={(e) => onChange({ ...filters, orderType: e.target.value as 'all' | 'buy' | 'sell' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
        >
          <option value="all">All Orders</option>
          <option value="buy">Buy Orders</option>
          <option value="sell">Sell Orders</option>
        </select>
      </div>

      {/* Amount Range */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Amount Range (sats)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => onChange({ ...filters, minAmount: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white text-sm"
            placeholder="Min"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => onChange({ ...filters, maxAmount: parseInt(e.target.value) || 1000000 })}
            className="w-full px-2 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white text-sm"
            placeholder="Max"
          />
        </div>
      </div>
    </div>
  );
}