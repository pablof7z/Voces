import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Zap, MessageCircle, Radio, Share2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WalletSettingsPage() {
  const navigate = useNavigate();
  const [defaultZapper, setDefaultZapper] = useState<string>('');
  const [defaultReaction, setDefaultReaction] = useState<string>('👍');

  const settingsSections = [
    {
      title: 'Zapping',
      items: [
        {
          icon: Zap,
          iconColor: 'text-yellow-400',
          iconBg: 'bg-yellow-400/10',
          label: 'Default Zapper',
          description: 'Set your preferred wallet for sending zaps',
          onClick: () => {
            // Navigate to default zapper configuration
          },
        },
        {
          icon: MessageCircle,
          iconColor: 'text-blue-400',
          iconBg: 'bg-blue-400/10',
          label: 'Default Non-zapping Reaction',
          description: 'Choose your default reaction emoji',
          onClick: () => {
            // Navigate to reaction picker
          },
        },
        {
          icon: Users,
          iconColor: 'text-purple-400',
          iconBg: 'bg-purple-400/10',
          label: 'Zap Splits',
          description: 'Configure how zaps are split between recipients',
          onClick: () => {
            // Navigate to zap splits configuration
          },
        },
      ],
    },
    {
      title: 'Network',
      items: [
        {
          icon: Radio,
          iconColor: 'text-green-400',
          iconBg: 'bg-green-400/10',
          label: 'Relays for Receiving Zaps',
          description: 'Manage relays where you receive zaps',
          onClick: () => {
            // Navigate to relay management
          },
        },
        {
          icon: Share2,
          iconColor: 'text-orange-400',
          iconBg: 'bg-orange-400/10',
          label: 'Broadcasting Zaps',
          description: 'Configure how zaps are broadcast to the network',
          onClick: () => {
            // Navigate to broadcast settings
          },
        },
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/wallet')}
              className="p-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/30 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </motion.button>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Wallet Settings
            </h1>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-6 py-6 space-y-8">
          {settingsSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3 font-medium">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={itemIdx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={item.onClick}
                      className="w-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {item.label}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-600">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}