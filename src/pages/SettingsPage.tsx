import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Server,
  Bell,
  Shield,
  Palette,
  User,
  ChevronRight,
  ArrowLeft,
  Image,
  Key,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RelaySettings } from '@/features/settings/RelaySettings';
import { ThemeSettings } from '@/features/settings/ThemeSettings';
import { NotificationSettings } from '@/features/settings/NotificationSettings';
import { PrivacySettings } from '@/features/settings/PrivacySettings';
import { ProfileSettings } from '@/features/settings/ProfileSettings';
import { BlossomSettings } from '@/features/settings/BlossomSettings';
import { BackupKeySettings } from '@/features/backup/BackupKeySettings';
import { WoTSettings } from '@/features/settings/WoTSettings';
import { AUTH_STORAGE_KEYS } from '@/config/auth';

type SettingsSection = 'relays' | 'theme' | 'notifications' | 'privacy' | 'profile' | 'blossom' | 'backup' | 'wot' | null;

interface SectionConfig {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  component: React.ComponentType;
  available: boolean;
}

const sectionConfigs: Omit<SectionConfig, 'label' | 'description'>[] = [
  {
    id: 'relays',
    icon: Server,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/10',
    component: RelaySettings,
    available: true,
  },
  {
    id: 'wot',
    icon: Network,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-400/10',
    component: WoTSettings,
    available: true,
  },
  {
    id: 'blossom',
    icon: Image,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
    component: BlossomSettings,
    available: true,
  },
  {
    id: 'backup',
    icon: Key,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10',
    component: BackupKeySettings,
    available: true,
  },
  {
    id: 'theme',
    icon: Palette,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10',
    component: ThemeSettings,
    available: true,
  },
  {
    id: 'profile',
    icon: User,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-400/10',
    component: ProfileSettings,
    available: false,
  },
  {
    id: 'notifications',
    icon: Bell,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-400/10',
    component: NotificationSettings,
    available: false,
  },
  {
    id: 'privacy',
    icon: Shield,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-400/10',
    component: PrivacySettings,
    available: false,
  },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SettingsSection>(null);

  const hasPrivateKey = !!localStorage.getItem(AUTH_STORAGE_KEYS.PRIVATE_KEY);

  const sections: SectionConfig[] = sectionConfigs.map(config => ({
    ...config,
    label: t(`settings.sections.${config.id}.title`),
    description: t(`settings.sections.${config.id}.description`),
    available: config.id === 'backup' ? hasPrivateKey : config.available,
  }));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && sections.some(s => s.id === tab && s.available)) {
      setActiveSection(tab as SettingsSection);
    }
  }, [location.search, sections]);

  const currentSection = sections.find(s => s.id === activeSection);
  const SectionComponent = currentSection?.component;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSection(null)}
                    className="p-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/30 rounded-lg transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                  </motion.button>
                  <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {currentSection?.label}
                  </h1>
                </div>
              </div>

              <div className="px-6 py-6">
                {SectionComponent && <SectionComponent />}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="px-6 pt-6 pb-4">
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('settings.title')}
                </h1>
              </div>

              <div className="px-6 py-6 space-y-6">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id}>
                      <div className="space-y-2">
                        <motion.button
                          whileHover={section.available ? { scale: 1.01 } : {}}
                          whileTap={section.available ? { scale: 0.99 } : {}}
                          onClick={() => section.available && setActiveSection(section.id)}
                          disabled={!section.available}
                          className={cn(
                            'w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between transition-all',
                            section.available
                              ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', section.iconBg)}>
                              <Icon className={cn('w-5 h-5', section.iconColor)} />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                {section.label}
                                {!section.available && (
                                  <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                    {t('common.soon')}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-600">
                                {section.description}
                              </div>
                            </div>
                          </div>
                          {section.available && (
                            <ChevronRight className="w-4 h-4 text-neutral-400" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}