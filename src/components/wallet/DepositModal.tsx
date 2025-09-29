import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
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
      <DialogContent className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-700">
          {!invoice && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Deposit Funds
              </h2>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {!invoice && (
              <>
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
              </>
            )}

            {invoice && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Ready to deposit {amount} sats
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Scan with any Lightning wallet
                  </p>
                </div>

                <div className="flex items-center justify-center py-6">
                  <div className="p-5 bg-white rounded-xl shadow-sm">
                    <QRCodeSVG value={invoice} size={280} level="H" />
                  </div>
                </div>

                <div className="flex gap-2 px-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
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
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="px-5 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium transition-all text-sm"
                  >
                    Done
                  </motion.button>
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
      </DialogContent>
    </Dialog>
  );
}