class CreateListingModalStore {
  private _show = $state(false);

  get show() {
    return this._show;
  }

  open() {
    this._show = true;
  }

  close() {
    this._show = false;
  }
}

export const createListingModal = new CreateListingModalStore();
