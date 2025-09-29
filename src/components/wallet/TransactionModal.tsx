import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Zap, QrCode, Loader2 } from 'lucide-react';

interface TransactionModalProps {
  type: 'send' | 'receive';
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  variant?: 'light' | 'dark' | 'gradient';
}

export function TransactionModal({
  type,
  isOpen,
  onClose,
  balance,
  variant = 'light'
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [invoice, setInvoice] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSend = type === 'send';

  const handleCopy = () => {
    // Mock invoice
    const mockInvoice = 'lnbc21000n1pj9xyz...mockInvoice';
    navigator.clipboard.writeText(mockInvoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    setIsProcessing(true);
    // Mock transaction
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const getModalStyles = () => {
    switch (variant) {
      case 'dark':
        return 'bg-black text-white';
      case 'gradient':
        return 'bg-gradient-to-br from-purple-600 to-pink-600 text-white';
      default:
        return 'bg-white';
    }
  };

  const getInputStyles = () => {
    switch (variant) {
      case 'dark':
        return 'bg-gray-800 border-gray-700 text-white placeholder-gray-400';
      case 'gradient':
        return 'bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm';
      default:
        return 'bg-white border-gray-200 text-gray-900';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`rounded-3xl p-6 max-w-md w-full shadow-2xl ${getModalStyles()}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {isSend ? 'Send Payment' : 'Receive Payment'}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  variant === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {isSend ? (
              <div className="space-y-4">
                <div>
                  <label className={`text-sm ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                    Invoice
                  </label>
                  <textarea
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                    placeholder="Paste Lightning invoice or LNURL..."
                    className={`w-full p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${getInputStyles()}`}
                    rows={3}
                  />
                </div>

                <div className="text-center py-2">
                  <span className={`text-sm ${variant === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
                </div>

                <div>
                  <label className={`text-sm ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                    Amount (sats)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${getInputStyles()}`}
                  />
                  <div className={`text-xs mt-1 ${variant === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Available: {balance.toLocaleString()} sats
                  </div>
                </div>

                <div>
                  <label className={`text-sm ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Coffee tip"
                    className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${getInputStyles()}`}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!invoice && !amount}
                  className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    variant === 'gradient'
                      ? 'bg-white text-purple-600 hover:bg-white/90'
                      : variant === 'dark'
                      ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                      : 'bg-black text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Send Payment</span>
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`text-sm ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                    Amount (sats)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${getInputStyles()}`}
                  />
                </div>

                <div>
                  <label className={`text-sm ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this payment for?"
                    className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${getInputStyles()}`}
                  />
                </div>

                {amount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className={`p-4 rounded-xl ${
                      variant === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-8 bg-white rounded-2xl">
                          <QrCode className="w-32 h-32 text-gray-900" />
                        </div>
                      </div>
                      <div className={`text-xs ${
                        variant === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      } text-center break-all`}>
                        lnbc{amount}n1pj9xyz...mockInvoice
                      </div>
                    </div>

                    <button
                      onClick={handleCopy}
                      className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        variant === 'gradient'
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : variant === 'dark'
                          ? 'bg-gray-800 text-white hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Invoice</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {!amount && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAmount('1000')}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      variant === 'gradient'
                        ? 'bg-white text-purple-600 hover:bg-white/90'
                        : variant === 'dark'
                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    Generate Invoice
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}