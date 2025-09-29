import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Clipboard, QrCode } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  variant?: 'minimal' | 'detailed' | 'modal';
}

export function QRScanner({ onScan, variant = 'minimal' }: QRScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [showPasteInput, setShowPasteInput] = useState(false);

  const handlePaste = () => {
    if (pasteValue) {
      onScan(pasteValue);
      setPasteValue('');
      setShowPasteInput(false);
      setIsOpen(false);
    }
  };

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onScan(text);
        setIsOpen(false);
      }
    } catch (_err) {
      setShowPasteInput(true);
    }
  };

  if (variant === 'modal') {
    return (
      <>
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
        >
          <QrCode className="w-5 h-5" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-neutral-900">Scan or Paste</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-neutral-100 rounded-2xl p-8 flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 text-neutral-400 mb-3" />
                    <p className="text-sm text-neutral-600 text-center">
                      Camera access needed for QR scanning
                    </p>
                    <button className="mt-4 text-sm text-orange-600 hover:text-orange-700">
                      Enable Camera
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-neutral-500">or</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleQuickPaste}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                      <Clipboard className="w-4 h-4 text-neutral-600" />
                      <span className="text-neutral-700">Paste from Clipboard</span>
                    </button>

                    <AnimatePresence>
                      {showPasteInput && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <input
                            type="text"
                            value={pasteValue}
                            onChange={(e) => setPasteValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePaste()}
                            placeholder="Paste invoice here..."
                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-orange-500"
                            autoFocus
                          />
                          <button
                            onClick={handlePaste}
                            disabled={!pasteValue}
                            className="w-full mt-3 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Process Invoice
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setShowPasteInput(!showPasteInput)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all"
        >
          <div className="flex items-center gap-3">
            <QrCode className="w-5 h-5 text-orange-600" />
            <span className="text-neutral-700 font-medium">Scan QR Code</span>
          </div>
          <span className="text-xs text-neutral-500">Tap to paste</span>
        </button>

        <AnimatePresence>
          {showPasteInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pasteValue}
                  onChange={(e) => setPasteValue(e.target.value)}
                  placeholder="Paste Lightning invoice..."
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={handlePaste}
                  disabled={!pasteValue}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  Pay
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Minimal variant (default)
  return (
    <div className="relative">
      <button
        onClick={() => setShowPasteInput(!showPasteInput)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
      >
        <Camera className="w-4 h-4" />
        <span>Scan</span>
      </button>

      <AnimatePresence>
        {showPasteInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-neutral-200 z-10"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePaste()}
                placeholder="Paste invoice"
                className="px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handlePaste}
                disabled={!pasteValue}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Pay
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}