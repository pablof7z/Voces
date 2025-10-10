interface RelayAuthRequest {
  relayUrl: string;
  onConfirm: () => void;
  onReject: () => void;
}

class RelayAuthModalStore {
  show = $state(false);
  request = $state<RelayAuthRequest | null>(null);

  open(request: RelayAuthRequest) {
    this.request = request;
    this.show = true;
  }

  confirm() {
    if (this.request) {
      this.request.onConfirm();
      this.close();
    }
  }

  reject() {
    if (this.request) {
      this.request.onReject();
      this.close();
    }
  }

  close() {
    this.show = false;
    this.request = null;
  }
}

export const relayAuthModal = new RelayAuthModalStore();
