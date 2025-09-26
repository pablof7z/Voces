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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('settings.sections.appearance.title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t('settings.sections.appearance.description')}
        </p>
      </div>

      {/* Language Selection */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t('settings.sections.appearance.language')}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('settings.sections.appearance.languageDescription')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-3 rounded-lg border transition-all ${
              language === 'en'
                ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-700 dark:text-purple-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
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
                ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-700 dark:text-purple-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
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
          <Palette className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t('settings.sections.appearance.theme')}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('settings.sections.appearance.themeDescription')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`px-4 py-3 rounded-lg border transition-all ${
              theme === 'light'
                ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-700 dark:text-purple-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
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
                ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-700 dark:text-purple-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
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
                ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-700 dark:text-purple-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
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