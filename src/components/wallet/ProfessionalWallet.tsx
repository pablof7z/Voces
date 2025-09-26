import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Coffee,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  Activity,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'zap';
  description: string;
  amount: number;
  timestamp: string;
  icon?: 'zap' | 'coffee' | 'default';
  to?: string;
  from?: string;
  status?: 'pending' | 'completed';
}

export function ProfessionalWallet() {
  const [balance] = useState(21000);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [dailyChange] = useState(2500);
  const [selectedTab, setSelectedTab] = useState<'activity' | 'stats'>('activity');

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'zap',
      description: 'Zapped @jack',
      amount: -100,
      timestamp: '1h ago',
      icon: 'zap',
      to: 'jack',
      status: 'completed'
    },
    {
      id: '2',
      type: 'received',
      description: 'Payment received',
      amount: 500,
      timestamp: '2h ago',
      from: 'anon',
      status: 'completed'
    },
    {
      id: '3',
      type: 'sent',
      description: 'Coffee payment',
      amount: -250,
      timestamp: '3h ago',
      icon: 'coffee',
      to: 'Blue Bottle Coffee',
      status: 'completed'
    },
    {
      id: '4',
      type: 'zap',
      description: 'Zapped @fiatjaf',
      amount: -1000,
      timestamp: '1d ago',
      icon: 'zap',
      to: 'fiatjaf',
      status: 'completed'
    }
  ];

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.icon === 'zap') {
      return <Zap className="w-5 h-5" />;
    }
    if (transaction.icon === 'coffee') {
      return <Coffee className="w-5 h-5" />;
    }
    if (transaction.type === 'sent') {
      return <ArrowUpRight className="w-5 h-5" />;
    }
    return <ArrowDownLeft className="w-5 h-5" />;
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.type === 'received') {
      return 'text-emerald-400';
    }
    if (transaction.type === 'zap') {
      return 'text-purple-400';
    }
    return 'text-orange-400';
  };

  const getIconBgColor = (transaction: Transaction) => {
    if (transaction.type === 'received') {
      return 'bg-emerald-400/10 border-emerald-400/20';
    }
    if (transaction.type === 'zap') {
      return 'bg-purple-400/10 border-purple-400/20';
    }
    return 'bg-orange-400/10 border-orange-400/20';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        {/* Balance Section */}
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
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              dailyChange >= 0
                ? 'bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400'
                : 'bg-danger-50 text-danger-700 dark:bg-danger-950/30 dark:text-danger-400'
            }`}>
              {dailyChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{dailyChange >= 0 ? '+' : ''}{dailyChange.toLocaleString()} today</span>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="flex-1 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-h-[52px]"
            >
              <ArrowDownLeft className="w-4 h-4" strokeWidth={2} />
              Receive
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl p-3 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-sm text-gray-300">Mint</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl p-3 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-gray-300">Backup</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-1 p-1 bg-gray-800/30 rounded-xl">
            <button
              onClick={() => setSelectedTab('activity')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'activity'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setSelectedTab('stats')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'stats'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-6 py-4">
          <AnimatePresence mode="wait">
            {selectedTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getIconBgColor(transaction)}`}>
                        <div className={getTransactionColor(transaction)}>
                          {getTransactionIcon(transaction)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">
                          {transaction.description}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{transaction.timestamp}</span>
                          {transaction.status === 'pending' && (
                            <span className="px-1.5 py-0.5 bg-yellow-400/10 text-yellow-400 rounded text-xs">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        transaction.amount > 0 ? 'text-emerald-400' : 'text-gray-300'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString()} sats
                      </div>
                      <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        View details
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {selectedTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1">Total Sent</div>
                    <div className="text-lg font-semibold text-orange-400">1,350 sats</div>
                    <div className="text-xs text-gray-500 mt-1">4 transactions</div>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1">Total Received</div>
                    <div className="text-lg font-semibold text-emerald-400">3,850 sats</div>
                    <div className="text-xs text-gray-500 mt-1">8 transactions</div>
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-500">Weekly Activity</div>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 65, 30, 80, 45, 90, 70].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Mon</span>
                    <span>Sun</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
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
    </div>
  );
}