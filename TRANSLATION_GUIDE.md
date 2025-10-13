# Translation System Guide

This app uses `svelte-i18n` for multi-language support. Currently supported languages:
- English (`en`) - default
- Spanish (`es`)

## Architecture

### Files
- **`src/i18n/config.ts`** - i18n initialization and configuration
- **`src/i18n/locales/en.json`** - English translations
- **`src/i18n/locales/es.json`** - Spanish translations
- **`src/routes/+layout.svelte`** - Root layout where i18n is initialized
- **`src/lib/stores/settings.svelte.ts`** - Settings store that manages language preference
- **`src/lib/components/settings/ThemeSettings.svelte`** - Language switcher UI

## How It Works

1. **Initialization**: i18n is initialized in the root layout (`+layout.svelte`) using the user's saved language preference from the settings store
2. **Language Persistence**: Language preference is saved to `localStorage` via the settings store
3. **Reactivity**: When the user changes language in settings, the `$effect` in the layout automatically updates the i18n locale
4. **Translation Keys**: All translations are organized in nested JSON objects for better organization

## Using Translations in Components

### Import the `t` function
```svelte
<script lang="ts">
  import { t } from 'svelte-i18n';
</script>
```

### Use translation keys
```svelte
<h1>{$t('settings.title')}</h1>
<p>{$t('settings.description')}</p>
```

### Example Component
See `src/lib/components/settings/ThemeSettings.svelte` for a complete example of using translations.

## Adding New Languages

1. **Create translation file**: Add `src/i18n/locales/{lang}.json` with all translation keys
2. **Register locale**: Add to `src/i18n/config.ts`:
   ```ts
   register('fr', () => import('./locales/fr.json'));
   ```
3. **Update settings store**: Add language to union type in `src/lib/stores/settings.svelte.ts`:
   ```ts
   language: 'en' | 'es' | 'fr';
   ```
4. **Update language switcher**: Add button to `src/lib/components/settings/ThemeSettings.svelte`

## Translation Keys Structure

The translation files follow this structure:

```json
{
  "navigation": { ... },
  "auth": { ... },
  "feed": { ... },
  "settings": {
    "title": "Settings",
    "sections": {
      "appearance": {
        "title": "Appearance",
        "language": "Language",
        "theme": "Theme",
        "themes": {
          "light": "Light",
          "dark": "Dark",
          "system": "System"
        }
      }
    }
  }
}
```

## Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Use descriptive, hierarchical keys** (e.g., `settings.sections.appearance.title`)
3. **Keep translations synchronized** across all language files
4. **Test in both languages** when adding new features
5. **Use the settings store** to change language, not directly via svelte-i18n

## Language Switcher

Users can change their language preference in **Settings → Appearance**. The language preference is:
- Saved to localStorage
- Persisted across sessions
- Applied immediately without page reload
