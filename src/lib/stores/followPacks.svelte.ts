interface FollowPacksState {
  subscribedPacks: string[];
  favoritePacks: string[];
}

function loadState(): FollowPacksState {
  if (typeof window === 'undefined') {
    return { subscribedPacks: [], favoritePacks: [] };
  }

  try {
    const stored = localStorage.getItem('follow-packs-storage');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load follow packs state:', e);
  }

  return { subscribedPacks: [], favoritePacks: [] };
}

function saveState(state: FollowPacksState) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('follow-packs-storage', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save follow packs state:', e);
  }
}

class FollowPacksStore {
  private state = $state<FollowPacksState>(loadState());

  get subscribedPacks() {
    return this.state.subscribedPacks;
  }

  get favoritePacks() {
    return this.state.favoritePacks;
  }

  isSubscribed(packId: string): boolean {
    return this.state.subscribedPacks.includes(packId);
  }

  isFavorite(packId: string): boolean {
    return this.state.favoritePacks.includes(packId);
  }

  subscribeToPack(packId: string) {
    if (!this.state.subscribedPacks.includes(packId)) {
      this.state.subscribedPacks = [...this.state.subscribedPacks, packId];
      saveState(this.state);
    }
  }

  unsubscribeFromPack(packId: string) {
    this.state.subscribedPacks = this.state.subscribedPacks.filter(id => id !== packId);
    saveState(this.state);
  }

  toggleFavorite(packId: string) {
    if (this.state.favoritePacks.includes(packId)) {
      this.state.favoritePacks = this.state.favoritePacks.filter(id => id !== packId);
    } else {
      this.state.favoritePacks = [...this.state.favoritePacks, packId];
    }
    saveState(this.state);
  }
}

export const followPacksStore = new FollowPacksStore();
