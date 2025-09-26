import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WalletBalanceBadge() {
  const [balance] = useState(21000);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/wallet');
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-full border border-yellow-200 dark:border-yellow-800/50 transition-all hover:shadow-md"
    >
      <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
        <Zap className="w-3 h-3 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {balance.toLocaleString()}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">sats</span>
    </motion.button>
  );
}