let showModal = $state(false);

export const createListingModal = {
  get show() { return showModal; },
  set show(value: boolean) { showModal = value; },
  open() {
    showModal = true;
  },
  close() {
    showModal = false;
  }
};
