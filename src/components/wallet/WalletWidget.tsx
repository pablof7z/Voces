import { motion } from 'framer-motion';
import { Zap, Send, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';

export function WalletWidget() {
  const { t } = useTranslation();
  const { balance } = useWallet();

  return (
    <Link to="/money">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('navigation.money')}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-light text-neutral-900 dark:text-neutral-100">
            {balance.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{t('wallet.satsAvailable')}</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Quick send action
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white dark:bg-black rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <Send className="w-3 h-3" />
            {t('wallet.send')}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Quick receive action
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white dark:bg-black rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <Download className="w-3 h-3" />
            {t('wallet.receive')}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}