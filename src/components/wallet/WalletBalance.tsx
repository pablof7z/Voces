import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WalletBalanceProps {
  amount: number;
  unit?: string;
  showChange?: boolean;
  changeAmount?: number;
  variant?: 'minimal' | 'detailed' | 'compact';
}

export function WalletBalance({
  amount,
  unit = 'sats',
  showChange = false,
  changeAmount = 0,
  variant = 'minimal'
}: WalletBalanceProps) {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    // Animate balance changes
    const timer = setTimeout(() => {
      setDisplayAmount(amount);
    }, 100);
    return () => clearTimeout(timer);
  }, [amount]);

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const isPositiveChange = changeAmount > 0;

  if (variant === 'compact') {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-light text-neutral-900">{formatAmount(displayAmount)}</span>
        <span className="text-sm text-neutral-500">{unit}</span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <motion.span
            key={displayAmount}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-thin text-neutral-900"
          >
            {formatAmount(displayAmount)}
          </motion.span>
          <span className="text-lg text-neutral-600 mb-2">{unit}</span>
        </div>
        {showChange && changeAmount !== 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}
          >
            <span>{isPositiveChange ? '+' : '-'}</span>
            <span>{formatAmount(Math.abs(changeAmount))}</span>
            <span className="text-xs ml-1">today</span>
          </motion.div>
        )}
      </div>
    );
  }

  // Minimal variant (default)
  return (
    <div className="text-center">
      <motion.div
        key={displayAmount}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="text-4xl font-light text-neutral-900"
      >
        {formatAmount(displayAmount)}
      </motion.div>
      <div className="text-sm text-neutral-500 mt-1">{unit}</div>
    </div>
  );
}