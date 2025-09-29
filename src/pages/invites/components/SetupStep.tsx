import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ComponentType } from 'react';

interface SetupStepProps {
  icon: ComponentType<{ className?: string }>;
  text: string;
  delay: number;
}

export function SetupStep({ icon: Icon, text, delay }: SetupStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-850 rounded-xl"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-neutral-900 dark:text-white font-medium flex-1">
        {text}
      </p>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.3 }}
        className="ml-auto"
      >
        <Check className="w-6 h-6 text-green-500" />
      </motion.div>
    </motion.div>
  );
}