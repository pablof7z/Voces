import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZapButtonProps {
  eventId: string;
  authorPubkey: string;
  initialZapCount?: number;
  size?: 'sm' | 'md';
  onZap?: (amount: number) => void;
}

export function ZapButton({
  eventId: _eventId,
  authorPubkey: _authorPubkey,
  initialZapCount = 0,
  size = 'sm',
  onZap
}: ZapButtonProps) {
  const [showAmounts, setShowAmounts] = useState(false);
  const [zapCount, setZapCount] = useState(initialZapCount);
  const [isZapping, setIsZapping] = useState(false);
  const [lastZapAmount, setLastZapAmount] = useState<number | null>(null);

  const quickZapAmounts = [21, 100, 500, 1000];

  const handleZap = async (amount: number) => {
    setIsZapping(true);
    setLastZapAmount(amount);

    // Mock zap action
    setTimeout(() => {
      setZapCount(prev => prev + 1);
      setIsZapping(false);
      setShowAmounts(false);
      onZap?.(amount);

      // Clear the animation after a moment
      setTimeout(() => setLastZapAmount(null), 2000);
    }, 500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowAmounts(!showAmounts)}
        className={cn(
          "group flex items-center gap-2 p-2 rounded-full transition-all",
          zapCount > 0
            ? "text-yellow-600 dark:text-yellow-500"
            : "hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
          size === 'md' && "p-3"
        )}
      >
        <motion.div
          animate={isZapping ? { rotate: 360 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Zap
            className={cn(
              "transition-all",
              size === 'md' ? "w-5 h-5" : "w-4 h-4",
              zapCount > 0
                ? "fill-current text-yellow-600 dark:text-yellow-500"
                : "text-gray-500 group-hover:text-yellow-600 dark:text-gray-400 dark:group-hover:text-yellow-500"
            )}
          />
        </motion.div>

        {zapCount > 0 && (
          <span className={cn(
            "font-medium",
            size === 'md' ? "text-base" : "text-sm",
            "text-yellow-600 dark:text-yellow-500"
          )}>
            {zapCount}
          </span>
        )}
      </button>

      {/* Floating zap amount indicator */}
      <AnimatePresence>
        {lastZapAmount && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">
              +{lastZapAmount} ⚡
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick zap amounts */}
      <AnimatePresence>
        {showAmounts && (
          <>
            {/* Backdrop to close on click outside */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowAmounts(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="absolute bottom-full left-0 mb-2 z-20"
            >
              <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1">
                {quickZapAmounts.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZap(amount);
                    }}
                    disabled={isZapping}
                    className="px-3 py-2 bg-gray-50 dark:bg-black hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {amount}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}