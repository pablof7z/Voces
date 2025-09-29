import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, XCircle } from 'lucide-react';
import { Wallet } from './Wallet';

/**
 * Example integration showing how to use the Wallet component
 * with mock NIP-60 functionality for zapping
 */
export function WalletIntegration() {
  const [zapHistory, setZapHistory] = useState<Array<{
    id: string;
    amount: number;
    recipient: string;
    timestamp: Date;
    status: 'success' | 'failed';
  }>>([]);

  // Mock function to handle zap sending
  const handleZap = (recipient: string, amount: number) => {
    const newZap = {
      id: Date.now().toString(),
      amount,
      recipient,
      timestamp: new Date(),
      status: 'success' as const
    };
    
    setZapHistory(prev => [newZap, ...prev]);
    
    // Here you would integrate with actual NIP-60 implementation
    console.log('Zap sent:', { recipient, amount });
  };

  return (
    <div className="space-y-6">
      {/* Main Wallet Component */}
      <Wallet variant="minimal-light" />

      {/* Example Zap Interface */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Zap</h3>
        
        <div className="space-y-4">
          {/* Quick Zap Buttons */}
          <div className="flex gap-2">
            {[100, 500, 1000, 5000].map(amount => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleZap('npub1...example', amount)}
                className="flex-1 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-sm font-medium text-neutral-700 transition-colors"
              >
                <Zap className="w-4 h-4 inline mr-1" />
                {amount}
              </motion.button>
            ))}
          </div>

          {/* Recent Zaps */}
          {zapHistory.length > 0 && (
            <div className="space-y-2 mt-6">
              <h4 className="text-sm font-medium text-neutral-600">Recent Zaps</h4>
              {zapHistory.slice(0, 3).map(zap => (
                <motion.div
                  key={zap.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {zap.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-neutral-700">
                        {zap.amount} sats
                      </div>
                      <div className="text-xs text-neutral-500">
                        {zap.recipient.slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {zap.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Integration Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">NIP-60 Integration</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Connect to Cashu mints using NIP-60 protocol</li>
          <li>• Generate Lightning invoices for receiving</li>
          <li>• Scan QR codes or paste invoices for sending</li>
          <li>• Track balance across multiple mints</li>
          <li>• Mock functionality ready for real implementation</li>
        </ul>
      </div>
    </div>
  );
}