import type { ListingPrice } from '../types';

interface PriceTagProps {
  price: ListingPrice;
  className?: string;
}

export function PriceTag({ price, className = '' }: PriceTagProps) {
  const formatFrequency = (frequency?: string) => {
    if (!frequency || frequency === 'once') return '';
    return `/${frequency}`;
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ${className}`}>
      {price.amount} {price.currency}{formatFrequency(price.frequency)}
    </span>
  );
}