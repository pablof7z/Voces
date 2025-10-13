import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('es', () => import('./locales/es.json'));
register('fa', () => import('./locales/fa.json'));
register('km', () => import('./locales/km.json'));
register('sn', () => import('./locales/sn.json'));

export function initializeI18n(initialLocale?: string) {
  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale || getLocaleFromNavigator(),
  });
}
