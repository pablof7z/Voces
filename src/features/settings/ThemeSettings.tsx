import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/settingsStore';
import { Globe, Palette } from 'lucide-react';

export function ThemeSettings() {
  const { t, i18n } = useTranslation();
  const { language, theme, setLanguage, setTheme } = useSettingsStore();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleLanguageChange = (newLanguage: 'en' | 'es') => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);

    // Apply theme to document
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          {t('settings.sections.appearance.title')}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          {t('settings.sections.appearance.description')}
        </p>
      </div>

      {/* Language Selection */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {t('settings.sections.appearance.language')}
          </h3>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {t('settings.sections.appearance.languageDescription')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-3 rounded-lg border transition-all ${
              language === 'en'
                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
                : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🇺🇸</span>
              <span className="font-medium">English</span>
            </div>
          </button>
          <button
            onClick={() => handleLanguageChange('es')}
            className={`px-4 py-3 rounded-lg border transition-all ${
              language === 'es'
                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
                : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🇪🇸</span>
              <span className="font-medium">Español</span>
            </div>
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {t('settings.sections.appearance.theme')}
          </h3>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {t('settings.sections.appearance.themeDescription')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`px-4 py-3 rounded-lg border transition-all ${
              theme === 'light'
                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
                : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">☀️</span>
              <span className="text-sm font-medium">
                {t('settings.sections.appearance.themes.light')}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`px-4 py-3 rounded-lg border transition-all ${
              theme === 'dark'
                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
                : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🌙</span>
              <span className="text-sm font-medium">
                {t('settings.sections.appearance.themes.dark')}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleThemeChange('system')}
            className={`px-4 py-3 rounded-lg border transition-all ${
              theme === 'system'
                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
                : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">💻</span>
              <span className="text-sm font-medium">
                {t('settings.sections.appearance.themes.system')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}