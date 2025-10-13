import { browser } from '$app/environment';

// Type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Detect if we're running on iOS
function isIOS(): boolean {
  if (!browser) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

// Detect if we're running on Android
function isAndroid(): boolean {
  if (!browser) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

// Detect if app is running in standalone mode (installed as PWA)
function isStandalone(): boolean {
  if (!browser) return false;

  // Check for iOS standalone mode
  if ('standalone' in window.navigator) {
    return (window.navigator as any).standalone === true;
  }

  // Check for Android/Chrome standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check for fullscreen mode
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }

  return false;
}

// Detect if running on mobile
function isMobile(): boolean {
  if (!browser) return false;

  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    window.navigator.userAgent.toLowerCase()
  );
}

// PWA Store
class PWAStore {
  // State
  deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
  isInstallable = $state(false);
  isInstalled = $state(false);
  isIOSDevice = $state(false);
  isAndroidDevice = $state(false);
  isMobileDevice = $state(false);
  showPrompt = $state(false);
  userDismissed = $state(false);
  neverAskAgain = $state(false);

  constructor() {
    if (!browser) return;

    // Initialize platform detection
    this.isIOSDevice = isIOS();
    this.isAndroidDevice = isAndroid();
    this.isMobileDevice = isMobile();
    this.isInstalled = isStandalone();

    // Load user preferences from localStorage
    this.loadPreferences();

    // Don't show prompt if already installed
    if (this.isInstalled) {
      this.showPrompt = false;
      return;
    }

    // Listen for beforeinstallprompt event (Android Chrome, Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Stash the event so it can be triggered later
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.isInstallable = true;

      // Show prompt after a delay if user hasn't dismissed it
      if (!this.neverAskAgain && !this.userDismissed) {
        setTimeout(() => {
          this.showPrompt = true;
        }, 10000); // Show after 10 seconds
      }
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.isInstallable = false;
      this.showPrompt = false;
      this.deferredPrompt = null;

      console.log('PWA was installed successfully');
    });

    // For iOS, we can't detect beforeinstallprompt, so show iOS-specific prompt
    if (this.isIOSDevice && !this.isInstalled && !this.neverAskAgain) {
      setTimeout(() => {
        this.showPrompt = true;
      }, 10000);
    }
  }

  // Prompt user to install the app
  async promptInstall(): Promise<void> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    // Show the install prompt
    await this.deferredPrompt.prompt();

    // Wait for user choice
    const choiceResult = await this.deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      this.isInstalled = true;
    } else {
      console.log('User dismissed the install prompt');
      this.userDismissed = true;
      this.savePreferences();
    }

    // Clear the deferred prompt
    this.deferredPrompt = null;
    this.isInstallable = false;
    this.showPrompt = false;
  }

  // Dismiss the install prompt temporarily
  dismiss(): void {
    this.showPrompt = false;
    this.userDismissed = true;
    this.savePreferences();
  }

  // Dismiss and never ask again
  dismissForever(): void {
    this.showPrompt = false;
    this.neverAskAgain = true;
    this.userDismissed = true;
    this.savePreferences();
  }

  // Reset user preferences (for debugging)
  reset(): void {
    this.userDismissed = false;
    this.neverAskAgain = false;
    this.showPrompt = false;
    this.savePreferences();
  }

  // Save preferences to localStorage
  private savePreferences(): void {
    if (!browser) return;

    try {
      localStorage.setItem('pwa-user-dismissed', JSON.stringify(this.userDismissed));
      localStorage.setItem('pwa-never-ask', JSON.stringify(this.neverAskAgain));
    } catch (err) {
      console.error('Failed to save PWA preferences:', err);
    }
  }

  // Load preferences from localStorage
  private loadPreferences(): void {
    if (!browser) return;

    try {
      const dismissed = localStorage.getItem('pwa-user-dismissed');
      const neverAsk = localStorage.getItem('pwa-never-ask');

      if (dismissed !== null) {
        this.userDismissed = JSON.parse(dismissed);
      }

      if (neverAsk !== null) {
        this.neverAskAgain = JSON.parse(neverAsk);
      }
    } catch (err) {
      console.error('Failed to load PWA preferences:', err);
    }
  }
}

// Export singleton instance
export const pwaStore = new PWAStore();
