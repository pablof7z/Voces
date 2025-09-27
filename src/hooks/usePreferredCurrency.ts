import { useState, useEffect } from 'react';

const PREFERRED_CURRENCY_KEY = 'preferredFiatCurrency';
const DEFAULT_CURRENCY = 'USD';

export function usePreferredCurrency() {
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    const saved = localStorage.getItem(PREFERRED_CURRENCY_KEY);
    if (saved) {
      setCurrency(saved);
    }
  }, []);

  const updateCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem(PREFERRED_CURRENCY_KEY, newCurrency);
  };

  return {
    currency,
    updateCurrency,
  };
}