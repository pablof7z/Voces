import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import type { DepositResult } from '../../hooks/wallet/operations';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, mint?: string) => Promise<DepositResult>;
  mints: string[];
}

export function DepositModal({ isOpen, onClose, onDeposit, mints }: DepositModalProps) {
  const [amount, setAmount] = useState('100');
  const [selectedMint, setSelectedMint] = useState(mints[0]);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeposit = async () => {
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onDeposit(amountNum, selectedMint);
      setInvoice(result.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deposit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (invoice) {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setAmount('100');
    setInvoice(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Deposit Funds
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Amount (sats)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="100"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mint
              </label>
              <select
                value={selectedMint}
                onChange={(e) => setSelectedMint(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {mints.map((mint) => (
                  <option key={mint} value={mint}>
                    {mint}
                  </option>
                ))}
              </select>
            </div>

            {invoice && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-center p-6 bg-white dark:bg-neutral-950 rounded-xl">
                  <QRCodeSVG value={invoice} size={200} level="M" />
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-500 mb-2">Lightning Invoice</p>
                  <code className="block text-xs font-mono break-all text-neutral-700 dark:text-neutral-300 mb-3">
                    {invoice}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="w-full py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Copy Invoice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!invoice && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeposit}
                disabled={isLoading}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-400 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Invoice...</span>
                  </>
                ) : (
                  <span>Generate Invoice</span>
                )}
              </motion.button>
            )}
          </div>

          <p className="text-xs text-neutral-500 mt-4 text-center">
            Using testnut mint - deposits auto-confirm
          </p>
        </motion.div>
      </div>
      )}
    </Dialog>
  );
}