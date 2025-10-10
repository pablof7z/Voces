import type { Snippet } from 'svelte';

interface SidebarState {
  rightSidebar: Snippet | null;
}

function createSidebarStore() {
  let state = $state<SidebarState>({
    rightSidebar: null
  });

  return {
    get rightSidebar() {
      return state.rightSidebar;
    },
    set rightSidebar(sidebar: Snippet | null) {
      state.rightSidebar = sidebar;
    },
    clear() {
      state.rightSidebar = null;
    }
  };
}

export const sidebarStore = createSidebarStore();
