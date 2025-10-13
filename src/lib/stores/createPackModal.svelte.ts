import type { NDKEvent } from '@nostr-dev-kit/ndk';

class CreatePackModalStore {
  private _show = $state(false);
  private _editingPack = $state<NDKEvent | null>(null);

  get show() {
    return this._show;
  }

  get editingPack() {
    return this._editingPack;
  }

  open(packEvent?: NDKEvent) {
    this._editingPack = packEvent || null;
    this._show = true;
  }

  close() {
    this._show = false;
    this._editingPack = null;
  }
}

export const createPackModal = new CreatePackModalStore();
