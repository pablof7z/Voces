import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import type { NDKFilter, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { usePreferredCurrency } from '@/hooks/usePreferredCurrency';

export function P2PTradeSidebar() {
  const navigate = useNavigate();
  const { currency } = usePreferredCurrency();

  const tradesFilter: NDKFilter = {
    kinds: [38383 as NDKKind],
    limit: 100,
  };

  const { events: tradeEvents } = useSubscribe(
    [tradesFilter],
    { closeOnEose: false, subId: 'trades-sidebar' }
  );

  const activeTrades = useMemo(() => {
    const trades: Array<{
      id: string;
      type: 'buy' | 'sell';
      currency: string;
      fiatAmount: number;
      satsAmount: number;
    }> = [];

    tradeEvents.forEach((event: NDKEvent) => {
      const tags = event.tags;
      const zTag = tags.find((t: string[]) => t[0] === 'z');
      if (zTag && zTag[1] === 'info') return;

      const orderType = tags.find((t: string[]) => t[0] === 'k')?.[1] as 'buy' | 'sell';
      const tradeCurrency = tags.find((t: string[]) => t[0] === 'f')?.[1];
      const status = tags.find((t: string[]) => t[0] === 's')?.[1];
      const dTag = tags.find((t: string[]) => t[0] === 'd')?.[1];
      const satsAmount = parseInt(tags.find((t: string[]) => t[0] === 'amt')?.[1] || '0');
      const fiatAmount = parseFloat(tags.find((t: string[]) => t[0] === 'fa')?.[1] || '0');

      if (status === 'pending' && orderType && tradeCurrency && dTag) {
        if (currency === 'all' || tradeCurrency.toUpperCase() === currency.toUpperCase()) {
          trades.push({
            id: dTag,
            type: orderType,
            currency: tradeCurrency,
            fiatAmount,
            satsAmount,
          });
        }
      }
    });

    return trades.slice(0, 5);
  }, [tradeEvents, currency]);

  return (
    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            P2P Trades
          </h3>
        </div>
        <button
          onClick={() => navigate('/trades')}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {activeTrades.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-500">
            No active trades {currency !== 'all' && `in ${currency}`}
          </div>
        ) : (
          activeTrades.map((trade) => (
            <motion.div
              key={trade.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/trades')}
              className="bg-neutral-800/30 rounded-lg p-3 cursor-pointer transition-all hover:bg-neutral-800/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  trade.type === 'buy'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-red-900/30 text-red-400'
                }`}>
                  {trade.type.toUpperCase()}
                </span>
                <span className="text-xs font-medium text-neutral-400">
                  {trade.currency.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  {trade.satsAmount.toLocaleString()} sats
                </p>
                <p className="text-xs text-neutral-500">
                  ≈ {trade.fiatAmount.toLocaleString()} {trade.currency.toUpperCase()}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}