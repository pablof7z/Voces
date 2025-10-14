import { createModalStore } from './modalFactory.svelte';

interface RelayAuthRequest {
  relayUrl: string;
  onConfirm: () => void;
  onReject: () => void;
}

const baseModal = createModalStore<RelayAuthRequest>();

export const relayAuthModal = {
  get show() {
    return baseModal.show;
  },
  get request() {
    return baseModal.data;
  },
  open(request: RelayAuthRequest) {
    baseModal.open(request);
  },
  confirm() {
    if (baseModal.data) {
      baseModal.data.onConfirm();
      baseModal.close();
    }
  },
  reject() {
    if (baseModal.data) {
      baseModal.data.onReject();
      baseModal.close();
    }
  },
  close() {
    baseModal.close();
  }
};
