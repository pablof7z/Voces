import { AGORA_RELAYS } from '$lib/utils/relayUtils';

export interface Relay {
  url: string;
  read: boolean;
  write: boolean;
  enabled: boolean;
}

interface AppSettings {
  relays: Relay[];
  selectedRelay: string | null;
  theme: 'light' | 'dark' | 'system';
  themeColor: 'red' | 'cyan' | 'yellow' | 'lime';
  language: 'en' | 'es';
  notifications: {
    enabled: boolean;
    mentions: boolean;
    replies: boolean;
    zaps: boolean;
  };
  privacy: {
    hideReadReceipts: boolean;
    hideTypingIndicator: boolean;
  };
  zap: {
    defaultAmount: number;
  };
}

const DEFAULT_RELAYS: Relay[] = [
  ...AGORA_RELAYS.map(url => ({ url, read: true, write: true, enabled: true })),
  { url: 'wss://relay.damus.io', read: true, write: true, enabled: true },
  { url: 'wss://nos.lol', read: true, write: true, enabled: true },
  { url: 'wss://relay.primal.net', read: true, write: true, enabled: true },
];

const DEFAULT_SETTINGS: AppSettings = {
  relays: DEFAULT_RELAYS,
  selectedRelay: 'agoras',
  theme: 'system',
  themeColor: 'red',
  language: 'en',
  notifications: {
    enabled: true,
    mentions: true,
    replies: true,
    zaps: true,
  },
  privacy: {
    hideReadReceipts: false,
    hideTypingIndicator: false,
  },
  zap: {
    defaultAmount: 21,
  },
};

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem('voces-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Clean up malformed relay URLs (wss://ws:// or wss://wss://)
      if (parsed.relays) {
        parsed.relays = parsed.relays.map((r: Relay) => ({
          ...r,
          url: r.url.replace(/^wss:\/\/ws:\/\//, 'ws://').replace(/^wss:\/\/wss:\/\//, 'wss://')
        }));
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }

  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('voces-settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

class SettingsStore {
  private state = $state<AppSettings>(loadSettings());

  get relays() {
    return this.state.relays;
  }

  get selectedRelay() {
    return this.state.selectedRelay;
  }

  get theme() {
    return this.state.theme;
  }

  get themeColor() {
    return this.state.themeColor;
  }

  get language() {
    return this.state.language;
  }

  get notifications() {
    return this.state.notifications;
  }

  get privacy() {
    return this.state.privacy;
  }

  get zap() {
    return this.state.zap;
  }

  addRelay(relay: Relay) {
    this.state.relays = [...this.state.relays, relay];
    saveSettings(this.state);
  }

  removeRelay(url: string) {
    this.state.relays = this.state.relays.filter((r) => r.url !== url);
    saveSettings(this.state);
  }

  updateRelay(url: string, updates: Partial<Relay>) {
    this.state.relays = this.state.relays.map((r) =>
      r.url === url ? { ...r, ...updates } : r
    );
    saveSettings(this.state);
  }

  toggleRelay(url: string) {
    this.state.relays = this.state.relays.map((r) =>
      r.url === url ? { ...r, enabled: !r.enabled } : r
    );
    saveSettings(this.state);
  }

  setRelays(relays: Relay[]) {
    this.state.relays = relays;
    saveSettings(this.state);
  }

  setSelectedRelay(url: string | null) {
    this.state.selectedRelay = url;
    saveSettings(this.state);
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.state.theme = theme;
    saveSettings(this.state);

    if (typeof window !== 'undefined') {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  setThemeColor(color: 'red' | 'cyan' | 'yellow' | 'lime') {
    this.state.themeColor = color;
    saveSettings(this.state);

    if (typeof window !== 'undefined') {
      const colorMapHSL = {
        red: '342 87% 48%',
        cyan: '189 100% 41%',
        yellow: '52 100% 50%',
        lime: '74 85% 40%'
      };
      const colorMapDarkHSL = {
        red: '342 87% 42%',
        cyan: '189 100% 35%',
        yellow: '52 100% 44%',
        lime: '74 85% 34%'
      };
      document.documentElement.style.setProperty('--theme-color-hsl', colorMapHSL[color]);
      document.documentElement.style.setProperty('--theme-color-dark-hsl', colorMapDarkHSL[color]);
    }
  }

  setLanguage(language: 'en' | 'es') {
    this.state.language = language;
    saveSettings(this.state);
  }

  updateNotifications(settings: Partial<AppSettings['notifications']>) {
    this.state.notifications = { ...this.state.notifications, ...settings };
    saveSettings(this.state);
  }

  updatePrivacy(settings: Partial<AppSettings['privacy']>) {
    this.state.privacy = { ...this.state.privacy, ...settings };
    saveSettings(this.state);
  }

  updateZap(settings: Partial<AppSettings['zap']>) {
    this.state.zap = { ...this.state.zap, ...settings };
    saveSettings(this.state);
  }

  resetToDefaults() {
    this.state = { ...DEFAULT_SETTINGS };
    saveSettings(this.state);
  }
}

export const settings = new SettingsStore();
