import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletBalance } from './WalletBalance';
import { MintConfiguration } from './MintConfiguration';
import { TransactionButton } from './TransactionButton';
import { QRScanner } from './QRScanner';
import { TransactionModal } from './TransactionModal';
import { Zap, History, MoreHorizontal } from 'lucide-react';

export type WalletVariant = 'minimal-light' | 'minimal-dark' | 'card-elegant' | 'gradient-modern' | 'compact';

interface WalletProps {
  variant?: WalletVariant;
}

export function Wallet({ variant = 'minimal-light' }: WalletProps) {
  const [balance] = useState(21000);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleScan = (data: string) => {
    console.log('Scanned:', data);
    // Mock: Parse lightning invoice and open send modal
    setShowSendModal(true);
  };

  const handleSend = () => {
    setShowSendModal(true);
  };

  const handleReceive = () => {
    setShowReceiveModal(true);
  };

  // Minimal Light Variant (Default)
  if (variant === 'minimal-light') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100"
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-medium text-neutral-900">Wallet</h2>
            <div className="flex items-center gap-2">
              <QRScanner onScan={handleScan} variant="minimal" />
              <MintConfiguration variant="minimal" />
            </div>
          </div>

          <WalletBalance amount={balance} variant="minimal" />

          <div className="flex gap-3 mt-6">
            <TransactionButton type="send" onClick={handleSend} variant="minimal" />
            <TransactionButton type="receive" onClick={handleReceive} variant="minimal" />
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full mt-4 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            View History
          </button>
        </motion.div>

        <TransactionModal
          type="send"
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          balance={balance}
        />
        <TransactionModal
          type="receive"
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          balance={balance}
        />
      </>
    );
  }

  // Minimal Dark Variant
  if (variant === 'minimal-dark') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-neutral-900" />
              </div>
              <h2 className="text-white font-light text-xl">Lightning Wallet</h2>
            </div>
            <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="text-5xl font-thin text-white mb-2">
              {balance.toLocaleString()}
            </div>
            <div className="text-neutral-400 text-sm">satoshis</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              className="py-4 bg-yellow-500 text-neutral-900 rounded-xl font-medium hover:bg-yellow-400 transition-colors"
            >
              Send
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReceive}
              className="py-4 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors"
            >
              Receive
            </motion.button>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-neutral-400 hover:text-neutral-300 text-sm"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
            <button className="text-neutral-400 hover:text-neutral-300 text-sm">
              Settings
            </button>
          </div>
        </motion.div>

        <TransactionModal
          type="send"
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          balance={balance}
          variant="dark"
        />
        <TransactionModal
          type="receive"
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          balance={balance}
          variant="dark"
        />
      </>
    );
  }

  // Card Elegant Variant
  if (variant === 'card-elegant') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="max-w-md mx-auto"
        >
          <motion.div
            className="bg-gradient-to-br from-white to-neutral-50 rounded-3xl p-8 shadow-xl border border-neutral-100"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">NIP-60 Wallet</h2>
                  <p className="text-xs text-neutral-500">Lightning Network</p>
                </div>
              </div>
            </div>

            <WalletBalance amount={balance} variant="detailed" showChange changeAmount={2500} />

            <div className="mt-8 space-y-4">
              <MintConfiguration variant="detailed" />
              <QRScanner onScan={handleScan} variant="detailed" />
            </div>

            <div className="flex gap-4 mt-8">
              <TransactionButton type="send" onClick={handleSend} variant="detailed" />
              <TransactionButton type="receive" onClick={handleReceive} variant="detailed" />
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Transaction History</span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        <TransactionModal
          type="send"
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          balance={balance}
        />
        <TransactionModal
          type="receive"
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          balance={balance}
        />
      </>
    );
  }

  // Gradient Modern Variant
  if (variant === 'gradient-modern') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-500 to-orange-500">
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-orange-600/30 to-red-600/30"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          <div className="relative backdrop-blur-sm bg-white/10 p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-block"
              >
                <div className="text-6xl font-bold text-white mb-2">
                  {balance.toLocaleString()}
                </div>
                <div className="text-white/80 text-sm uppercase tracking-wide">Satoshis</div>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="bg-white/20 backdrop-blur-md text-white p-4 rounded-2xl hover:bg-white/30 transition-all"
              >
                <Zap className="w-6 h-6 mx-auto mb-2" />
                <div className="text-xs">Zap</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="bg-white/20 backdrop-blur-md text-white p-4 rounded-2xl hover:bg-white/30 transition-all"
              >
                <History className="w-6 h-6 mx-auto mb-2" />
                <div className="text-xs">History</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {}}
                className="bg-white/20 backdrop-blur-md text-white p-4 rounded-2xl hover:bg-white/30 transition-all"
              >
                <MoreHorizontal className="w-6 h-6 mx-auto mb-2" />
                <div className="text-xs">More</div>
              </motion.button>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                className="flex-1 py-4 bg-white text-orange-600 rounded-2xl font-semibold hover:bg-white/90 transition-all"
              >
                Send
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReceive}
                className="flex-1 py-4 bg-white/20 backdrop-blur-md text-white rounded-2xl font-semibold hover:bg-white/30 transition-all"
              >
                Receive
              </motion.button>
            </div>
          </div>
        </motion.div>

        <TransactionModal
          type="send"
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          balance={balance}
          variant="gradient"
        />
        <TransactionModal
          type="receive"
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          balance={balance}
          variant="gradient"
        />
      </>
    );
  }

  // Compact Variant
  if (variant === 'compact') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
        >
          <div className="flex items-center justify-between">
            <WalletBalance amount={balance} variant="compact" />
            <div className="flex gap-2">
              <TransactionButton type="send" onClick={handleSend} variant="icon" />
              <TransactionButton type="receive" onClick={handleReceive} variant="icon" />
            </div>
          </div>
        </motion.div>

        <TransactionModal
          type="send"
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          balance={balance}
        />
        <TransactionModal
          type="receive"
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          balance={balance}
        />
      </>
    );
  }

  return null;
}