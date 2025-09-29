import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NDKEvent } from '@nostr-dev-kit/ndk-hooks';
import { useZap } from '@/hooks/useZap';

interface ZapButtonProps {
  event: NDKEvent;
  initialZapCount?: number;
  size?: 'sm' | 'md';
  onZap?: (amount: number, success: boolean) => void;
}

export function ZapButton({
  event,
  initialZapCount = 0,
  size = 'sm',
  onZap
}: ZapButtonProps) {
  const [showAmounts, setShowAmounts] = useState(false);
  const [zapCount, setZapCount] = useState(initialZapCount);
  const [isZapping, setIsZapping] = useState(false);
  const [lastZapAmount, setLastZapAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { sendZap } = useZap({
    onSuccess: (amount: number) => {
      setZapCount(prev => prev + 1);
      setShowAmounts(false);
      setLastZapAmount(null);
      onZap?.(amount, true);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      if (lastZapAmount) {
        onZap?.(lastZapAmount, false);
      }
      setTimeout(() => {
        setErrorMessage(null);
        setLastZapAmount(null);
      }, 3000);
    }
  });

  const quickZapAmounts = [21, 100, 500, 1000];

  const handleZap = async (amount: number) => {
    setIsZapping(true);
    setLastZapAmount(amount);
    setErrorMessage(null);

    try {
      const success = await sendZap(event, amount);
      if (success) {
        setTimeout(() => setLastZapAmount(null), 2000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Zap failed';
      setErrorMessage(message);
      onZap?.(amount, false);
      setTimeout(() => {
        setErrorMessage(null);
        setLastZapAmount(null);
      }, 3000);
    } finally {
      setIsZapping(false);
    }
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
                : "text-neutral-500 group-hover:text-yellow-600 dark:text-neutral-400 dark:group-hover:text-yellow-500"
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
        {lastZapAmount && !errorMessage && (
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
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap"
          >
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {errorMessage}
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
              <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-2 flex gap-1">
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
                    className="px-3 py-2 bg-neutral-50 dark:bg-black hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
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