import { useState } from 'react';
import { X, AlertTriangle, Bitcoin, Shield } from 'lucide-react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';

interface TakeOrderModalProps {
  order: {
    id: string;
    pubkey: string;
    type: 'buy' | 'sell';
    currency: string;
    status: string;
    paymentMethod: string;
    satsAmount: number;
    fiatAmount: number;
    premium?: number;
    rating?: number;
    platform?: string;
    createdAt: number;
    event: NDKEvent;
  };
  onClose: () => void;
}

export function TakeOrderModal({ order, onClose }: TakeOrderModalProps) {
  const { ndk } = useNDK();
  const profile = useProfile(order.pubkey);
  const [step, setStep] = useState<'confirm' | 'processing' | 'complete'>('confirm');
  const [accepted, setAccepted] = useState(false);

  const handleTakeOrder = async () => {
    if (!ndk) return;

    setStep('processing');

    try {
      // Create a take order event
      const event = new NDKEvent(ndk);
      event.kind = 38383;

      // Create response event with reference to original order
      event.tags = [
        ['d', `take-${order.id}-${Date.now()}`],
        ['e', order.event.id],
        ['p', order.pubkey],
        ['k', order.type === 'buy' ? 'sell' : 'buy'],
        ['f', order.currency],
        ['s', 'in-progress'],
        ['amt', order.satsAmount.toString()],
        ['fa', order.fiatAmount.toString()],
        ['pm', order.paymentMethod],
        ['y', 'Voces'],
        ['z', 'take-order']
      ];

      event.content = `Taking order ${order.id}`;

      await event.publish();

      // Update original order status (in real implementation, this would be handled by the maker)
      const statusUpdate = new NDKEvent(ndk);
      statusUpdate.kind = 38383;
      statusUpdate.tags = [
        ...order.event.tags.filter(t => t[0] !== 's'),
        ['s', 'in-progress']
      ];
      statusUpdate.content = '';

      await statusUpdate.publish();

      setStep('complete');

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to take order:', error);
      setStep('confirm');
    }
  };

  const currencySymbol = { USD: '$', EUR: '€', GBP: '£', BRL: 'R$' }[order.currency] || order.currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-black rounded-2xl max-w-md w-full">
        {step === 'confirm' && (
          <>
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Confirm Trade
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Trade Summary */}
              <div className="bg-neutral-50 dark:bg-black rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">You will {order.type === 'buy' ? 'sell' : 'buy'}</span>
                  <div className="flex items-center gap-1">
                    <Bitcoin className="w-4 h-4 text-orange-500" />
                    <span className="font-mono font-semibold">{(order.satsAmount / 100000000).toFixed(8)} BTC</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">For</span>
                  <span className="font-semibold">{currencySymbol}{order.fiatAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Via</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Trading with</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile?.name || 'Anonymous'}</span>
                    {order.rating && (
                      <span className="text-yellow-500 text-sm">★ {order.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-medium mb-1">Trade Safely</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Never release funds before confirming payment</li>
                    <li>• Use escrow when available</li>
                    <li>• Communicate only through secure channels</li>
                    <li>• Report suspicious behavior immediately</li>
                  </ul>
                </div>
              </div>

              {/* Terms Acceptance */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-orange-600 border-neutral-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  I understand the risks and agree to proceed with this P2P trade
                </span>
              </label>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTakeOrder}
                  disabled={!accepted}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Take Order
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-neutral-900 dark:text-white font-medium">Processing Trade...</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Connecting with trader
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-neutral-900 dark:text-white font-medium">Trade Initiated!</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Check your messages for next steps
            </p>
          </div>
        )}
      </div>
    </div>
  );
}