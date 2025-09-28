import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseButton } from '@/components/invites/CloseButton';
import { ModalHeader } from '@/components/invites/ModalHeader';

const InviteVariation1 = React.lazy(() => import('./variations/InviteVariation1'));
const InviteVariation2 = React.lazy(() => import('./variations/InviteVariation2'));
const InviteVariation3 = React.lazy(() => import('./variations/InviteVariation3'));
const InviteVariation4 = React.lazy(() => import('./variations/InviteVariation4'));

const variations = [
  { id: 1, name: 'Minimalist', component: InviteVariation1 },
  { id: 2, name: 'Wizard', component: InviteVariation2 },
  { id: 3, name: 'Modern', component: InviteVariation3 },
  { id: 4, name: 'Story', component: InviteVariation4 },
];

interface CreateInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateInviteModal({ isOpen, onClose }: CreateInviteModalProps) {
  const [activeVariation, setActiveVariation] = useState(1);

  const ActiveComponent = variations.find(v => v.id === activeVariation)?.component;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-lg relative p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose} />
            <ModalHeader title="Create a New Invite" subtitle="Choose a style that fits your vibe." />

            <div className="flex justify-center space-x-2 mb-6 border-b dark:border-gray-800 pb-4">
              {variations.map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveVariation(v.id)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                    activeVariation === v.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  {v.name}
                </button>
              ))}
            </div>

            <React.Suspense fallback={<div className='text-center p-8 text-gray-900 dark:text-white'>Loading...</div>}>
              {ActiveComponent && <ActiveComponent />}
            </React.Suspense>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}