import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Settings
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useWalletStore } from '../../stores/walletStore';
import { DepositModal } from './DepositModal';
import { useNavigate } from 'react-router-dom';

export function ProfessionalWallet() {
  const { balance: walletBalance, isReady, error, deposit, p2pk } = useWallet();
  const mints = useWalletStore((state) => state.mints);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const navigate = useNavigate();
  
  const balance = walletBalance || 0;
  
  const handleDeposit = async (amount: number, mint?: string) => {
    await deposit(amount, mint);
  };

  // Show loading state
  if (!isReady && !error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Initializing wallet...</p>
          {p2pk && (
            <p className="text-xs text-neutral-600 mt-2 font-mono">P2PK: {p2pk.substring(0, 16)}...</p>
          )}
        </div>
      </div>
    );
  }

  // Show error state
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
        className="max-w-lg mx-auto"
      >
        {/* Wallet Status Indicator */}
        {isReady && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>Wallet Active</span>
            </div>
          </div>
        )}
        
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
              onClick={() => setShowDepositModal(true)}
              className="flex-1 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-h-[52px]"
            >
              <ArrowDownLeft className="w-4 h-4" strokeWidth={2} />
              Receive
            </motion.button>
          </div>
        </div>

        {/* Wallet Settings Button */}
        <div className="px-6 pb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/money/settings')}
            className="w-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-center gap-2 transition-all"
          >
            <Settings className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Wallet Settings</span>
          </motion.button>
        </div>

        {/* Recent Activity */}
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

        {/* Footer */}
        <div className="px-6 pb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-neutral-800/50 hover:bg-neutral-800 border border-gray-700/50 rounded-xl text-sm text-gray-400 hover:text-gray-300 transition-all"
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