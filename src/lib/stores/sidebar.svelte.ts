import type { Snippet } from 'svelte';

class SidebarStore {
  private _rightSidebar = $state<Snippet | null>(null);

  get rightSidebar() {
    return this._rightSidebar;
  }

  set rightSidebar(sidebar: Snippet | null) {
    this._rightSidebar = sidebar;
  }

  clear() {
    this._rightSidebar = null;
  }
}

export const sidebarStore = new SidebarStore();
