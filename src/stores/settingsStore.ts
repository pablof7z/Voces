import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Relay {
  url: string;
  read: boolean;
  write: boolean;
  enabled: boolean;
}

interface AppSettings {
  // Relay settings
  relays: Relay[];
  selectedRelay: string | null; // null means use all enabled relays

  // Theme settings (for future)
  theme: 'light' | 'dark' | 'system';

  // Language settings
  language: 'en' | 'es';

  // Notification settings (for future)
  notifications: {
    enabled: boolean;
    mentions: boolean;
    replies: boolean;
    zaps: boolean;
  };

  // Privacy settings (for future)
  privacy: {
    hideReadReceipts: boolean;
    hideTypingIndicator: boolean;
  };
}

interface SettingsStore extends AppSettings {
  // Relay actions
  addRelay: (relay: Relay) => void;
  removeRelay: (url: string) => void;
  updateRelay: (url: string, updates: Partial<Relay>) => void;
  toggleRelay: (url: string) => void;
  setRelays: (relays: Relay[]) => void;
  setSelectedRelay: (url: string | null) => void;

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Language actions
  setLanguage: (language: 'en' | 'es') => void;

  // Notification actions
  updateNotifications: (settings: Partial<AppSettings['notifications']>) => void;

  // Privacy actions
  updatePrivacy: (settings: Partial<AppSettings['privacy']>) => void;

  // General actions
  resetToDefaults: () => void;
}

const defaultRelays: Relay[] = [
  { url: 'wss://relay.damus.io', read: true, write: true, enabled: true },
  { url: 'wss://relay.nostr.band', read: true, write: false, enabled: true },
  { url: 'wss://nos.lol', read: true, write: true, enabled: true },
  { url: 'wss://relay.snort.social', read: true, write: true, enabled: true },
  { url: 'wss://relay.primal.net', read: true, write: true, enabled: true },
];

const defaultSettings: AppSettings = {
  relays: defaultRelays,
  selectedRelay: null,
  theme: 'system',
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
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      // Relay actions
      addRelay: (relay) =>
        set((state) => ({
          relays: [...state.relays, relay],
        })),

      removeRelay: (url) =>
        set((state) => ({
          relays: state.relays.filter((r) => r.url !== url),
        })),

      updateRelay: (url, updates) =>
        set((state) => ({
          relays: state.relays.map((r) =>
            r.url === url ? { ...r, ...updates } : r
          ),
        })),

      toggleRelay: (url) =>
        set((state) => ({
          relays: state.relays.map((r) =>
            r.url === url ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      setRelays: (relays) => set({ relays }),

      setSelectedRelay: (url) => set({ selectedRelay: url }),

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Language actions
      setLanguage: (language) => set({ language }),

      // Notification actions
      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      // Privacy actions
      updatePrivacy: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      // General actions
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'voces-settings',
      version: 1,
    }
  )
);