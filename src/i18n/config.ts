import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('es', () => import('./locales/es.json'));

export function initializeI18n(initialLocale?: string) {
  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale || getLocaleFromNavigator(),
  });
}
