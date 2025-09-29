import { motion } from 'framer-motion';
import { Send, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionButtonProps {
  type: 'send' | 'receive';
  onClick: () => void;
  variant?: 'minimal' | 'detailed' | 'icon';
  disabled?: boolean;
}

export function TransactionButton({ 
  type, 
  onClick, 
  variant = 'minimal',
  disabled = false 
}: TransactionButtonProps) {
  const isSend = type === 'send';
  
  const icons = {
    minimal: isSend ? <Send className="w-4 h-4" /> : <Download className="w-4 h-4" />,
    detailed: isSend ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />,
    icon: isSend ? <Send className="w-5 h-5" /> : <Download className="w-5 h-5" />
  };

  const labels = {
    send: 'Send',
    receive: 'Receive'
  };

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          p-3 rounded-full transition-all
          ${isSend 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-neutral-100 hover:bg-neutral-200 text-gray-700'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {icons[variant]}
      </motion.button>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex flex-col items-center justify-center p-6 rounded-2xl transition-all w-full
          ${isSend 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20' 
            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <motion.div
          initial={{ rotate: 0 }}
          whileHover={{ rotate: isSend ? -45 : 45 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icons[variant]}
        </motion.div>
        <span className="mt-2 text-sm font-medium">{labels[type]}</span>
      </motion.button>
    );
  }

  // Minimal variant (default)
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${isSend 
          ? 'bg-black hover:bg-neutral-950 text-white' 
          : 'bg-white hover:bg-neutral-50 text-gray-900 border border-gray-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {icons[variant]}
      <span>{labels[type]}</span>
    </motion.button>
  );
}