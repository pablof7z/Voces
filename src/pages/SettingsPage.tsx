import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Server,
  Bell,
  Shield,
  Palette,
  User,
  ChevronRight,
  Settings as SettingsIcon,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RelaySettings } from '@/features/settings/RelaySettings';
import { ThemeSettings } from '@/features/settings/ThemeSettings';
import { NotificationSettings } from '@/features/settings/NotificationSettings';
import { PrivacySettings } from '@/features/settings/PrivacySettings';
import { ProfileSettings } from '@/features/settings/ProfileSettings';
import { BlossomSettings } from '@/features/settings/BlossomSettings';

type SettingsSection = 'relays' | 'theme' | 'notifications' | 'privacy' | 'profile' | 'blossom';

interface SectionConfig {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType;
  available: boolean;
}

const sectionConfigs: Omit<SectionConfig, 'label' | 'description'>[] = [
  {
    id: 'relays',
    icon: Server,
    component: RelaySettings,
    available: true,
  },
  {
    id: 'blossom',
    icon: Image,
    component: BlossomSettings,
    available: true,
  },
  {
    id: 'profile',
    icon: User,
    component: ProfileSettings,
    available: false,
  },
  {
    id: 'theme',
    icon: Palette,
    component: ThemeSettings,
    available: true,
  },
  {
    id: 'notifications',
    icon: Bell,
    component: NotificationSettings,
    available: false,
  },
  {
    id: 'privacy',
    icon: Shield,
    component: PrivacySettings,
    available: false,
  },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SettingsSection>('relays');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build sections with translations
  const sections: SectionConfig[] = sectionConfigs.map(config => ({
    ...config,
    label: t(`settings.sections.${config.id}.title`),
    description: t(`settings.sections.${config.id}.description`),
  }));

  // Handle URL tab parameter
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
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 md:gap-3">
            <SettingsIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
            {t('settings.title')}
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400">
            {t('settings.description')}
          </p>
        </motion.div>

        {/* Mobile Section Selector */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {currentSection && (
                <>
                  {React.createElement(currentSection.icon, { className: "w-5 h-5 text-purple-600" })}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {currentSection.label}
                  </span>
                </>
              )}
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 text-gray-400 transition-transform",
              mobileMenuOpen ? "rotate-90" : ""
            )} />
          </button>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-4 right-4 z-20 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (section.available) {
                        setActiveSection(section.id);
                        setMobileMenuOpen(false);
                      }
                    }}
                    disabled={!section.available}
                    className={cn(
                      'w-full px-4 py-3 flex items-center gap-3 transition-all border-b border-gray-100 dark:border-gray-700 last:border-0',
                      section.available
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-750'
                        : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {section.label}
                      {!section.available && (
                        <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {t('common.soon')}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar Navigation */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:w-64"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection;

                return (
                  <button
                    key={section.id}
                    onClick={() => section.available && setActiveSection(section.id)}
                    disabled={!section.available}
                    className={cn(
                      'w-full px-4 py-3 flex items-center gap-3 transition-all border-b border-gray-100 dark:border-gray-700 last:border-0',
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'
                        : section.available
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
                        : 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5',
                      isActive ? 'text-purple-600 dark:text-purple-400' : ''
                    )} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {section.label}
                        {!section.available && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {t('common.soon')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {section.description}
                      </div>
                    </div>
                    {section.available && (
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-transform',
                        isActive ? 'translate-x-1' : ''
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.nav>

          {/* Main Content */}
          <motion.main
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {SectionComponent && <SectionComponent />}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}