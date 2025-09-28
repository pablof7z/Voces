import { Check, Copy, Share2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_DELAYS } from '@/features/invites/constants';

interface GeneratedLinkProps {
  url: string;
}

export function GeneratedLink({ url }: GeneratedLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), ANIMATION_DELAYS.COPY_TOAST);
    });
  }, [url]);

  return (
    <div className="mt-6 text-center">
      <h3 className="font-semibold text-gray-700 mb-2">Your Invite is Ready!</h3>
      <div className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-between">
        <span className="text-purple-600 font-mono text-sm truncate pr-16">{url}</span>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
          aria-label="Copy invite link"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={copied ? 'check' : 'copy'}
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              {copied ? <Check className="text-green-500" size={20} /> : <Copy className="text-gray-500" size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
      <div className="mt-4">
        <button className="bg-purple-600 text-white font-bold py-2 px-4 rounded-full w-full max-w-xs mx-auto flex items-center justify-center gap-2 hover:bg-purple-700 transition-all transform hover:scale-105">
          <Share2 size={18} />
          Share Invite
        </button>
      </div>
    </div>
  );
}