import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WalletWidget() {
  const [balance] = useState(21000);

  return (
    <Link to="/wallet">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-light text-gray-900 dark:text-gray-100">
            {balance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">sats available</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Quick send action
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Send className="w-3 h-3" />
            Send
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Quick receive action
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-3 h-3" />
            Receive
          </button>
        </div>
      </motion.div>
    </Link>
  );
}