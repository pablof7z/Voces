import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  ChevronRight,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useWalletStore } from '../stores/walletStore';
import { DepositModal } from '../components/wallet/DepositModal';
import { useListings } from '@/features/classifieds/hooks/useListings';
import { useTranslation } from 'react-i18next';
import { usePreferredCurrency } from '../hooks/usePreferredCurrency';
import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import type { NDKFilter, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';

export function MoneyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { balance: walletBalance, isReady, error, deposit } = useWallet();
  const mints = useWalletStore((state) => state.mints);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { currency } = usePreferredCurrency();

  const { listings } = useListings({});

  const tradesFilter: NDKFilter = {
    kinds: [38383 as NDKKind],
    limit: 100,
  };

  const { events: tradeEvents } = useSubscribe(
    [tradesFilter],
    { closeOnEose: false, subId: 'trades' }
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

  const balance = walletBalance || 0;

  const handleDeposit = async (amount: number, mint?: string) => {
    return await deposit(amount, mint);
  };

  const recentListings = listings.slice(0, 5);

  if (!isReady && !error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-12 h-12 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Wallet Error
          </h3>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto pb-20"
      >
        {isReady && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>Wallet Active</span>
            </div>
          </div>
        )}

        <div className="px-5 pt-8 pb-6">
          <div className="text-center">
            <div className="text-2xs uppercase tracking-wider text-neutral-500 mb-3 flex items-center justify-center gap-2">
              <span>Total Balance</span>
              <button
                onClick={() => setBalanceHidden(!balanceHidden)}
                className="p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/30 rounded-md transition-all"
              >
                {balanceHidden ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <motion.div
              key={balanceHidden ? 'hidden' : 'visible'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              {balanceHidden ? (
                <div className="text-4xl font-light text-neutral-400 dark:text-neutral-600">•••••</div>
              ) : (
                <>
                  <div className="text-5xl font-light text-neutral-900 dark:text-neutral-50 tracking-tight">
                    {balance.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">sats</div>
                </>
              )}
            </motion.div>
          </div>

          <div className="flex gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-h-[52px]"
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
              Send
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDepositModal(true)}
              className="flex-1 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-h-[52px]"
            >
              <ArrowDownLeft className="w-4 h-4" strokeWidth={2} />
              Receive
            </motion.button>
          </div>
        </div>

        <div className="px-6 pb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/money/settings')}
            className="w-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-center gap-2 transition-all"
          >
            <Settings className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Money Settings</span>
          </motion.button>
        </div>

        <div className="px-6 py-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Marketplace
              </h3>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentListings.length === 0 ? (
              <div className="w-full text-center py-8 text-sm text-neutral-500">
                No marketplace items yet
              </div>
            ) : (
              recentListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/marketplace/${listing.encode()}`)}
                  className="flex-shrink-0 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                >
                  {listing.image && (
                    <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1 truncate">
                    {listing.title}
                  </h4>
                  {listing.price && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {listing.price.amount} {listing.price.currency || 'sats'}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                P2P Trades
              </h3>
            </div>
            <button
              onClick={() => navigate('/trades')}
              className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {activeTrades.length === 0 ? (
              <div className="w-full text-center py-8 text-sm text-neutral-500">
                No active trades in {currency}
              </div>
            ) : (
              activeTrades.map((trade) => (
                <motion.div
                  key={trade.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/trades')}
                  className="flex-shrink-0 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      trade.type === 'buy'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {trade.currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {trade.satsAmount.toLocaleString()} sats
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      ≈ {trade.fiatAmount.toLocaleString()} {trade.currency.toUpperCase()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Recent Activity</h3>
          <div className="text-center py-12">
            <div className="text-sm text-neutral-500 dark:text-neutral-600">
              No transactions yet
            </div>
            <div className="text-xs text-neutral-400 dark:text-neutral-700 mt-1">
              Transactions will appear here once you start using your wallet
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl text-sm text-gray-400 hover:text-gray-300 transition-all"
          >
            View All Transactions
          </motion.button>
        </div>
      </motion.div>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        mints={mints}
      />
    </div>
  );
}