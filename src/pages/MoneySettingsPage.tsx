import { motion } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreferredCurrency } from '../hooks/usePreferredCurrency';

const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export function MoneySettingsPage() {
  const navigate = useNavigate();
  const { currency, updateCurrency } = usePreferredCurrency();

  const handleSelectCurrency = (code: string) => {
    updateCurrency(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/money')}
                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Money Settings
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Configure your preferred fiat currency
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Preferred Fiat Currency
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Choose your preferred currency for viewing marketplace items and P2P trades
            </p>
          </div>

          <div className="space-y-2">
            {FIAT_CURRENCIES.map((curr) => (
              <motion.button
                key={curr.code}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectCurrency(curr.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  currency === curr.code
                    ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium ${
                      currency === curr.code
                        ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {curr.symbol}
                  </div>
                  <div className="text-left">
                    <div
                      className={`font-medium ${
                        currency === curr.code
                          ? 'text-neutral-50 dark:text-neutral-900'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {curr.code}
                    </div>
                    <div
                      className={`text-sm ${
                        currency === curr.code
                          ? 'text-neutral-300 dark:text-neutral-600'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {curr.name}
                    </div>
                  </div>
                </div>
                {currency === curr.code && (
                  <Check className="w-5 h-5 text-neutral-50 dark:text-neutral-900" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}