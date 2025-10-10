import type { NDKEvent } from '@nostr-dev-kit/ndk';

let showModal = $state(false);
let editingPack = $state<NDKEvent | null>(null);

export const createPackModal = {
  get show() { return showModal; },
  set show(value: boolean) { showModal = value; },
  get editingPack() { return editingPack; },
  open(packEvent?: NDKEvent) {
    editingPack = packEvent || null;
    showModal = true;
  },
  close() {
    showModal = false;
    editingPack = null;
  }
};
